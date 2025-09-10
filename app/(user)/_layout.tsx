import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../store/AuthProvider";
import { colors } from "../../lib/theme";

export default function UserLayout() {
  const { fbUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && !fbUser) {
      router.replace("/(auth)/login");
    }
  }, [loading, fbUser]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.bg} />
      {loading ? (
        <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: "#fff", marginTop: 8 }}>Loading…</Text>
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
