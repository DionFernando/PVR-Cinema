import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { listMovies } from "../../lib/movieService";
import type { Movie } from "../../lib/types";
import { Link } from "expo-router";
import { POSTER_FALLBACK } from "../../lib/constants";

function isComingSoon(releaseMs: number) {
  const today = new Date(); today.setHours(0,0,0,0);
  return releaseMs > today.getTime();
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listMovies();
        setMovies(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? movies.filter(m => m.title.toLowerCase().includes(s)) : movies;
  }, [movies, q]);

  const comingSoon = filtered.filter(m => isComingSoon(m.releaseDate.toDate().getTime()));
  const showingNow = filtered.filter(m => !isComingSoon(m.releaseDate.toDate().getTime()));

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop:8 }}>Loading…</Text>
      </View>
    );
  }

  const Card = ({ item }: { item: Movie }) => {
  const uri = item.posterUrl?.startsWith("http")
    ? encodeURI(item.posterUrl)
    : POSTER_FALLBACK;

  return (
    <View style={{ width: 220, marginRight: 12 }}>
      <Image
        source={{ uri }}
        style={{ width: 220, height: 320, borderRadius: 12, backgroundColor: "#eee" }}
        resizeMode="cover"
        onError={() => {
          // If it fails, swap to fallback
          (item as any).posterUrl = POSTER_FALLBACK;
        }}
      />
      <Text style={{ fontWeight: "600", marginTop: 8 }}>{item.title}</Text>
      <Text numberOfLines={2} style={{ color: "#666", marginTop: 4 }}>
        {item.description}
      </Text>
      <Link
        href={{ pathname: "/(user)/movie/[movieId]", params: { movieId: String(item.id) } }}
        style={{ color: "dodgerblue", marginTop: 6 }}
      >
        Book Now →
      </Link>
    </View>
  );
};

  return (
    <View style={{ flex:1, paddingVertical:16 }}>
      {/* Navbar */}
      <View style={{ paddingHorizontal:16, paddingBottom:8, borderBottomWidth:1, borderColor:"#eee" }}>
        <Text style={{ fontSize:22, fontWeight:"700" }}>PVR Cinemas</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search movies…"
          style={{ marginTop:8, borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }}
        />
      </View>

      {/* Showing Now */}
      <View style={{ marginTop:16 }}>
        <Text style={{ fontSize:18, fontWeight:"700", marginLeft:16 }}>Showing Now</Text>
        <FlatList
          horizontal
          data={showingNow}
          keyExtractor={(m) => m.id!}
          contentContainerStyle={{ padding:16 }}
          renderItem={({ item }) => <Card item={item} />}
          ListEmptyComponent={<Text style={{ marginLeft:16, color:"#666" }}>No movies today.</Text>}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Coming Soon */}
      <View style={{ marginTop:8 }}>
        <Text style={{ fontSize:18, fontWeight:"700", marginLeft:16 }}>Coming Soon</Text>
        <FlatList
          horizontal
          data={comingSoon}
          keyExtractor={(m) => m.id!}
          contentContainerStyle={{ padding:16 }}
          renderItem={({ item }) => <Card item={item} />}
          ListEmptyComponent={<Text style={{ marginLeft:16, color:"#666" }}>No upcoming titles.</Text>}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* About + Footer */}
      <View style={{ padding:16 }}>
        <Text style={{ marginTop:12, color:"#555" }}>
          PVR Cinemas brings you the latest blockbusters with seamless booking and comfy seats. Enjoy the show!
        </Text>
        <Text style={{ marginTop:24, textAlign:"center", color:"#888" }}>© {new Date().getFullYear()} PVR Cinemas</Text>
      </View>
    </View>
  );
}
