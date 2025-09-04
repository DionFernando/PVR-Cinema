import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getOrCreateUserId } from "../../lib/authUser";
import { listBookingsByUser } from "../../lib/bookingService";
import { listMovies } from "../../lib/movieService";
import { listShowtimes } from "../../lib/showtimeService";
import type { Booking, Movie, Showtime } from "../../lib/types";

function toDateTime(st?: Showtime) {
  if (!st) return 0;
  const iso = `${st.date}T${st.startTime}:00`;
  return new Date(iso).getTime();
}

export default function Tickets() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [moviesMap, setMoviesMap] = useState<Record<string, Movie>>({});
  const [showtimesMap, setShowtimesMap] = useState<Record<string, Showtime>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const uid = await getOrCreateUserId();
        const [bs, ms, sts] = await Promise.all([
          listBookingsByUser(uid),
          listMovies(),
          listShowtimes(),
        ]);
        setBookings(bs);
        setMoviesMap(Object.fromEntries(ms.map((m) => [m.id, m])));
        setShowtimesMap(Object.fromEntries(sts.map((s) => [s.id, s])));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = Date.now();
  const upcoming = useMemo(
    () => bookings.filter((b) => toDateTime(showtimesMap[b.showtimeId]) >= now),
    [bookings, showtimesMap, now]
  );
  const past = useMemo(
    () => bookings.filter((b) => toDateTime(showtimesMap[b.showtimeId]) < now),
    [bookings, showtimesMap, now]
  );

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop:8 }}>Loading tickets…</Text>
      </View>
    );
  }

  const Item = ({ b }: { b: Booking }) => {
    const mv = moviesMap[b.movieId];
    const st = showtimesMap[b.showtimeId];
    return (
      <View style={{ padding:12, borderWidth:1, borderColor:"#ddd", borderRadius:8, marginBottom:12 }}>
        <Text style={{ fontWeight:"700" }}>{mv?.title ?? "(movie)"}</Text>
        <Text style={{ color:"#555", marginTop:4 }}>
          {st?.date} · {st?.startTime} · {b.seatType}
        </Text>
        <Text style={{ marginTop:6 }}>Seats: {b.seats.join(", ")}</Text>
        <Text>Total: {b.total}</Text>
        <Text style={{ marginTop:4, color:"#888" }}>Status: {b.status}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"700" }}>My Tickets</Text>

      <Text style={{ marginTop:12, fontWeight:"600" }}>Upcoming</Text>
      {upcoming.length ? (
        <FlatList
          data={upcoming}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <Item b={item} />}
        />
      ) : (
        <Text style={{ color:"#666", marginTop:6 }}>No upcoming tickets.</Text>
      )}

      <Text style={{ marginTop:18, fontWeight:"600" }}>Past</Text>
      {past.length ? (
        <FlatList
          data={past}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <Item b={item} />}
        />
      ) : (
        <Text style={{ color:"#666", marginTop:6 }}>No past tickets.</Text>
      )}
    </View>
  );
}
