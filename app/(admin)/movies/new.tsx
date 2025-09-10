import { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { createMovie, dateStringToTimestamp } from "../../../lib/movieService";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        <Text style={{ fontSize:20, fontWeight:"800", color:"#111" }}>New Movie</Text>

        <Text style={{ color:"#333" }}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Movie title"
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, backgroundColor:"#fff" }} />

        <Text style={{ color:"#333" }}>Description</Text>
        <TextInput value={desc} onChangeText={setDesc} placeholder="Short description" multiline
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, backgroundColor:"#fff", minHeight:100 }} />

        <Text style={{ color:"#333" }}>Poster URL</Text>
        <TextInput value={posterUrl} onChangeText={setPosterUrl} placeholder="https://…"
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, backgroundColor:"#fff" }} />

        <Text style={{ color:"#333" }}>Release Date (YYYY-MM-DD)</Text>
        <TextInput value={release} onChangeText={setRelease} placeholder="2025-09-04"
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, backgroundColor:"#fff" }} />

        <Text style={{ color:"#333" }}>Duration (mins)</Text>
        <TextInput value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="120"
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, backgroundColor:"#fff" }} />

        <View style={{ marginTop:8 }}>
          <Button title="Save" onPress={save} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
