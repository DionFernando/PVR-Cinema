import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { getMovie, updateMovie, dateStringToTimestamp } from "../../../../lib/movieService";
import { useLocalSearchParams, router } from "expo-router";
import { Timestamp } from "firebase/firestore";

function tsToYMD(ts?: Timestamp): string {
  if (!ts) return "";
  const d = ts.toDate();
  const m = `${d.getMonth()+1}`.padStart(2,"0");
  const day = `${d.getDate()}`.padStart(2,"0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function EditMovie() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [release, setRelease] = useState(""); // YYYY-MM-DD
  const [duration, setDuration] = useState("");

  useEffect(() => {
    (async () => {
      if (!movieId) return;
      const data = await getMovie(movieId);
      if (!data) {
        Alert.alert("Not found");
        router.back();
        return;
      }
      setTitle(data.title);
      setDesc(data.description);
      setPosterUrl(data.posterUrl);
      setRelease(tsToYMD(data.releaseDate));
      setDuration(String(data.durationMins));
      setLoading(false);
    })();
  }, [movieId]);

  const save = async () => {
    try {
      await updateMovie(movieId!, {
        title,
        description: desc,
        posterUrl,
        releaseDate: dateStringToTimestamp(release),
        durationMins: Number(duration),
      });
      Alert.alert("Saved", "Movie updated.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update movie");
    }
  };

  if (loading) {
    return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}><Text>Loading…</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:"600" }}>Edit Movie</Text>

      <Text>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Description</Text>
      <TextInput value={desc} onChangeText={setDesc} multiline style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10, minHeight:80 }} />

      <Text>Poster URL</Text>
      <TextInput value={posterUrl} onChangeText={setPosterUrl} style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Release Date (YYYY-MM-DD)</Text>
      <TextInput value={release} onChangeText={setRelease} style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Duration (mins)</Text>
      <TextInput value={duration} onChangeText={setDuration} keyboardType="numeric" style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <View style={{ marginTop:8, gap:8 }}>
        <Button title="Save" onPress={save} />
      </View>
    </ScrollView>
  );
}
