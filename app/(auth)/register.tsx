import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../store/AuthProvider";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing", "Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await register(name, email, password);
      Alert.alert("Welcome!", "Account created.");
      router.replace("/(user)/dashboard");
    } catch (e: any) {
      Alert.alert("Register failed", e?.message ?? "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex:1, alignItems:"center", justifyContent:"center", padding:16 }}
    >
      <Text style={{ fontSize:22, fontWeight:"700", marginBottom:16 }}>Create account</Text>

      <TextInput value={name} onChangeText={setName} placeholder="Full name"
        style={{ width:"100%", borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:12, marginBottom:10 }} />
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email"
        style={{ width:"100%", borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:12, marginBottom:10 }} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password (min 6 chars)"
        style={{ width:"100%", borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:12, marginBottom:16 }} />

      <TouchableOpacity onPress={onSubmit}
        style={{ width:"100%", padding:14, borderRadius:10, backgroundColor:"#111", marginBottom:12 }}>
        <Text style={{ textAlign:"center", color:"#fff", fontWeight:"700" }}>
          {loading ? "Creating…" : "Create account"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" style={{ color:"dodgerblue" }}>Back to sign in</Link>
    </KeyboardAvoidingView>
  );
}
