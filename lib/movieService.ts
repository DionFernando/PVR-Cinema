import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc,
  serverTimestamp, Timestamp, query, orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import type { Movie } from "./types";

const MOVIES = "movies";

export async function listMovies(): Promise<Movie[]> {
  const q = query(collection(db, MOVIES), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Movie) }));
}

export async function getMovie(id: string): Promise<Movie | null> {
  const ref = doc(db, MOVIES, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Movie) };
}

export async function createMovie(payload: Omit<Movie, "id"|"createdAt">) {
  return addDoc(collection(db, MOVIES), { ...payload, createdAt: serverTimestamp() });
}

export async function updateMovie(id: string, payload: Partial<Omit<Movie, "id">>) {
  const ref = doc(db, MOVIES, id);
  await updateDoc(ref, payload);
}

export async function removeMovie(id: string) {
  const ref = doc(db, MOVIES, id);
  await deleteDoc(ref);
}

/** helper: convert 'YYYY-MM-DD' to Firestore Timestamp */
export function dateStringToTimestamp(s: string): Timestamp {
  return Timestamp.fromDate(new Date(`${s}T00:00:00`));
}
