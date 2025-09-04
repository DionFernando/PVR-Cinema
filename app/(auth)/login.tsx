import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../store/AuthProvider";

export default function Login() {
  const { login, profile, fbUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
  try {
    setLoading(true);
    await login(email, password);
    // Let app/index decide where to go (admin vs user)
    router.replace("/");
  } catch (e: any) {
    Alert.alert("Login failed", e?.message ?? "Invalid credentials");
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex:1, alignItems:"center", justifyContent:"center", padding:16 }}
    >
      <Text style={{ fontSize:22, fontWeight:"700", marginBottom:16 }}>Sign in</Text>

      <TextInput
        value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
        placeholder="Email"
        style={{ width:"100%", borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:12, marginBottom:10 }}
      />
      <TextInput
        value={password} onChangeText={setPassword} secureTextEntry placeholder="Password"
        style={{ width:"100%", borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:12, marginBottom:16 }}
      />

      <TouchableOpacity onPress={onSubmit}
        style={{ width:"100%", padding:14, borderRadius:10, backgroundColor:"#111", marginBottom:12 }}>
        <Text style={{ textAlign:"center", color:"#fff", fontWeight:"700" }}>
          {loading ? "Signing in…" : "Sign in"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/register" style={{ color:"dodgerblue" }}>Create an account</Link>
    </KeyboardAvoidingView>
  );
}
