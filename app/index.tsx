import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", gap:16 }}>
      <Text style={{ fontSize:18, fontWeight:"700" }}>PVR Cinemas — scaffold OK ✅</Text>

      <Link href="/(user)/dashboard" asChild>
        <TouchableOpacity style={{ padding:12, borderWidth:1, borderRadius:8 }}>
          <Text>Open User Dashboard</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(admin)/movies" asChild>
        <TouchableOpacity style={{ padding:12, borderWidth:1, borderRadius:8 }}>
          <Text>Open Admin · Movies</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
