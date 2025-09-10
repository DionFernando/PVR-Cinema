import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../store/AuthProvider";

export default function AdminLayout() {
  const { fbUser, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!fbUser) {
      router.replace("/(auth)/login");
      return;
    }
    if (profile?.role !== "admin") {
      router.replace("/(user)/dashboard");
    }
  }, [loading, fbUser, profile]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {loading ? (
        <View style={{ flex: 1, backgroundColor: "#f6f7f9", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#222", marginTop: 8 }}>Loading…</Text>
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,                // ← no stack header
            contentStyle: { backgroundColor: "#f6f7f9" }, // light admin bg
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
