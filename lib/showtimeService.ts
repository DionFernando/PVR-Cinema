// lib/showtimeService.ts
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Showtime } from "./types";

const SHOWTIMES = "showtimes";

/** Create a showtime */
export async function createShowtime(
  payload: Omit<Showtime, "id" | "createdAt" | "seatsReserved">
) {
  // Duplicate guard
  const dupQ = query(
    collection(db, SHOWTIMES),
    where("movieId", "==", payload.movieId),
    where("date", "==", payload.date),
    where("startTime", "==", payload.startTime)
  );
  const dupSnap = await getDocs(dupQ);
  if (!dupSnap.empty) {
    throw new Error("A showtime for this movie at the same date & time already exists.");
  }

  const body = { ...payload, seatsReserved: [] as string[], createdAt: serverTimestamp() };
  return addDoc(collection(db, SHOWTIMES), body);
}


/** List all showtimes (sorted in JS by date then time) */
export async function listShowtimes(): Promise<Showtime[]> {
  const snap = await getDocs(collection(db, SHOWTIMES));
  const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Showtime, "id">) }));
  data.sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));
  return data;
}

/** List showtimes for a movie (sorted in JS) */
export async function listShowtimesByMovie(movieId: string): Promise<Showtime[]> {
  const qRef = query(collection(db, SHOWTIMES), where("movieId", "==", movieId));
  const snap = await getDocs(qRef);
  const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Showtime, "id">) }));
  data.sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));
  return data;
}

/** Get one showtime */
export async function getShowtime(id: string): Promise<Showtime | null> {
  const ref = doc(db, SHOWTIMES, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Showtime, "id">) };
}

/** Update a showtime */
export async function updateShowtime(
  id: string,
  payload: Partial<Omit<Showtime, "id">>
) {
  const ref = doc(db, SHOWTIMES, id);
  await updateDoc(ref, payload);
}

/** Delete a showtime */
export async function removeShowtime(id: string) {
  const ref = doc(db, SHOWTIMES, id);
  await deleteDoc(ref);
}
