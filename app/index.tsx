import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../store/AuthProvider";

export default function Index() {
  const { fbUser, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!fbUser) {
      router.replace("/welcome");        // <— show Welcome first
      return;
    }

    if (profile?.role === "admin") {
      router.replace("/(admin)/movies");
    } else {
      router.replace("/(user)/dashboard");
    }
  }, [loading, fbUser, profile]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 8 }}>Loading…</Text>
    </View>
  );
}
