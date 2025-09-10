import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../store/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";


export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid =
    name.trim().length >= 2 &&
    email.trim().includes("@") &&
    password.length >= 6;

  const onSubmit = async () => {
    if (!valid) {
      Alert.alert("Check your details", "Fill all fields (password ≥ 6).");
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      router.replace("/"); // index decides destination
    } catch (e: any) {
      Alert.alert("Register failed", "Please try again");
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
          {/* Logo & headline */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <View
              style={{
                width: 100, height: 100, borderRadius: 22,
                borderWidth: 2, borderColor: "#ffd000",
                alignItems: "center", justifyContent: "center",
                backgroundColor: "#101010",
              }}
            >
              <Text style={{ color: "#ffd000", fontSize: 38, fontWeight: "900", letterSpacing: 2 }}>
                PVR
              </Text>
            </View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 16 }}>
              Create your account
            </Text>
            <Text style={{ color: "#aaa", marginTop: 6 }}>
              Join the show—tickets in a tap 🎟️
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
            {/* Name */}
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 12, paddingHorizontal: 12,
              }}
            >
              <Ionicons name="person-outline" size={20} color="#bbb" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#888"
                style={{ flex: 1, color: "#fff", paddingVertical: 12 }}
              />
            </View>

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
                placeholder="Password (min 6 chars)"
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
                marginTop: 6,
                backgroundColor: !valid || loading ? "#777" : "#ffd000",
                borderRadius: 12,
                paddingVertical: 14,
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "900", color: "#000" }}>
                {loading ? "Creating…" : "Create account"}
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginTop: 6 }}>
              <Link href="/(auth)/login" style={{ color: "#62a0ff" }}>
                Back to sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
