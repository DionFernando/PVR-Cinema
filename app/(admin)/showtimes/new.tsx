// app/(admin)/showtimes/new.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView, Switch } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { listMovies } from "../../../lib/movieService";
import { createShowtime, createShowtimesBulk } from "../../../lib/showtimeService";
import type { Movie } from "../../../lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../components/AdminHeader";
import { Picker } from "@react-native-picker/picker";

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function NewShowtime() {
  const { movieId: presetMovieId } = useLocalSearchParams<{ movieId?: string }>();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieId, setMovieId] = useState<string>(presetMovieId ?? "");
  const [date, setDate] = useState(todayYmd()); // YYYY-MM-DD
  const [time, setTime] = useState("19:30");    // HH:mm
  const [classic, setClassic] = useState("");
  const [prime, setPrime] = useState("");
  const [superior, setSuperior] = useState("");
  const [repeatWeek, setRepeatWeek] = useState(true);

  useEffect(() => {
    (async () => {
      const m = await listMovies();
      setMovies(m);
      if (!movieId && m.length) setMovieId(m[0].id);
    })();
  }, []);

  const save = async () => {
    if (!movieId || !date || !time || !classic || !prime || !superior) {
      Alert.alert("Missing", "Fill all fields.");
      return;
    }

    try {
      const priceMap = {
        Classic: Number(classic),
        Prime: Number(prime),
        Superior: Number(superior),
      };

      if (repeatWeek) {
        const res = await createShowtimesBulk({
          movieId,
          startDate: date,
          startTime: time,
          days: 7,
          priceMap,
        });
        Alert.alert("Saved", `Created ${res.created} showtime(s). Skipped ${res.skipped}.`);
      } else {
        await createShowtime({ movieId, date, startTime: time, priceMap });
        Alert.alert("Saved", "Showtime created.");
      }

      router.replace("/(admin)/showtimes");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save showtime");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <AdminHeader title="New Showtime" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Movie</Text>
        <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" }}>
          <Picker
            selectedValue={movieId}
            onValueChange={(v) => setMovieId(String(v))}
            dropdownIconColor="#111"
            style={{ color: "#111" }}
          >
            {movies.map((m) => (
              <Picker.Item key={m.id} label={m.title} value={m.id} />
            ))}
          </Picker>
        </View>

        <Text style={{ fontSize: 16, fontWeight: "700" }}>Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2025-09-05"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 10, backgroundColor: "#fff" }}
        />

        <Text style={{ fontSize: 16, fontWeight: "700" }}>Time (HH:mm)</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="19:30"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 10, backgroundColor: "#fff" }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={{ fontWeight: "700" }}>Repeat for next 7 days</Text>
          <Switch value={repeatWeek} onValueChange={setRepeatWeek} />
        </View>

        <Text style={{ fontSize: 16, fontWeight: "700", marginTop: 8 }}>Prices</Text>
        <Text>Classic</Text>
        <TextInput
          value={classic}
          onChangeText={setClassic}
          keyboardType="numeric"
          placeholder="800"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 10, backgroundColor: "#fff" }}
        />
        <Text>Prime</Text>
        <TextInput
          value={prime}
          onChangeText={setPrime}
          keyboardType="numeric"
          placeholder="1200"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 10, backgroundColor: "#fff" }}
        />
        <Text>Superior</Text>
        <TextInput
          value={superior}
          onChangeText={setSuperior}
          keyboardType="numeric"
          placeholder="1500"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 10, backgroundColor: "#fff" }}
        />

        <View style={{ marginTop: 8 }}>
          <Button title="Save" onPress={save} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
