// app/(user)/dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { listMovies } from "../../lib/movieService";
import type { Movie } from "../../lib/types";
import { Link } from "expo-router";
import { toSafeImageUri } from "../../utils/url";
import { POSTER_FALLBACK } from "../../lib/constants";
import { useAuth } from "../../store/AuthProvider";
import { LOGO } from "../../lib/images";


const GOLD = "#ffd000";

function isComingSoon(releaseMs: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return releaseMs > today.getTime();
}
function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function daysUntil(d: Date) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "now" | "soon">("all");

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

  const filteredBase = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? movies.filter((m) => m.title.toLowerCase().includes(s)) : movies;
  }, [movies, q]);

  const computed = useMemo(() => {
    const now: Movie[] = [];
    const soon: Movie[] = [];
    filteredBase.forEach((m) => {
      const rel = m.releaseDate.toDate();
      (isComingSoon(rel.getTime()) ? soon : now).push(m);
    });
    return { now, soon };
  }, [filteredBase]);

  const showingNow = tab === "all" ? computed.now : tab === "now" ? computed.now : [];
  const comingSoon = tab === "all" ? computed.soon : tab === "soon" ? computed.soon : [];

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0b" }}>
        <ActivityIndicator color={GOLD} />
        <Text style={{ marginTop: 8, color: "#fff" }}>Loading…</Text>
      </View>
    );
  }

  const Card = ({ item, canBook }: { item: Movie; canBook?: boolean }) => {
    const uri = toSafeImageUri(item.posterUrl) || POSTER_FALLBACK;
    const rel = item.releaseDate.toDate();
    const coming = isComingSoon(rel.getTime());
    const badgeText = coming ? `Releases ${formatDate(rel)} (${daysUntil(rel)}d)` : "Now Showing";
    const badgeColor = coming ? "#222" : "#0a7";

    return (
      <View
        style={{
          width: 220,
          marginRight: 14,
          borderRadius: 14,
          backgroundColor: "#111",
          borderWidth: 1,
          borderColor: "#1f1f1f",
          overflow: "hidden",
        }}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri }}
            style={{ width: 220, height: 320, backgroundColor: "#1a1a1a" }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: badgeColor,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{badgeText}</Text>
          </View>
        </View>

        <View style={{ padding: 10 }}>
          <Text style={{ fontWeight: "800", color: "#fff" }} numberOfLines={1}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={{ color: "#bbb", marginTop: 4, lineHeight: 18 }}>
            {item.description}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#2a2a2a",
                borderRadius: 8,
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ color: "#bbb", fontSize: 12 }}>{item.durationMins} mins</Text>
            </View>
            {coming && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                  borderRadius: 8,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ color: "#bbb", fontSize: 12 }}>Premieres {formatDate(rel)}</Text>
              </View>
            )}
          </View>

          {canBook && (
            <Link
              href={{ pathname: "/(user)/movie/[movieId]", params: { movieId: String(item.id) } }}
              style={{
                marginTop: 10,
                backgroundColor: GOLD,
                color: "#000",
                textAlign: "center",
                fontWeight: "900",
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              Book Now
            </Link>
          )}
        </View>
      </View>
    );
  };

  const Section = ({
    title,
    data,
    canBook,
  }: {
    title: string;
    data: Movie[];
    canBook?: boolean;
  }) => (
    <View style={{ marginTop: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16, marginBottom: 6 }}>
        <View style={{ width: 6, height: 18, backgroundColor: GOLD, borderRadius: 3, marginRight: 8 }} />
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#fff" }}>{title}</Text>
      </View>
      <FlatList
        horizontal
        nestedScrollEnabled
        data={data}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
        renderItem={({ item }) => <Card item={item} canBook={canBook} />}
        ListEmptyComponent={
          <Text style={{ marginLeft: 16, color: "#888" }}>
            {title === "Showing Now" ? "No movies today." : "No upcoming titles."}
          </Text>
        }
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      {/* Top brand / search */}
      <LinearGradient
        colors={["#111111", "#0b0b0b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderColor: "#1a1a1a",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo pill */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: GOLD,
                backgroundColor: "#0f0f0f",
                overflow: "hidden",
              }}
            >
              <Image source={LOGO} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </View>

            <View>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>PVR Cinemas</Text>
              <Text style={{ color: "#aaa", fontSize: 12 }}>
                {profile?.name ? `Hi, ${profile.name.split(" ")[0]}!` : "Find your next watch"}
              </Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#121212",
            borderWidth: 1,
            borderColor: "#222",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#bbb" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search movies…"
            placeholderTextColor="#888"
            style={{ flex: 1, color: "#fff", paddingVertical: 6 }}
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {[
            { key: "all", label: `All (${filteredBase.length})` },
            { key: "now", label: `Showing (${computed.now.length})` },
            { key: "soon", label: `Soon (${computed.soon.length})` },
          ].map((c) => {
            const active = tab === (c.key as any);
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setTab(c.key as any)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? GOLD : "#333",
                  backgroundColor: active ? GOLD : "transparent",
                }}
              >
                <Text style={{ color: active ? "#000" : "#ddd", fontWeight: "700", fontSize: 12 }}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        {(tab === "all" || tab === "now") && <Section title="Showing Now" data={showingNow} canBook />}
        {(tab === "all" || tab === "soon") && <Section title="Coming Soon" data={comingSoon} />}

        {/* About / Footer */}
        <View style={{ padding: 16 }}>
          <Text style={{ marginTop: 8, color: "#bbb", lineHeight: 20 }}>
            PVR Cinemas brings you the latest blockbusters with seamless booking and comfy seats. Enjoy the show!
          </Text>
          <Text style={{ marginTop: 18, textAlign: "center", color: "#777" }}>
            © {new Date().getFullYear()} PVR Cinemas
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
