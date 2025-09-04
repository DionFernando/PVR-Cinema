import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { createShowtime } from "../../../lib/showtimeService";
import { listMovies } from "../../../lib/movieService";
import type { Movie } from "../../../lib/types";

export default function NewShowtime() {
  const { movieId: presetMovieId } = useLocalSearchParams<{ movieId?: string }>();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieId, setMovieId] = useState<string>(presetMovieId ?? "");
  const [date, setDate] = useState("");       // YYYY-MM-DD
  const [time, setTime] = useState("");       // HH:mm
  const [classic, setClassic] = useState("");
  const [prime, setPrime] = useState("");
  const [superior, setSuperior] = useState("");

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
      await createShowtime({
        movieId,
        date,
        startTime: time,
        priceMap: {
          Classic: Number(classic),
          Prime: Number(prime),
          Superior: Number(superior),
        },
      });
      Alert.alert("Saved", "Showtime created.");
      router.replace("/(admin)/showtimes");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save showtime");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:"600" }}>New Showtime</Text>

      <Text>Movie</Text>
      <TextInput
        value={movieId}
        onChangeText={setMovieId}
        placeholder="Movie ID"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }}
      />
      <Text style={{ color:"#666" }}>
        Tip: For now paste/select an ID from Admin · Movies list. (We’ll add a picker later.)
      </Text>

      <Text>Date (YYYY-MM-DD)</Text>
      <TextInput value={date} onChangeText={setDate} placeholder="2025-09-05"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Time (HH:mm)</Text>
      <TextInput value={time} onChangeText={setTime} placeholder="19:30"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Price — Classic</Text>
      <TextInput value={classic} onChangeText={setClassic} keyboardType="numeric" placeholder="800"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Price — Prime</Text>
      <TextInput value={prime} onChangeText={setPrime} keyboardType="numeric" placeholder="1200"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Price — Superior</Text>
      <TextInput value={superior} onChangeText={setSuperior} keyboardType="numeric" placeholder="1500"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <View style={{ marginTop:8 }}>
        <Button title="Save" onPress={save} />
      </View>
    </ScrollView>
  );
}
