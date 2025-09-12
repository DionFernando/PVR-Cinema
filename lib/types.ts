// lib/types.ts
import type { Timestamp, FieldValue } from "firebase/firestore";

export type SeatType = "Classic" | "Prime" | "Superior" | "Mixed";
export type BookingStatus = "paid" | "redeemed";  // <-- add this

export type Movie = {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  releaseDate: Timestamp;
  durationMins: number;
  createdAt?: Timestamp | FieldValue;
};

export type Showtime = {
  id: string;
  movieId: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  priceMap: { Classic: number; Prime: number; Superior: number };
  seatsReserved: string[];
  createdAt?: Timestamp | FieldValue;
};

export type Booking = {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  seats: string[];
  seatType: SeatType;
  total: number;
  status: BookingStatus; // "paid" -> "redeemed"
  createdAt?: any;
  redeemedAt?: any;
};

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: Timestamp | FieldValue;
};
