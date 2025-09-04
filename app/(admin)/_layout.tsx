import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../store/AuthProvider";
import { Text, TouchableOpacity } from "react-native";

export default function AdminLayout() {
  const { fbUser, profile, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!fbUser) router.replace("/(auth)/login");
      else if (profile?.role !== "admin") router.replace("/(user)/dashboard");
    }
  }, [loading, fbUser, profile]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Admin",
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: "#e11", fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    />
  );
}
