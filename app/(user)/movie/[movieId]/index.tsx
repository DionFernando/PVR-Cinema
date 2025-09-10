import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { getMovie } from "../../../../lib/movieService";
import type { Movie } from "../../../../lib/types";
import { toSafeImageUri } from "../../../../utils/url";
import { POSTER_FALLBACK } from "../../../../lib/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../../../../lib/theme";

export default function MovieDetails() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (movieId) {
          const m = await getMovie(String(movieId));
          setMovie(m);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [movieId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ marginTop: 8, color: colors.text }}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <Text style={{ color: colors.text }}>Movie not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const uri = toSafeImageUri(movie.posterUrl) || POSTER_FALLBACK;
  const rel = movie.releaseDate?.toDate?.();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Image
          source={{ uri }}
          style={{ width: "100%", height: 360, borderRadius: radius.md, backgroundColor: "#1a1a1a" }}
          resizeMode="cover"
        />
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{movie.title}</Text>
        {rel && (
          <Text style={{ color: colors.textMuted }}>
            Release: {rel.getFullYear()}-{String(rel.getMonth() + 1).padStart(2, "0")}-
            {String(rel.getDate()).padStart(2, "0")} · {movie.durationMins} mins
          </Text>
        )}
        <Text style={{ color: colors.text, opacity: 0.9, lineHeight: 20 }}>{movie.description}</Text>

        <Link
          href={{ pathname: "/(user)/movie/[movieId]/select", params: { movieId: String(movieId) } }}
          style={{
            marginTop: spacing.lg,
            padding: 14,
            textAlign: "center",
            borderWidth: 1,
            borderRadius: radius.md,
            borderColor: colors.accent,
            backgroundColor: colors.accent,
            color: colors.accentText,
            fontWeight: "800",
          }}
        >
          Book Now
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
