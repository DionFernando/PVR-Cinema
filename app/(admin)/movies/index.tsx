import { useEffect, useMemo, useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { listMovies, removeMovie } from "../../../lib/movieService";
import type { Movie } from "../../../lib/types";
import { POSTER_FALLBACK } from "../../../lib/constants";
import { toSafeImageUri } from "../../../utils/url";
import { listShowtimesByMovie } from "../../../lib/showtimeService";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../store/AuthProvider";

export default function AdminMovies() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [q, setQ] = useState("");

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

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? movies.filter(m => m.title.toLowerCase().includes(s)) : movies;
  }, [movies, q]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#222" }}>Loading movies…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const Card = ({ item }: { item: Movie }) => {
    const uri = toSafeImageUri(item.posterUrl) || POSTER_FALLBACK;
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          padding: 12,
          borderWidth: 1,
          borderColor: "#e7e8ea",
          borderRadius: 12,
          backgroundColor: "#fff",
        }}
      >
        <Image
          source={{ uri }}
          style={{ width: 64, height: 96, borderRadius: 8, backgroundColor: "#eceff1" }}
          resizeMode="cover"
        />

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>{item.title}</Text>
          <Text numberOfLines={2} style={{ color: "#555", marginTop: 2 }}>{item.description}</Text>
          <Text style={{ color: "#777", marginTop: 4, fontSize: 12 }}>
            Duration: {item.durationMins} mins
          </Text>

          {/* Actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 8 }}>
            <Link
              href={{ pathname: "/(admin)/movies/[movieId]/edit", params: { movieId: String(item.id) } }}
              style={{ color: "#0b79ff", fontWeight: "600" }}
            >
              Edit
            </Link>

            <Link
              href={{ pathname: "/(admin)/showtimes/new", params: { movieId: String(item.id) } }}
              style={{ color: "#0b79ff", fontWeight: "600" }}
            >
              Add Showtime
            </Link>

            <TouchableOpacity
              onPress={async () => {
                const sts = await listShowtimesByMovie(item.id);
                if (sts.length) {
                  Alert.alert("Cannot delete", "This movie has showtimes. Delete those first.");
                  return;
                }
                await removeMovie(item.id);
                await load();
              }}
            >
              <Text style={{ color: "#c62828", fontWeight: "600" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      {/* Utility bar */}
      <View
        style={{
          paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
          borderBottomWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#111" }}>Admin · Movies</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Link href="/(admin)/showtimes" style={{ color: "#0b79ff", fontWeight: "700" }}>Showtimes</Link>
            <TouchableOpacity onPress={logout}>
              <Text style={{ color: "#c62828", fontWeight: "700" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8,
            borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb",
            borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
          }}
        >
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search movies…"
            placeholderTextColor="#999"
            style={{ flex: 1, color: "#111" }}
          />
          <Link href="/(admin)/movies/new" style={{ color: "#0b79ff", fontWeight: "800" }}>
            + New
          </Link>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <Card item={item} />}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#777" }}>No movies.</Text>}
      />
    </SafeAreaView>
  );
}
