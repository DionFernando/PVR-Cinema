import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getShowtime } from "../../../../lib/showtimeService";
import { getMovie } from "../../../../lib/movieService";
import type { Showtime, Movie } from "../../../../lib/types";
import SeatGrid from "../../../../components/SeatGrid";
import { seatTypeFromId } from "../../../../lib/seatConfig";

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

    // set or enforce category
    if (!lockedType) {
      setLockedType(type);
    } else if (lockedType !== type && !already) {
      Alert.alert("One category", `Please choose only ${lockedType} seats for this booking.`);
      return;
    }

    if (already) {
      const next = selected.filter((s) => s !== id);
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading seats…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>{movie.title}</Text>
      <Text style={{ color: "#666", marginTop: 4 }}>
        {showtime.date} · {showtime.startTime}
      </Text>

      {/* Selection info */}
      <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}>
        <Text>
          Needed: <Text style={{ fontWeight: "700" }}>{maxSelect}</Text> seat(s)
        </Text>
        <Text style={{ marginTop: 4 }}>
          Selected: <Text style={{ fontWeight: "700" }}>{selected.length}</Text>{" "}
          {lockedType ? `· Type: ${lockedType}` : ""}
        </Text>
        {lockedType && (
          <Text style={{ marginTop: 4 }}>
            Price per seat: {showtime.priceMap[lockedType]}
          </Text>
        )}
      </View>

      {/* Grid */}
      <SeatGrid
        reserved={showtime.seatsReserved || []}
        selected={selected}
        maxSelect={maxSelect}
        lockedType={lockedType}
        onToggle={toggle}
      />

      {/* Summary + Proceed */}
      <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}>
        <Text style={{ fontWeight: "700" }}>Summary</Text>
        <Text style={{ marginTop: 6 }}>Seats: {selected.join(", ") || "-"}</Text>
        <Text style={{ marginTop: 4 }}>
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
            borderRadius: 10,
            backgroundColor: selected.length === maxSelect && lockedType ? "#0a7" : "#aaa",
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff", fontWeight: "700" }}>
            {selected.length === maxSelect && lockedType ? "Proceed to Checkout" : "Select required seats"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
