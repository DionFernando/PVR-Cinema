// lib/showtimeService.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Showtime } from "./types";

/** Helpers */
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDaysYMD(baseYmd: string, days: number) {
  const [y, m, d] = baseYmd.split("-").map((n) => Number(n));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return ymd(dt);
}
function isPast(dateStr: string, timeStr: string) {
  const now = new Date();
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt.getTime() < now.getTime();
}

/** CRUD */
export async function createShowtime(input: {
  movieId: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  priceMap: { Classic: number; Prime: number; Superior: number };
}) {
  const ref = await addDoc(collection(db, "showtimes"), {
    movieId: input.movieId,
    date: input.date,
    startTime: input.startTime,
    priceMap: input.priceMap,
    seatsReserved: [],
  });
  return ref.id;
}

/** Create 7 days starting from startDate (inclusive). Skips past/today-past and duplicates. */
export async function createShowtimesBulk(input: {
  movieId: string;
  startDate: string;    // YYYY-MM-DD
  startTime: string;    // HH:mm
  days?: number;        // default 7
  priceMap: { Classic: number; Prime: number; Superior: number };
}): Promise<{ created: number; skipped: number }> {
  const days = input.days ?? 7;
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < days; i++) {
    const date = addDaysYMD(input.startDate, i);

    // Skip if showtime is in the past (including today with past time)
    if (isPast(date, input.startTime)) {
      skipped++;
      continue;
    }

    // Skip duplicates (same movieId + date + time)
    const qRef = query(
      collection(db, "showtimes"),
      where("movieId", "==", input.movieId),
      where("date", "==", date),
      where("startTime", "==", input.startTime)
    );
    const snap = await getDocs(qRef);
    if (!snap.empty) {
      skipped++;
      continue;
    }

    await addDoc(collection(db, "showtimes"), {
      movieId: input.movieId,
      date,
      startTime: input.startTime,
      priceMap: input.priceMap,
      seatsReserved: [],
    });
    created++;
  }

  return { created, skipped };
}

export async function updateShowtime(id: string, patch: Partial<Showtime>) {
  const ref = doc(db, "showtimes", id);
  await updateDoc(ref, patch as any);
}

export async function removeShowtime(id: string) {
  await deleteDoc(doc(db, "showtimes", id));
}

export async function getShowtime(id: string): Promise<Showtime | null> {
  const snap = await getDoc(doc(db, "showtimes", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Showtime, "id">) };
}

export async function listShowtimes(): Promise<Showtime[]> {
  const snap = await getDocs(collection(db, "showtimes"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Showtime, "id">) }));
}

export async function listShowtimesByMovie(movieId: string): Promise<Showtime[]> {
  const qRef = query(collection(db, "showtimes"), where("movieId", "==", movieId));
  const snap = await getDocs(qRef);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Showtime, "id">) }));
}
