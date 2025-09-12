// app/(user)/movie/[movieId]/select.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { listShowtimesByMovie } from "../../../../lib/showtimeService";
import type { Showtime } from "../../../../lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../../../../lib/theme";

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function nowYmd() { return ymd(new Date()); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function isPast(dateStr: string, timeStr: string) {
  const now = new Date();
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt.getTime() < now.getTime();
}
function labelFor(dateStr: string) {
  const today = new Date();
  const d0 = ymd(today);
  const d1 = ymd(addDays(today, 1));
  const d2 = ymd(addDays(today, 2));
  if (dateStr === d0) return "Today";
  if (dateStr === d1) return "Tomorrow";
  if (dateStr === d2) return "Day after";
  return dateStr;
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
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [movieId]);

  /** Limit to only Today / Tomorrow / Day after */
  const allowedDateSet = useMemo(() => {
    const today = new Date();
    return new Set([ymd(today), ymd(addDays(today, 1)), ymd(addDays(today, 2))]);
  }, []);

  const limited = useMemo(
    () => showtimes.filter((s) => allowedDateSet.has(s.date)),
    [showtimes, allowedDateSet]
  );

  /** Unique dates present (limited to 3 days) */
  const dates = useMemo(() => {
    const set = new Set<string>();
    // Prefer chronological
    const sorted = [...limited].sort((a, b) =>
      a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)
    );
    for (const s of sorted) set.add(s.date);
    return Array.from(set);
  }, [limited]);

  /** Default selected date = first with at least one future time */
  useEffect(() => {
    if (!dates.length) return;
    const firstWithTime = dates.find((d) =>
      limited.some((s) => s.date === d && !isPast(s.date, s.startTime))
    );
    setDate(firstWithTime || dates[0]);
    setTime("");
  }, [dates.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Times for the selected date (hide past times for today) + sold-out flag */
  const timesForDateObj = useMemo(() => {
    const list = limited
      .filter((s) => s.date === date)
      .filter((s) => !isPast(s.date, s.startTime)) // hide past times for today
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Deduplicate times (if admin accidentally created duplicates)
    const seen = new Set<string>();
    return list
      .filter((s) => (seen.has(s.startTime) ? false : (seen.add(s.startTime), true)))
      .map((s) => ({
        time: s.startTime,
        soldOut: (s.seatsReserved?.length || 0) >= 80, // 10x8
      }));
  }, [limited, date]);

  const selectedShowtime = useMemo(
    () => limited.find((s) => s.date === date && s.startTime === time) || null,
    [limited, date, time]
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

  if (!limited.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <Text style={{ color: colors.text }}>No showtimes available for the next 3 days.</Text>
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
                <Text style={{ color: active ? colors.accentText : colors.text }}>
                  {labelFor(d)}
                </Text>
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
