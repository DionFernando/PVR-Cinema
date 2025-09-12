// app/(admin)/scan/index.tsx
import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../components/AdminHeader";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { getBookingById, markBookingRedeemed } from "../../../lib/bookingService";
import { router } from "expo-router";

type MovieDoc = { title: string };
type ShowtimeDoc = { date: string; startTime: string };

export default function AdminScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);

  const [scanned, setScanned] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<{
    bookingId: string;
    movie?: MovieDoc | null;
    showtime?: ShowtimeDoc | null;
    seats?: string[];
    seatType?: string;
    total?: number;
    status?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission]);

  const fetchDetails = async (id: string) => {
    const booking = await getBookingById(id);
    if (!booking) {
      setDetails({ bookingId: id, movie: null, showtime: null, status: "not-found" });
      return;
    }
    const [mSnap, sSnap] = await Promise.all([
      getDoc(doc(db, "movies", booking.movieId)),
      getDoc(doc(db, "showtimes", booking.showtimeId)),
    ]);
    setDetails({
      bookingId: booking.id,
      movie: mSnap.exists() ? (mSnap.data() as MovieDoc) : null,
      showtime: sSnap.exists() ? (sSnap.data() as ShowtimeDoc) : null,
      seats: booking.seats,
      seatType: booking.seatType,
      total: booking.total,
      status: booking.status,
    });
  };

  const handleScan = async (data: string) => {
    if (scanned) return;               // prevent duplicate fires
    setScanned(true);
    setScannedId(data);
    setLoading(true);
    try {
      await fetchDetails(data);
    } finally {
      setLoading(false);
    }
  };

  const redeem = async () => {
    if (!details?.bookingId) return;
    await markBookingRedeemed(details.bookingId);
    setDetails({ ...details, status: "redeemed" });
  };

  // Permission gates
  if (!permission) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
        <AdminHeader title="Scan QR" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Checking camera permission…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
        <AdminHeader title="Scan QR" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 12 }}>
          <Text style={{ textAlign: "center" }}>
            Camera access is required to scan tickets.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{ paddingVertical: 12, paddingHorizontal: 18, backgroundColor: "#2563eb", borderRadius: 12 }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <AdminHeader title="Scan QR" />

      {/* Scanner */}
      {!scanned && (
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: "#111" }}>Point camera at ticket QR</Text>

          <View style={{ height: 360, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e5e7eb", position: "relative" }}>
            <CameraView
              style={{ width: "100%", height: "100%" }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }) => data && handleScan(data)}
              onCameraReady={() => setReady(true)}
            />

            {/* green guide box */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 240,
                height: 240,
                marginTop: -120,
                marginLeft: -120,
                borderWidth: 3,
                borderColor: "#22c55e",
                borderRadius: 16,
              }}
            />
          </View>

          <Text style={{ color: "#666" }}>
            Hold steady ~15–25cm away. Ensure the QR has a white background.
          </Text>
        </View>
      )}

      {/* Details after scan */}
      {scanned && (
        <View style={{ padding: 16, gap: 12 }}>
          {loading ? (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8 }}>Fetching booking…</Text>
            </View>
          ) : details?.status === "not-found" ? (
            <View style={{ padding: 16, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" }}>
              <Text style={{ fontWeight: "700" }}>Booking not found</Text>
              <Text style={{ color: "#666", marginTop: 6 }}>ID: {details.bookingId}</Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => { setScanned(false); setScannedId(null); setDetails(null); }}
                  style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#111" }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ padding: 16, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff", gap: 6 }}>
              <Text style={{ fontWeight: "800", fontSize: 16 }}>{details?.movie?.title ?? "(Movie)"}</Text>
              <Text style={{ color: "#555" }}>
                {details?.showtime?.date} · {details?.showtime?.startTime}
              </Text>
              <Text style={{ color: "#555" }}>{details?.seatType} • {details?.seats?.join(", ")}</Text>
              <Text style={{ fontWeight: "700", marginTop: 4 }}>Total: {details?.total}</Text>
              <Text style={{ color: "#666", marginTop: 4, fontSize: 12 }}>ID: {details?.bookingId}</Text>
              <Text style={{ marginTop: 6, fontWeight: "700", color: details?.status === "redeemed" ? "#0a7" : "#b45309" }}>
                Status: {details?.status ?? "paid"}
              </Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {details?.status !== "redeemed" && (
                  <TouchableOpacity
                    onPress={redeem}
                    style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#0a7" }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Mark as Redeemed</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/(admin)/scan/receipt/[bookingId]", params: { bookingId: String(details?.bookingId) } })}
                  style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#111" }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Open Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { setScanned(false); setScannedId(null); setDetails(null); }}
                  style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" }}
                >
                  <Text style={{ color: "#111", fontWeight: "700" }}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
