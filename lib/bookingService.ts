// lib/bookingService.ts
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
  query,
  where,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Booking, Showtime, SeatType } from "./types";

/** Helper: block past showtimes */
function isPast(dateStr: string, timeStr: string) {
  const now = new Date();
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt.getTime() < now.getTime();
}

/** Create booking + atomic seat lock */
export async function createBookingWithSeatLock(params: {
  userId: string;
  showtimeId: string;
  movieId: string;
  seats: string[];
  seatType: SeatType; // "Classic" | "Prime" | "Superior" | "Mixed"
  total: number;
}): Promise<string> {
  const { userId, showtimeId, movieId, seats, seatType, total } = params;
  if (!seats?.length) throw new Error("No seats selected");

  const showRef = doc(db, "showtimes", showtimeId);
  const bookingCol = collection(db, "bookings");

  const bookingId = await runTransaction(db, async (tx) => {
    const showSnap = await tx.get(showRef);
    if (!showSnap.exists()) throw new Error("Showtime not found");
    const show = showSnap.data() as Showtime;

    if (isPast(show.date, show.startTime)) {
      throw new Error("This showtime has already passed");
    }

    const reserved: string[] = Array.isArray(show.seatsReserved) ? show.seatsReserved : [];
    const rset = new Set(reserved);
    const conflicting = seats.filter((s) => rset.has(s));
    if (conflicting.length) throw new Error(`Seat(s) already reserved: ${conflicting.join(", ")}`);

    const newReserved = Array.from(new Set([...reserved, ...seats]));
    tx.update(showRef, { seatsReserved: newReserved });

    const newBookingRef = doc(bookingCol);
    tx.set(newBookingRef, {
      userId,
      showtimeId,
      movieId,
      seats,
      seatType,
      total,
      status: "paid",
      createdAt: serverTimestamp(),
    } as Omit<Booking, "id">);

    return newBookingRef.id;
  });

  return bookingId;
}

export async function listBookingsByUser(userId: string) {
  const qRef = query(collection(db, "bookings"), where("userId", "==", userId));
  const snap = await getDocs(qRef);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }));
}

/** NEW: fetch booking by id */
export async function getBookingById(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, "bookings", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Booking, "id">) };
}

/** NEW: mark as redeemed (used after scan/print) */
export async function markBookingRedeemed(id: string) {
  await updateDoc(doc(db, "bookings", id), {
    status: "redeemed",
    redeemedAt: serverTimestamp(),
  });
}
