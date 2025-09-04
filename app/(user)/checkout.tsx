import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getMovie } from "../../lib/movieService";
import { getShowtime } from "../../lib/showtimeService";
import type { Movie, Showtime } from "../../lib/types";

export default function Checkout() {
  const { movieId, showtimeId, seatType, seats, count, total } = useLocalSearchParams<{
    movieId: string;
    showtimeId: string;
    seatType: string;
    seats: string; // JSON array
    count: string;
    total: string;
  }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
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

  if (!movie || !showtime) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop:8 }}>Preparing checkout…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:"700" }}>Checkout</Text>

      <View style={{ padding:12, borderWidth:1, borderColor:"#ddd", borderRadius:8 }}>
        <Text style={{ fontWeight:"700" }}>{movie.title}</Text>
        <Text style={{ color:"#555", marginTop:4 }}>
          {showtime.date} · {showtime.startTime}
        </Text>
        <Text style={{ marginTop:8 }}>Seat type: {seatType}</Text>
        <Text>Seats: {parsedSeats.join(", ")}</Text>
        <Text>Seat count: {count}</Text>
        <Text style={{ marginTop:6, fontWeight:"700" }}>Amount payable: {total}</Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          // We will implement Firestore transaction + booking + email next.
          Alert.alert("Mock Pay", "Payment success! (we'll wire bookings next)", [
            {
              text: "OK",
              onPress: () => router.replace("/(user)/tickets"),
            },
          ]);
        }}
        style={{ padding:14, borderRadius:10, backgroundColor:"#0a7" }}
      >
        <Text style={{ textAlign:"center", color:"#fff", fontWeight:"700" }}>Pay</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
