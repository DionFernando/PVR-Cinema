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
import type { Booking, Showtime } from "./types";

/**
 * Atomically locks seats on the showtime and creates a booking.
 * Throws if any selected seat got taken meanwhile.
 */
export async function createBookingWithSeatLock(params: {
  userId: string;
  showtimeId: string;
  movieId: string;
  seats: string[];
  seatType: "Classic" | "Prime" | "Superior";
  total: number;
}): Promise<string> {
  const { userId, showtimeId, movieId, seats, seatType, total } = params;

  const showRef = doc(db, "showtimes", showtimeId);
  const bookingCol = collection(db, "bookings");

  const bookingId = await runTransaction(db, async (tx) => {
    const showSnap = await tx.get(showRef);
    if (!showSnap.exists()) {
      throw new Error("Showtime not found");
    }
    const show = showSnap.data() as Showtime;
    const reserved: string[] = Array.isArray(show.seatsReserved) ? show.seatsReserved : [];

    // Any conflicts?
    const conflicting = seats.filter((s) => reserved.includes(s));
    if (conflicting.length) {
      throw new Error(`Seat(s) already reserved: ${conflicting.join(", ")}`);
    }

    // Lock seats
    const newReserved = [...reserved, ...seats];
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
    } satisfies Omit<Booking, "id">);

    return newBookingRef.id;
  });

  return bookingId;
}

export async function listBookingsByUser(userId: string) {
  const qRef = query(collection(db, "bookings"), where("userId", "==", userId));
  const snap = await getDocs(qRef);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }));
}
