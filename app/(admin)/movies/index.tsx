// app/(admin)/movies/index.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { listMovies, removeMovie } from "../../../lib/movieService";
import type { Movie } from "../../../lib/types";
import { POSTER_FALLBACK } from "../../../lib/constants";
import { toSafeImageUri } from "../../../utils/url";
import { listShowtimesByMovie } from "../../../lib/showtimeService";
import AdminHeader from "../../../components/AdminHeader";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";


export default function AdminMovies() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listMovies();
      setMovies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirmDelete = async (m: Movie) => {
    const sts = await listShowtimesByMovie(m.id);
    if (sts.length) {
      Alert.alert("Cannot delete", "This movie has showtimes. Delete those first.");
      return;
    }
    Alert.alert(
      "Delete movie",
      `Are you sure you want to delete "${m.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => { await removeMovie(m.id); await load(); } },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
        <AdminHeader title="Movies" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading movies…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <AdminHeader title="Movies" />

      <View style={{ paddingHorizontal: 16, paddingTop: 12, flexDirection: "row", gap: 10 }}>
        {/* Showtimes (primary) */}
        <TouchableOpacity
          onPress={() => router.push("/(admin)/showtimes")}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 12,
            backgroundColor: "#2563eb",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="time-outline" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800" }}>Showtimes</Text>
        </TouchableOpacity>

        {/* New Movie (outline) */}
        <TouchableOpacity
          onPress={() => router.push("/(admin)/movies/new")}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 12,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#2563eb",
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#2563eb" />
          <Text style={{ color: "#2563eb", fontWeight: "800" }}>New Movie</Text>
        </TouchableOpacity>
      </View>


      <FlatList
        data={movies}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const uri = toSafeImageUri(item.posterUrl) || POSTER_FALLBACK;
          return (
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                padding: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 12,
                backgroundColor: "#fff",
              }}
            >
              <Image source={{ uri }} style={{ width: 60, height: 90, borderRadius: 6, backgroundColor: "#eee" }} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.title}</Text>
                <Text numberOfLines={2} style={{ color: "#555", marginTop: 4 }}>{item.description}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 }}>
                  <Link href={{ pathname: "/(admin)/movies/[movieId]/edit", params: { movieId: String(item.id) } }} style={{ color: "#2563eb", fontWeight: "700" }}>
                    Edit
                  </Link>
                  <Link href={{ pathname: "/(admin)/showtimes/new", params: { movieId: String(item.id) } }} style={{ color: "#2563eb", fontWeight: "700" }}>
                    Add Showtime
                  </Link>
                  <TouchableOpacity onPress={() => confirmDelete(item)}>
                    <Text style={{ color: "#dc2626", fontWeight: "700" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ color: "#666", paddingHorizontal: 16 }}>No movies found.</Text>}
      />
    </SafeAreaView>
  );
}
