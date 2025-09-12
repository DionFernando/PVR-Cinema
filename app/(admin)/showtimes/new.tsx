// app/(admin)/showtimes/new.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView, Switch } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { createShowtime } from "../../../lib/showtimeService";
import { listMovies } from "../../../lib/movieService";
import type { Movie } from "../../../lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDaysStr(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return ymd(d);
}

export default function NewShowtime() {
  const { movieId: presetMovieId } = useLocalSearchParams<{ movieId?: string }>();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieId, setMovieId] = useState<string>(presetMovieId ?? "");
  const [time, setTime] = useState("");       // HH:mm
  const [classic, setClassic] = useState("");
  const [prime, setPrime] = useState("");
  const [superior, setSuperior] = useState("");
  const [repeat7, setRepeat7] = useState(true); // default: create for a week
  const [date, setDate] = useState(addDaysStr(0)); // used only when repeat7 = false

  useEffect(() => {
    (async () => {
      const m = await listMovies();
      setMovies(m);
      if (!presetMovieId && m.length) setMovieId(m[0].id);
    })();
  }, []);

  const save = async () => {
    if (!movieId || !time || !classic || !prime || !superior) {
      Alert.alert("Missing", "Please fill Movie, Time and Prices.");
      return;
    }
    try {
      const prices = {
        Classic: Number(classic),
        Prime: Number(prime),
        Superior: Number(superior),
      };

      if (repeat7) {
        // Create Today + next 6 days
        for (let d = 0; d < 7; d++) {
          await createShowtime({
            movieId,
            date: addDaysStr(d),
            startTime: time,
            priceMap: prices,
          });
        }
      } else {
        if (!date) {
          Alert.alert("Missing", "Please set a date or enable Repeat 7 days.");
          return;
        }
        await createShowtime({ movieId, date, startTime: time, priceMap: prices });
      }

      Alert.alert("Saved", repeat7 ? "Showtimes created for the next 7 days." : "Showtime created.");
      router.replace("/(admin)/showtimes");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save showtime");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#111" }}>New Showtime</Text>

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
        {movies.length === 0 && (
          <Text style={{ color: "#666" }}>
            Tip: Add one in Admin · Movies first.
          </Text>
        )}

        <Text style={{ color: "#333" }}>Time (HH:mm)</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="19:30"
          style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: "#333" }}>Repeat daily for the next 7 days</Text>
          <Switch value={repeat7} onValueChange={setRepeat7} />
        </View>

        {!repeat7 && (
          <>
            <Text style={{ color: "#333" }}>Date (YYYY-MM-DD)</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2025-09-05"
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, backgroundColor: "#fff" }}
            />
          </>
        )}

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

        <View style={{ marginTop: 8 }}>
          <Button title="Save" onPress={save} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
