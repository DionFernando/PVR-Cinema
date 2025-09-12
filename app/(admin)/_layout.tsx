// app/(admin)/_layout.tsx
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../store/AuthProvider";
import { View, ActivityIndicator } from "react-native";

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

  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f6f7f9" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f6f7f9" } }} />
    </SafeAreaProvider>
  );
}
