// lib/types.ts
import type { Timestamp, FieldValue } from "firebase/firestore";

export type Movie = {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  releaseDate: Timestamp;                  // stored as Timestamp
  durationMins: number;
  createdAt?: Timestamp | FieldValue;      // allow serverTimestamp() during writes
};

export type Showtime = {
  id: string;
  movieId: string;
  date: string;                            // "YYYY-MM-DD"
  startTime: string;                       // "HH:mm"
  priceMap: {
    Classic: number;
    Prime: number;
    Superior: number;
  };
  seatsReserved: string[];                 // ["A1","A2",...]
  createdAt?: Timestamp | FieldValue;      // allow serverTimestamp()
};

export type Booking = {
  id: string;
  userId: string;
  showtimeId: string;
  movieId: string;
  seats: string[];
  seatType: "Classic" | "Prime" | "Superior";
  total: number;
  status: "paid" | "cancelled";
  createdAt?: Timestamp | FieldValue;      // allow serverTimestamp()
};

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: Timestamp | FieldValue;
};
