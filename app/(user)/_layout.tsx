import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../store/AuthProvider";
import { Text, TouchableOpacity } from "react-native";

export default function UserLayout() {
  const { fbUser, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !fbUser) router.replace("/(auth)/login");
  }, [loading, fbUser]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: "#e11", fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        ),
        headerTitle: "PVR Cinemas",
      }}
    />
  );
}
