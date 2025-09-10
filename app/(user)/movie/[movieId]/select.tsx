import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { listShowtimesByMovie } from "../../../../lib/showtimeService";
import type { Showtime } from "../../../../lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../../../../lib/theme";

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default function SelectShowtime() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [seatCount, setSeatCount] = useState<number>(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (movieId) {
          const sts = await listShowtimesByMovie(String(movieId));
          setShowtimes(sts);
          if (sts.length) setDate(sts[0].date); // default to first available date
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [movieId]);

  const dates = useMemo(() => uniq(showtimes.map((s) => s.date)), [showtimes]);

  const timesForDateObj = useMemo(() => {
    const list = showtimes.filter((s) => s.date === date);
    return list.map((s) => ({
      time: s.startTime,
      soldOut: (s.seatsReserved?.length || 0) >= 80, // 10x8
    }));
  }, [showtimes, date]);

  const selectedShowtime = useMemo(
    () => showtimes.find((s) => s.date === date && s.startTime === time) || null,
    [showtimes, date, time]
  );

  const proceed = () => {
    if (!movieId || !selectedShowtime) return;
    router.push({
      pathname: "/(user)/movie/[movieId]/seats",
      params: {
        movieId: String(movieId),
        showtimeId: selectedShowtime.id,
        seatCount: String(seatCount),
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ marginTop: 8, color: colors.text }}>Loading showtimes…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!showtimes.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <Text style={{ color: colors.text }}>No showtimes available for this movie.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>Select Date</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {dates.map((d) => {
            const active = d === date;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => {
                  setDate(d);
                  setTime("");
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.chipBorder,
                  backgroundColor: active ? colors.accent : colors.chipBg,
                }}
              >
                <Text style={{ color: active ? colors.accentText : colors.text }}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 8, color: colors.text }}>
          Select Time
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {timesForDateObj.length ? (
            timesForDateObj.map(({ time: t, soldOut }) => {
              const active = t === time;
              return (
                <TouchableOpacity
                  key={t}
                  disabled={soldOut}
                  onPress={() => setTime(t)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: soldOut ? colors.border : active ? colors.accent : colors.chipBorder,
                    backgroundColor: soldOut
                      ? colors.cardAlt
                      : active
                      ? colors.accent
                      : colors.chipBg,
                    opacity: soldOut ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: active ? colors.accentText : colors.text }}>
                    {t}
                    {soldOut ? " (Sold out)" : ""}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ color: colors.textMuted }}>No times for this date.</Text>
          )}
        </View>

        <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 8, color: colors.text }}>
          Select Seat Count
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const active = n === seatCount;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setSeatCount(n)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radius.md,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.chipBorder,
                  backgroundColor: active ? colors.accent : colors.card,
                }}
              >
                <Text style={{ color: active ? colors.accentText : colors.text, fontWeight: "600" }}>
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={proceed}
          disabled={!selectedShowtime}
          style={{
            marginTop: 8,
            padding: 14,
            borderRadius: radius.md,
            backgroundColor: selectedShowtime ? colors.success : "#666",
          }}
        >
          <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>
            {selectedShowtime ? "Proceed" : "Select date & time"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
