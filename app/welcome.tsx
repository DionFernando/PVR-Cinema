import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { Image } from "react-native";
import { LOGO } from "../lib/images";
import { SafeAreaView } from "react-native-safe-area-context";

function formatColombo(now: Date) {
  try {
    return new Intl.DateTimeFormat("en-LK", {
      dateStyle: "full",
      timeStyle: "medium",
      timeZone: "Asia/Colombo",
    }).format(now);
  } catch {
    return now.toLocaleString();
  }
}

export default function Welcome() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const version =
    // Expo SDK 49+:
    (Constants.expoConfig && Constants.expoConfig.version) ||
    // fallback older manifests:
    (Constants.manifest as any)?.version ||
    "1.0.0";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      <View style={{ flex: 1, padding: 24, alignItems: "center", justifyContent: "space-between" }}>
        {/* Top-right meta */}
        <View style={{ alignSelf: "flex-end", alignItems: "flex-end" }}>
          <Text style={{ color: "#aaa" }}>v{version}</Text>
          <Text style={{ color: "#aaa", marginTop: 2 }}>{formatColombo(now)}</Text>
        </View>

        {/* Brand */}
        <View style={{ alignItems: "center" }}>
          {/* Faux logo badge */}
          {/* Logo badge */}
            <View
            style={{
                width: 140,
                height: 140,
                borderRadius: 28,
                backgroundColor: "#111",
                borderWidth: 2,
                borderColor: "#ffd000",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#ffd000",
                shadowOpacity: 0.4,
                shadowRadius: 12,
                overflow: "hidden",
            }}
            >
            <Image source={LOGO} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </View>

          {/* Taglines */}
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 20 }}>
            Book your movie now
          </Text>
          <Text style={{ color: "#ffd000", fontSize: 16, marginTop: 6 }}>
            Grab a popcorn 🍿 · Settle in 🎬
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={{
            alignSelf: "stretch",
            backgroundColor: "#ffd000",
            borderRadius: 14,
            paddingVertical: 16,
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "800", color: "#000" }}>
            Get Started
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={{ color: "#777", textAlign: "center", width: "100%" }}>
          © {new Date().getFullYear()} PVR Cinemas
        </Text>
      </View>
    </SafeAreaView>
  );
}
