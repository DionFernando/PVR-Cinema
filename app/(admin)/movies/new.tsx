import { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { createMovie, dateStringToTimestamp } from "../../../lib/movieService";
import { router } from "expo-router";

export default function NewMovie() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [release, setRelease] = useState("");     // YYYY-MM-DD
  const [duration, setDuration] = useState("");

  const save = async () => {
    if (!title || !desc || !posterUrl || !release || !duration) {
      Alert.alert("Missing", "Please fill all fields.");
      return;
    }
    try {
      await createMovie({
        title,
        description: desc,
        posterUrl,
        releaseDate: dateStringToTimestamp(release),
        durationMins: Number(duration),
      });
      Alert.alert("Saved", "Movie created.");
      router.replace("/(admin)/movies");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save movie");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:"600" }}>New Movie</Text>

      <Text>Title</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Movie title"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Description</Text>
      <TextInput value={desc} onChangeText={setDesc} placeholder="Short description" multiline
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10, minHeight:80 }} />

      <Text>Poster URL</Text>
      <TextInput value={posterUrl} onChangeText={setPosterUrl} placeholder="https://…"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Release Date (YYYY-MM-DD)</Text>
      <TextInput value={release} onChangeText={setRelease} placeholder="2025-09-04"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <Text>Duration (mins)</Text>
      <TextInput value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="120"
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10 }} />

      <View style={{ marginTop:8 }}>
        <Button title="Save" onPress={save} />
      </View>
    </ScrollView>
  );
}
