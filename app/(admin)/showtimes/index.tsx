import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { listShowtimes } from "../../../lib/showtimeService";
import { listMovies } from "../../../lib/movieService";
import type { Showtime, Movie } from "../../../lib/types";
import { Link } from "expo-router";

export default function AdminShowtimes() {
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movieMap, setMovieMap] = useState<Record<string, Movie>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [sts, ms] = await Promise.all([listShowtimes(), listMovies()]);
      setShowtimes(sts);
      setMovieMap(Object.fromEntries(ms.map(m => [m.id, m])));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop:8 }}>Loading showtimes…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:"600" }}>Admin · Showtimes</Text>

      <Link href="/(admin)/showtimes/new" style={{ color:"dodgerblue", marginVertical:8 }}>
        + New Showtime
      </Link>

      <FlatList
        data={showtimes}
        keyExtractor={(s) => s.id}
        ItemSeparatorComponent={() => <View style={{ height:12 }} />}
        renderItem={({ item }) => {
          const movie = movieMap[item.movieId];
          return (
            <TouchableOpacity style={{ padding:12, borderWidth:1, borderColor:"#ddd", borderRadius:8 }}>
              <Text style={{ fontWeight:"600" }}>{movie?.title ?? "(unknown movie)"}</Text>
              <Text style={{ color:"#555", marginTop:4 }}>
                {item.date} · {item.startTime} · Classic {item.priceMap.Classic} | Prime {item.priceMap.Prime} | Superior {item.priceMap.Superior}
              </Text>
              <Text style={{ color:"#888", marginTop:4 }}>
                Reserved seats: {item.seatsReserved.length}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
