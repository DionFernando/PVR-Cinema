// components/AdminHeader.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../store/AuthProvider";

export default function AdminHeader({ title = "Admin" }: { title?: string }) {
  const { logout } = useAuth();
  return (
    <View
      style={{
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#f6f7f9",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "800", color: "#111" }}>{title}</Text>
      <TouchableOpacity onPress={logout} hitSlop={10}>
        <Text style={{ color: "#dc2626", fontWeight: "700" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
