import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image, RefreshControl, TouchableOpacity, Modal } from "react-native";
import { useAuth } from "../../store/AuthProvider";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { toSafeImageUri } from "../../utils/url";
import { POSTER_FALLBACK } from "../../lib/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import QRCode from "react-native-qrcode-svg";
import { colors } from "../../lib/theme";

type BookingDoc = {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  seats: string[];
  seatType: "Classic" | "Prime" | "Superior" | "Mixed";
  total: number;
  status?: "paid" | "redeemed";
  createdAt?: any;
};
type MovieDoc = { title: string; posterUrl?: string };
type ShowtimeDoc = { date: string; startTime: string };

function parseShowDateTime(st?: ShowtimeDoc | null) {
  if (!st) return null;
  const dt = new Date(`${st.date}T${st.startTime}:00`);
  return isNaN(+dt) ? null : dt;
}

export default function Tickets() {
  const { fbUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<{ booking: BookingDoc; movie: MovieDoc | null; showtime: ShowtimeDoc | null }[]>([]);
  const [qrOpen, setQrOpen] = useState<{ id: string; title: string } | null>(null);

  const load = async () => {
    if (!fbUser) return;
    setLoading(true);
    try {
      const qRef = query(collection(db, "bookings"), where("userId", "==", fbUser.uid));
      const snap = await getDocs(qRef);

      const items = await Promise.all(
        snap.docs.map(async d => {
          const booking = { id: d.id, ...(d.data() as any) } as BookingDoc;
          const [mSnap, sSnap] = await Promise.all([
            getDoc(doc(db, "movies", booking.movieId)),
            getDoc(doc(db, "showtimes", booking.showtimeId)),
          ]);
          const movie = mSnap.exists() ? (mSnap.data() as MovieDoc) : null;
          const showtime = sSnap.exists() ? (sSnap.data() as ShowtimeDoc) : null;
          return { booking, movie, showtime };
        })
      );

      // move redeemed into "past" immediately
      const now = Date.now();
      const withKeys = items.map(r => {
        const dt = parseShowDateTime(r.showtime);
        const effective = r.booking.status === "redeemed" ? now - 1 : (dt ? dt.getTime() : now);
        return { r, key: effective };
      });
      // upcoming first asc, past desc
      withKeys.sort((a, b) => {
        const aFuture = a.key >= now;
        const bFuture = b.key >= now;
        if (aFuture !== bFuture) return aFuture ? -1 : 1;
        return aFuture ? a.key - b.key : b.key - a.key;
      });

      setRows(withKeys.map(w => w.r));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [fbUser]);

  const now = Date.now();
  const grouped = useMemo(() => {
    const upcoming: typeof rows = [];
    const past: typeof rows = [];
    rows.forEach(r => {
      const dtMs = parseShowDateTime(r.showtime)?.getTime() ?? 0;
      const isRedeemed = r.booking.status === "redeemed";
      (isRedeemed || dtMs < now ? past : upcoming).push(r);
    });
    return { upcoming, past };
  }, [rows]);

  const Card = ({ r }: { r: (typeof rows)[number] }) => {
    const uri = toSafeImageUri(r.movie?.posterUrl || "") || POSTER_FALLBACK;
    const dtStr = r.showtime ? `${r.showtime.date} · ${r.showtime.startTime}` : "—";
    const isUpcoming = r.booking.status !== "redeemed" && (parseShowDateTime(r.showtime)?.getTime() ?? 0) >= now;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => { if (isUpcoming) setQrOpen({ id: r.booking.id, title: r.movie?.title ?? "Ticket" }); }}
        style={{ flexDirection: "row", gap: 12, padding: 12, borderWidth: 1, borderColor: "#222", borderRadius: 12, backgroundColor: "#111" }}
      >
        <Image source={{ uri }} style={{ width: 80, height: 110, borderRadius: 8, backgroundColor: "#1a1a1a" }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "800" }} numberOfLines={1}>{r.movie?.title || "Movie"}</Text>
          <Text style={{ color: "#bbb", marginTop: 2 }}>{dtStr}</Text>
          <Text style={{ color: "#bbb", marginTop: 6 }}>{r.booking.seatType} • {r.booking.seats.join(", ")}</Text>
          <Text style={{ color: "#ddd", marginTop: 2, fontWeight: "700" }}>Total: {r.booking.total}</Text>
          <Text style={{ color: isUpcoming ? "#22c55e" : "#888", marginTop: 4, fontSize: 12 }}>
            {isUpcoming ? "Tap to view QR" : "Past / Redeemed"}
          </Text>
        </View>
        {/* small QR preview for upcoming */}
        {isUpcoming && (
          <View style={{ width: 64, height: 64, backgroundColor: "#fff", borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
            <QRCode value={r.booking.id} size={56} color="#000" backgroundColor="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0b0b", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#ffd000" />
        <Text style={{ color: "#fff", marginTop: 8 }}>Loading tickets…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b" }} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor="#ffd000"
          />
        }
      >
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>My Tickets</Text>

        {/* Upcoming */}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <View style={{ width: 6, height: 18, backgroundColor: "#ffd000", borderRadius: 3 }} />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
              Upcoming ({grouped.upcoming.length})
            </Text>
          </View>
          {grouped.upcoming.length === 0 ? (
            <Text style={{ color: "#888" }}>No upcoming tickets.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {grouped.upcoming.map(r => <Card key={r.booking.id} r={r} />)}
            </View>
          )}
        </View>

        {/* Past */}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 }}>
            <View style={{ width: 6, height: 18, backgroundColor: "#ffd000", borderRadius: 3 }} />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
              Past ({grouped.past.length})
            </Text>
          </View>
          {grouped.past.length === 0 ? (
            <Text style={{ color: "#888" }}>No past tickets.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {grouped.past.map(r => <Card key={r.booking.id} r={r} />)}
            </View>
          )}
        </View>

        <View style={{ height: 10 }} />
      </ScrollView>

      {/* Big QR modal */}
      <Modal visible={!!qrOpen} transparent animationType="fade" onRequestClose={() => setQrOpen(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <View style={{ alignItems: "center", gap: 12 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{qrOpen?.title}</Text>

            {/* Put the QR on a white tile */}
            <View
              style={{
                backgroundColor: "#fff",
                padding: 16,
                borderRadius: 16,
              }}
            >
              {qrOpen?.id ? (
                <QRCode
                  value={qrOpen.id}
                  size={260}
                  color="#000"
                  backgroundColor="#fff"
                />
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => setQrOpen(null)}
              style={{ marginTop: 8, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: "#ffd000", borderRadius: 12 }}
            >
              <Text style={{ fontWeight: "900", color: "#000" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
