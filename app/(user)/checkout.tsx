// app/(user)/checkout.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMovie } from "../../lib/movieService";
import { getShowtime } from "../../lib/showtimeService";
import { getOrCreateUserId } from "../../lib/authUser";
import { createBookingWithSeatLock } from "../../lib/bookingService";
import type { Movie, Showtime } from "../../lib/types";
import { colors, spacing, radius } from "../../lib/theme";

export default function Checkout() {
  const { movieId, showtimeId, seatType, seats, count, total } = useLocalSearchParams<{
    movieId: string;
    showtimeId: string;
    seatType: "Classic" | "Prime" | "Superior" | string;
    seats: string; // JSON array
    count: string;
    total: string;
  }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const parsedSeats = useMemo<string[]>(() => {
    try {
      return JSON.parse(String(seats || "[]"));
    } catch {
      return [];
    }
  }, [seats]);

  useEffect(() => {
    (async () => {
      const [m, st] = await Promise.all([
        getMovie(String(movieId)),
        getShowtime(String(showtimeId)),
      ]);
      setMovie(m);
      setShowtime(st);
    })();
  }, [movieId, showtimeId]);

  const canPay = !!(movie && showtime && parsedSeats.length && seatType && total);

  const onPay = async () => {
    if (!canPay) return;
    try {
      setSubmitting(true);

      const uid = await getOrCreateUserId();

      // Create booking + lock seats (transaction)
      await createBookingWithSeatLock({
        userId: uid,
        showtimeId: String(showtimeId),
        movieId: String(movieId),
        seats: parsedSeats,
        seatType: seatType as any,
        total: Number(total || "0"),
      });

      Alert.alert("Success", "Booking confirmed! 🎉", [
        { text: "View Tickets", onPress: () => router.replace("/(user)/tickets") },
        { text: "Home", onPress: () => router.replace("/(user)/dashboard") },
      ]);
    } catch (e: any) {
      Alert.alert("Booking failed", e?.message ?? "Please reselect seats and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!movie || !showtime) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ marginTop: 8, color: colors.text }}>Preparing checkout…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Top bar: Title + Home */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>Checkout</Text>
          <TouchableOpacity
            onPress={() => router.replace("/(user)/dashboard")}
            style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.accent }}
          >
            <Text style={{ color: colors.accentText, fontWeight: "800" }}>Home</Text>
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View
          style={{
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            backgroundColor: colors.card,
            gap: 6,
          }}
        >
          <Text style={{ fontWeight: "800", color: colors.text }}>{movie.title}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 2 }}>
            {showtime.date} · {showtime.startTime}
          </Text>
          <Text style={{ marginTop: 8, color: colors.text }}>Seat type: <Text style={{ fontWeight: "700" }}>{seatType}</Text></Text>
          <Text style={{ color: colors.text }}>Seats: <Text style={{ fontWeight: "700" }}>{parsedSeats.join(", ")}</Text></Text>
          <Text style={{ color: colors.text }}>Seat count: <Text style={{ fontWeight: "700" }}>{count}</Text></Text>
          <Text style={{ marginTop: 8, fontWeight: "900", color: colors.text }}>
            Amount payable: {total}
          </Text>
        </View>

        {/* Pay */}
        <TouchableOpacity
          disabled={!canPay || submitting}
          onPress={onPay}
          style={{
            padding: 14,
            borderRadius: radius.md,
            backgroundColor: !canPay || submitting ? "#666" : colors.success,
          }}
        >
          <Text style={{ textAlign: "center", color: colors.text, fontWeight: "800" }}>
            {submitting ? "Processing…" : "Pay"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
