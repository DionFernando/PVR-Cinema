import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { listShowtimes, removeShowtime } from "../../../lib/showtimeService";
import { listMovies } from "../../../lib/movieService";
import type { Showtime, Movie } from "../../../lib/types";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminShowtimes() {
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movieMap, setMovieMap] = useState<Record<string, Movie>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [sts, ms] = await Promise.all([listShowtimes(), listMovies()]);
      setShowtimes(sts);
      setMovieMap(Object.fromEntries(ms.map((m) => [m.id, m])));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const today = ymd(new Date());
  const upcoming = useMemo(() => showtimes.filter((s) => s.date >= today), [showtimes, today]);
  const past = useMemo(() => showtimes.filter((s) => s.date < today), [showtimes, today]);

  const Row = ({ item }: { item: Showtime }) => {
    const movie = movieMap[item.movieId];
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(admin)/showtimes/[showtimeId]/edit",
            params: { showtimeId: String(item.id) },
          })
        }
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: "#e7e8ea",
          borderRadius: 12,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontWeight: "700", color: "#111" }}>
          {movie?.title ?? "(unknown movie)"}
        </Text>
        <Text style={{ color: "#555", marginTop: 4 }}>
          {item.date} · {item.startTime} · Classic {item.priceMap.Classic} | Prime {item.priceMap.Prime} | Superior {item.priceMap.Superior}
        </Text>
        <Text style={{ color: "#777", marginTop: 4, fontSize: 12 }}>
          Reserved seats: {item.seatsReserved.length}
        </Text>

        <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
          <Link
            href={{ pathname: "/(admin)/showtimes/[showtimeId]/edit", params: { showtimeId: String(item.id) } }}
            style={{ color: "#0b79ff", fontWeight: "600" }}
          >
            Edit
          </Link>
          <TouchableOpacity
            onPress={async () => {
              await removeShowtime(item.id);
              await load();
            }}
          >
            <Text style={{ color: "#c62828", fontWeight: "600" }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#222" }}>Loading showtimes…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sections = [
    { key: "upcoming", title: `Upcoming (${upcoming.length})`, data: upcoming },
    { key: "past", title: `Past (${past.length})`, data: past },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "#fff",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Admin · Showtimes</Text>
              <Link href="/(admin)/movies" style={{ color: "#0b79ff", fontWeight: "700" }}>
                Movies
              </Link>
            </View>

            <View style={{ marginTop: 8 }}>
              <Link href="/(admin)/showtimes/new" style={{ color: "#0b79ff", fontWeight: "800" }}>
                + New Showtime
              </Link>
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <Row item={item} />
          </View>
        )}
        SectionSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}
