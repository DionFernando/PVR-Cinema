// app/(user)/movie/[movieId]/seats.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getShowtime } from "../../../../lib/showtimeService";
import { getMovie } from "../../../../lib/movieService";
import type { Showtime, Movie } from "../../../../lib/types";
import SeatGrid from "../../../../components/SeatGrid";
import { seatTypeFromId } from "../../../../lib/seatConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../../../../lib/theme";

function isPast(dateStr: string, timeStr: string) {
  const now = new Date();
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt.getTime() < now.getTime();
}

export default function SeatsSelect() {
  const { movieId, showtimeId, seatCount } = useLocalSearchParams<{
    movieId: string;
    showtimeId: string;
    seatCount: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const maxSelect = Number(seatCount || "1");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [st, mv] = await Promise.all([
          getShowtime(String(showtimeId)),
          getMovie(String(movieId)),
        ]);
        if (!st || !mv) {
          Alert.alert("Not found", "Showtime or movie not found.", [
            { text: "OK", onPress: () => router.back() },
          ]);
          return;
        }
        if (isPast(st.date, st.startTime)) {
          Alert.alert("Time has passed", "This showtime is no longer available.", [
            {
              text: "OK",
              onPress: () =>
                router.replace({ pathname: "/(user)/movie/[movieId]/select", params: { movieId: String(movieId) } }),
            },
          ]);
          return;
        }
        setShowtime(st);
        setMovie(mv);
      } finally {
        setLoading(false);
      }
    })();
  }, [movieId, showtimeId]);

  // Per-category counts for summary & pricing
  const counts = useMemo(() => {
    const out = { Classic: 0, Prime: 0, Superior: 0 } as Record<"Classic"|"Prime"|"Superior", number>;
    selected.forEach(id => { out[seatTypeFromId(id)]++; });
    return out;
  }, [selected]);

  const total = useMemo(() => {
    if (!showtime) return 0;
    return (
      counts.Classic * showtime.priceMap.Classic +
      counts.Prime * showtime.priceMap.Prime +
      counts.Superior * showtime.priceMap.Superior
    );
  }, [counts, showtime]);

  // Determine seatType for booking: "Mixed" if more than one category selected
  const bookingSeatType = useMemo(() => {
    const types = new Set(selected.map(seatTypeFromId));
    if (types.size === 1) return Array.from(types)[0];
    return "Mixed";
  }, [selected]);

  const toggle = (id: string) => {
    const already = selected.includes(id);
    if (already) {
      setSelected(selected.filter(s => s !== id));
    } else {
      if (selected.length >= maxSelect) return;
      setSelected([...selected, id]);
    }
  };

  if (loading || !showtime || !movie) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ marginTop: 8, color: colors.text }}>Loading seats…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>{movie.title}</Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>
          {showtime.date} · {showtime.startTime}
        </Text>

        {/* Selection info */}
        <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card }}>
          <Text style={{ color: colors.text }}>
            Needed: <Text style={{ fontWeight: "700" }}>{maxSelect}</Text> seat(s)
          </Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>
            Selected: <Text style={{ fontWeight: "700" }}>{selected.length}</Text>
          </Text>
          <Text style={{ color: colors.text, marginTop: 6 }}>
            Classic: {counts.Classic} × {showtime.priceMap.Classic}   ·   Prime: {counts.Prime} × {showtime.priceMap.Prime}   ·   Superior: {counts.Superior} × {showtime.priceMap.Superior}
          </Text>
        </View>

        {/* Grid — no lockedType now (free mixing) */}
        <SeatGrid
          reserved={showtime.seatsReserved || []}
          selected={selected}
          maxSelect={maxSelect}
          lockedType={null}
          onToggle={toggle}
        />

        {/* Summary + Proceed */}
        <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>Summary</Text>
          <Text style={{ marginTop: 6, color: colors.text }}>Seats: {selected.join(", ") || "-"}</Text>
          <Text style={{ marginTop: 4, color: colors.text }}>
            Total: <Text style={{ fontWeight: "700" }}>{total}</Text>
          </Text>

          <TouchableOpacity
            disabled={selected.length !== maxSelect}
            onPress={() => {
              router.push({
                pathname: "/(user)/checkout",
                params: {
                  movieId: String(movieId),
                  showtimeId: String(showtimeId),
                  seatType: bookingSeatType,               // "Classic" | "Prime" | "Superior" | "Mixed"
                  seats: JSON.stringify(selected),
                  count: String(maxSelect),
                  total: String(total),
                },
              });
            }}
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: radius.md,
              backgroundColor: selected.length === maxSelect ? "#0a7" : "#aaa",
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff", fontWeight: "700" }}>
              {selected.length === maxSelect ? "Proceed to Checkout" : "Select required seats"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
