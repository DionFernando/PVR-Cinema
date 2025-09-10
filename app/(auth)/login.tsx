import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../store/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = email.trim().includes("@") && password.length >= 6;

  const onSubmit = async () => {
    if (!valid) {
      Alert.alert("Check your details", "Enter a valid email and a 6+ char password.");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace("/"); // index will route to admin/user
    } catch (e: any) {
      Alert.alert("Login failed", "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0b0b0b", "#131313", "#0b0b0b"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo badge */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <View
              style={{
                width: 120, height: 120, borderRadius: 26,
                borderWidth: 2, borderColor: "#ffd000",
                alignItems: "center", justifyContent: "center",
                backgroundColor: "#101010",
              }}
            >
              <Text style={{ color: "#ffd000", fontSize: 44, fontWeight: "900", letterSpacing: 2 }}>
                PVR
              </Text>
            </View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 16 }}>
              Welcome back
            </Text>
            <Text style={{ color: "#aaa", marginTop: 6 }}>
              Book your movie • Grab a popcorn 🍿
            </Text>
          </View>

          {/* Card */}
          <View
            style={{
              backgroundColor: "#121212",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#1f1f1f",
              gap: 12,
            }}
          >
            {/* Email */}
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 12, paddingHorizontal: 12,
              }}
            >
              <Ionicons name="mail-outline" size={20} color="#bbb" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#888"
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ flex: 1, color: "#fff", paddingVertical: 12 }}
              />
            </View>

            {/* Password */}
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 12, paddingHorizontal: 12,
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#bbb" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={!showPwd}
                style={{ flex: 1, color: "#fff", paddingVertical: 12 }}
              />
              <TouchableOpacity onPress={() => setShowPwd(s => !s)} hitSlop={10}>
                <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#bbb" />
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity
              disabled={!valid || loading}
              onPress={onSubmit}
              style={{
                marginTop: 6, backgroundColor: !valid || loading ? "#777" : "#ffd000",
                borderRadius: 12, paddingVertical: 14,
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "900", color: "#000" }}>
                {loading ? "Signing in…" : "Sign in"}
              </Text>
            </TouchableOpacity>

            {/* Secondary */}
            <View style={{ alignItems: "center", marginTop: 6 }}>
              <Link href="/(auth)/register" style={{ color: "#62a0ff", marginTop: 4 }}>
                Create an account
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
