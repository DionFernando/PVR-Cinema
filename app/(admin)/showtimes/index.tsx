// app/(admin)/showtimes/index.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { listShowtimes, removeShowtime } from "../../../lib/showtimeService";
import { listMovies } from "../../../lib/movieService";
import type { Showtime, Movie } from "../../../lib/types";
import { Picker } from "@react-native-picker/picker";
import AdminHeader from "../../../components/AdminHeader";

export default function AdminShowtimes() {
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filterMovieId, setFilterMovieId] = useState<string>("all");

  const movieMap = useMemo(() => Object.fromEntries(movies.map((m) => [m.id, m])), [movies]);

  const load = async () => {
    setLoading(true);
    try {
      const [sts, ms] = await Promise.all([listShowtimes(), listMovies()]);
      sts.sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));
      setShowtimes(sts);
      setMovies(ms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => (filterMovieId === "all" ? showtimes : showtimes.filter((s) => s.movieId === filterMovieId)),
    [showtimes, filterMovieId]
  );

  const confirmDelete = (item: Showtime) => {
    const title = movieMap[item.movieId]?.title ?? "this showtime";
    Alert.alert(
      "Delete showtime",
      `Are you sure you want to delete "${title}" on ${item.date} at ${item.startTime}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => { await removeShowtime(item.id); await load(); } },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
        <AdminHeader title="Showtimes" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading showtimes…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <AdminHeader title="Showtimes" />

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <View style={{ padding: 16, gap: 12 }}>
            {/* Filter row */}
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#333", marginBottom: 6 }}>Filter by Movie</Text>
                <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" }}>
                  <Picker
                    selectedValue={filterMovieId}
                    onValueChange={(v) => setFilterMovieId(String(v))}
                    dropdownIconColor="#111"
                    style={{ color: "#111" }}
                  >
                    <Picker.Item label="All movies" value="all" />
                    {movies.map((m) => (
                      <Picker.Item key={m.id} label={m.title} value={m.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <Link
                href="/(admin)/showtimes/new"
                style={{
                  backgroundColor: "#111",
                  color: "#fff",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  fontWeight: "700",
                }}
              >
                + New
              </Link>
            </View>

            <Text style={{ color: "#666" }}>
              {filterMovieId === "all"
                ? `Total: ${filtered.length}`
                : `Total for "${movieMap[filterMovieId]?.title ?? ""}": ${filtered.length}`}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => {
          const movie = movieMap[item.movieId];
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/(admin)/showtimes/[showtimeId]/edit", params: { showtimeId: String(item.id) } })
              }
              style={{ padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" }}
            >
              <Text style={{ fontWeight: "700", color: "#111" }}>{movie?.title ?? "(unknown movie)"}</Text>
              <Text style={{ color: "#555", marginTop: 4 }}>
                {item.date} · {item.startTime}
              </Text>
              <Text style={{ color: "#666", marginTop: 6 }}>
                Classic {item.priceMap.Classic} • Prime {item.priceMap.Prime} • Superior {item.priceMap.Superior}
              </Text>
              <Text style={{ color: "#888", marginTop: 4, fontSize: 12 }}>
                Reserved seats: {item.seatsReserved.length}
              </Text>

              <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                <Link
                  href={{ pathname: "/(admin)/showtimes/[showtimeId]/edit", params: { showtimeId: String(item.id) } }}
                  style={{ color: "#2563eb", fontWeight: "700" }}
                >
                  Edit
                </Link>
                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Text style={{ color: "#dc2626", fontWeight: "700" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<View style={{ padding: 16 }}><Text style={{ color: "#666" }}>No showtimes found.</Text></View>}
      />
    </SafeAreaView>
  );
}
