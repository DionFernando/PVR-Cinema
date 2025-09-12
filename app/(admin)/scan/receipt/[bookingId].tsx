import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import AdminHeader from "../../../../components/AdminHeader";
import { getBookingById } from "../../../../lib/bookingService";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type MovieDoc = { title: string };
type ShowtimeDoc = { date: string; startTime: string };

export default function AdminReceipt() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{
    id: string;
    movie?: MovieDoc | null;
    showtime?: ShowtimeDoc | null;
    seats?: string[];
    seatType?: string;
    total?: number;
    status?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const booking = await getBookingById(String(bookingId));
        if (!booking) {
          setErr("Booking not found");
          return;
        }
        const [mSnap, sSnap] = await Promise.all([
          getDoc(doc(db, "movies", booking.movieId)),
          getDoc(doc(db, "showtimes", booking.showtimeId)),
        ]);
        setData({
          id: booking.id,
          movie: mSnap.exists() ? (mSnap.data() as MovieDoc) : null,
          showtime: sSnap.exists() ? (sSnap.data() as ShowtimeDoc) : null,
          seats: booking.seats,
          seatType: booking.seatType,
          total: booking.total,
          status: booking.status,
        });
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load booking");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const printNow = () => {
    if (Platform.OS === "web") {
      window.print();
    } else {
      alert("Use the browser to print this receipt (web only).");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7f9" }} edges={["top"]}>
      <AdminHeader title="Receipt" />
      <View style={{ padding: 16 }}>
        {loading ? (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Preparing receipt…</Text>
          </View>
        ) : err ? (
          <Text style={{ color: "#b91c1c" }}>{err}</Text>
        ) : (
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 16, gap: 6 }}>
            <Text style={{ fontWeight: "800", fontSize: 16 }}>{data?.movie?.title ?? "(Movie)"}</Text>
            <Text style={{ color: "#555" }}>
              {data?.showtime?.date} · {data?.showtime?.startTime}
            </Text>
            <Text style={{ color: "#555" }}>{data?.seatType} • {data?.seats?.join(", ")}</Text>
            <Text style={{ fontWeight: "700", marginTop: 4 }}>Total: {data?.total}</Text>
            <Text style={{ color: "#666", marginTop: 4, fontSize: 12 }}>ID: {data?.id}</Text>
            <Text style={{ marginTop: 6, fontWeight: "700" }}>Status: {data?.status ?? "paid"}</Text>

            <TouchableOpacity
              onPress={printNow}
              style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#111", alignSelf: "flex-start" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Print</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
