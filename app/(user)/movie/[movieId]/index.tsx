import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { getMovie } from "../../../../lib/movieService";
import type { Movie } from "../../../../lib/types";
import { toSafeImageUri } from "../../../../utils/url";
import { POSTER_FALLBACK } from "../../../../lib/constants";

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
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop:8 }}>Loading…</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding:16 }}>
        <Text>Movie not found.</Text>
      </View>
    );
  }

  const uri = toSafeImageUri(movie.posterUrl) || POSTER_FALLBACK;
  const rel = movie.releaseDate?.toDate?.();

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Image source={{ uri }} style={{ width: "100%", height: 360, borderRadius: 12, backgroundColor:"#eee" }} resizeMode="cover" />
      <Text style={{ fontSize:22, fontWeight:"700" }}>{movie.title}</Text>
      {rel && (
        <Text style={{ color:"#666" }}>
          Release: {rel.getFullYear()}-{String(rel.getMonth()+1).padStart(2,"0")}-{String(rel.getDate()).padStart(2,"0")} · {movie.durationMins} mins
        </Text>
      )}
      <Text style={{ color:"#444", lineHeight:20 }}>{movie.description}</Text>

      <Link
        href={{ pathname: "/(user)/movie/[movieId]/select", params: { movieId: String(movieId) } }}
        style={{ marginTop:16, padding:14, textAlign:"center", borderWidth:1, borderRadius:8, borderColor:"#333", backgroundColor:"#111", color:"#fff" }}
      >
        Book Now
      </Link>
    </ScrollView>
  );
}
