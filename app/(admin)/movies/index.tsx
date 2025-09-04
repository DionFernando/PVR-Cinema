// app/(admin)/movies/index.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { listMovies, removeMovie } from "../../../lib/movieService";
import type { Movie } from "../../../lib/types";

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

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading movies…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Admin · Movies</Text>

      <Link href="/(admin)/movies/new" style={{ color: "dodgerblue", marginVertical: 8 }}>
        + New Movie
      </Link>

      <FlatList
        data={movies}
        keyExtractor={(m) => m.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              padding: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
            }}
          >
            <Image
              source={{ uri: item.posterUrl }}
              style={{ width: 60, height: 90, borderRadius: 6, backgroundColor: "#eee" }}
            />

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
              <Text numberOfLines={2} style={{ color: "#555", marginTop: 4 }}>
                {item.description}
              </Text>

              {/* Quick actions */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                <Link
                  href={{
                    pathname: "/(admin)/movies/[movieId]/edit",
                    params: { movieId: String(item.id) },
                  }}
                  style={{ color: "dodgerblue" }}
                >
                  Edit
                </Link>

                <Link
                  href={{
                    pathname: "/(admin)/showtimes/new",
                    params: { movieId: String(item.id) },
                  }}
                  style={{ color: "dodgerblue" }}
                >
                  Add Showtime
                </Link>

                <TouchableOpacity
                  onPress={async () => {
                    await removeMovie(item.id);
                    await load();
                  }}
                >
                  <Text style={{ color: "crimson" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
