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
  const [lockedType, setLockedType] = useState<"Classic" | "Prime" | "Superior" | null>(null);

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
        // Hard block past showtime
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

  const pricePerSeat = useMemo(() => {
    if (!showtime || !lockedType) return 0;
    return showtime.priceMap[lockedType];
  }, [showtime, lockedType]);

  const total = pricePerSeat * selected.length;

  const toggle = (id: string) => {
    const already = selected.includes(id);
    const type = seatTypeFromId(id);
    if (!lockedType) {
      setLockedType(type);
    } else if (lockedType !== type && !already) {
      Alert.alert("One category", `Please choose only ${lockedType} seats for this booking.`);
      return;
    }

    if (already) {
      const next = selected.filter(s => s !== id);
      const nextType = next.length ? seatTypeFromId(next[0]) : null;
      setSelected(next);
      setLockedType(nextType);
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

        <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card }}>
          <Text style={{ color: colors.text }}>
            Needed: <Text style={{ fontWeight: "700" }}>{maxSelect}</Text> seat(s)
          </Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>
            Selected: <Text style={{ fontWeight: "700" }}>{selected.length}</Text> {lockedType ? `· Type: ${lockedType}` : ""}
          </Text>
          {lockedType && (
            <Text style={{ color: colors.text, marginTop: 4 }}>
              Price per seat: {showtime.priceMap[lockedType]}
            </Text>
          )}
        </View>

        <SeatGrid
          reserved={showtime.seatsReserved || []}
          selected={selected}
          maxSelect={maxSelect}
          lockedType={lockedType}
          onToggle={toggle}
        />

        <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>Summary</Text>
          <Text style={{ marginTop: 6, color: colors.text }}>Seats: {selected.join(", ") || "-"}</Text>
          <Text style={{ marginTop: 4, color: colors.text }}>
            Total: <Text style={{ fontWeight: "700" }}>{total}</Text>
          </Text>

          <TouchableOpacity
            disabled={selected.length !== maxSelect || !lockedType}
            onPress={() => {
              router.push({
                pathname: "/(user)/checkout",
                params: {
                  movieId: String(movieId),
                  showtimeId: String(showtimeId),
                  seatType: lockedType!,
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
              backgroundColor: selected.length === maxSelect && lockedType ? "#0a7" : "#aaa",
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff", fontWeight: "700" }}>
              {selected.length === maxSelect && lockedType ? "Proceed to Checkout" : "Select required seats"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
