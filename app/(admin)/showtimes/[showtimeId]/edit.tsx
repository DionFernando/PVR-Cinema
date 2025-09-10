import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getShowtime, updateShowtime, removeShowtime } from "../../../../lib/showtimeService";
import { listMovies } from "../../../../lib/movieService";
import type { Movie } from "../../../../lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

export default function EditShowtime() {
  const { showtimeId } = useLocalSearchParams<{ showtimeId: string }>();

  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);

  const [movieId, setMovieId] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm
  const [classic, setClassic] = useState("");
  const [prime, setPrime] = useState("");
  const [superior, setSuperior] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [st, ms] = await Promise.all([getShowtime(String(showtimeId)), listMovies()]);
        setMovies(ms);
        if (!st) {
          Alert.alert("Not found", "Showtime not found.");
          router.back();
          return;
        }
        setMovieId(st.movieId);
        setDate(st.date);
        setTime(st.startTime);
        setClassic(String(st.priceMap.Classic));
        setPrime(String(st.priceMap.Prime));
        setSuperior(String(st.priceMap.Superior));
      } finally {
        setLoading(false);
      }
    })();
  }, [showtimeId]);

  const save = async () => {
    if (!movieId || !date || !time || !classic || !prime || !superior) {
      Alert.alert("Missing", "Fill all fields.");
      return;
    }
    try {
      await updateShowtime(String(showtimeId), {
        movieId,
        date,
        startTime: time,
        priceMap: { Classic: Number(classic), Prime: Number(prime), Superior: Number(superior) },
      });
      Alert.alert("Saved", "Showtime updated.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update showtime");
    }
  };

  const del = async () => {
    Alert.alert("Delete", "Delete this showtime?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeShowtime(String(showtimeId));
            Alert.alert("Deleted", "Showtime removed.");
            router.replace("/(admin)/showtimes");
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to delete showtime");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#111" }}>Edit Showtime</Text>

        <Text style={{ color: "#333" }}>Movie</Text>
        <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" }}>
          <Picker
            selectedValue={movieId}
            onValueChange={(v) => setMovieId(String(v))}
            dropdownIconColor="#111"
            style={{ color: "#111" }}
          >
            {movies.length === 0 ? (
              <Picker.Item label="No movies available" value="" />
            ) : (
              movies.map((m) => <Picker.Item key={m.id} label={m.title} value={m.id} />)
            )}
          </Picker>
        </View>

        <Text style={{ color: "#333" }}>Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2025-09-05"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }}
        />

        <Text style={{ color: "#333" }}>Time (HH:mm)</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="19:30"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }}
        />

        <Text style={{ color: "#333" }}>Price — Classic</Text>
        <TextInput
          value={classic}
          onChangeText={setClassic}
          keyboardType="numeric"
          placeholder="800"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }}
        />

        <Text style={{ color: "#333" }}>Price — Prime</Text>
        <TextInput
          value={prime}
          onChangeText={setPrime}
          keyboardType="numeric"
          placeholder="1200"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }}
        />

        <Text style={{ color: "#333" }}>Price — Superior</Text>
        <TextInput
          value={superior}
          onChangeText={setSuperior}
          keyboardType="numeric"
          placeholder="1500"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }}
        />

        <View style={{ marginTop: 8, gap: 8 }}>
          <Button title="Save" onPress={save} />
          <Button title="Delete" color="#c00" onPress={del} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
