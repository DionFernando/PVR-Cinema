import {
  collection, addDoc, getDocs, getDoc, doc, query, where, orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type { Showtime } from "./types";

const SHOWTIMES = "showtimes";

export async function createShowtime(payload: Omit<Showtime, "id"|"createdAt"|"seatsReserved">) {
  const body = {
    ...payload,
    seatsReserved: [] as string[],
    createdAt: serverTimestamp(),
  };
  return addDoc(collection(db, SHOWTIMES), body);
}

export async function listShowtimes(): Promise<Showtime[]> {
  const q = query(collection(db, SHOWTIMES), orderBy("date", "asc"), orderBy("startTime", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Showtime, "id">) }));
}

export async function listShowtimesByMovie(movieId: string): Promise<Showtime[]> {
  const q = query(
    collection(db, SHOWTIMES),
    where("movieId", "==", movieId),
    orderBy("date", "asc"),
    orderBy("startTime", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Showtime, "id">) }));
}

export async function getShowtime(id: string): Promise<Showtime | null> {
  const ref = doc(db, SHOWTIMES, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Showtime, "id">) };
}
