// lib/bookingService.ts
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Booking, Showtime, SeatType } from "./types";

/** Local helper – treat "YYYY-MM-DD" + "HH:mm" as a Date and compare to now */
function isPast(dateStr: string, timeStr: string) {
  const now = new Date();
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt.getTime() < now.getTime();
}

/**
 * Atomically locks seats on the showtime and creates a booking.
 * Throws if any selected seat got taken meanwhile (or the showtime is past).
 */
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
    if (!showSnap.exists()) {
      throw new Error("Showtime not found");
    }

    const show = showSnap.data() as Showtime;

    // Defense-in-depth: block if showtime is already past
    if (isPast(show.date, show.startTime)) {
      throw new Error("This showtime has already passed");
    }

    const reserved: string[] = Array.isArray(show.seatsReserved)
      ? show.seatsReserved
      : [];

    // Any conflicts?
    const reservedSet = new Set(reserved);
    const conflicting = seats.filter((s) => reservedSet.has(s));
    if (conflicting.length) {
      throw new Error(`Seat(s) already reserved: ${conflicting.join(", ")}`);
    }

    // Lock seats (ensure uniqueness)
    const newReserved = Array.from(new Set([...reserved, ...seats]));
    tx.update(showRef, { seatsReserved: newReserved });

    // Create booking doc in the same transaction
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
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Booking, "id">),
  }));
}
