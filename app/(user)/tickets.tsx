import { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image, RefreshControl } from "react-native";
import { useAuth } from "../../store/AuthProvider";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { toSafeImageUri } from "../../utils/url";
import { POSTER_FALLBACK } from "../../lib/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors, radius, spacing } from "../../lib/theme";

type BookingDoc = {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  seats: string[];
  seatType: "Classic" | "Prime" | "Superior";
  total: number;
  createdAt?: { seconds: number; nanoseconds: number } | any;
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
  const [rows, setRows] = useState<
    { booking: BookingDoc; movie: MovieDoc | null; showtime: ShowtimeDoc | null }[]
  >([]);

  const load = async () => {
    if (!fbUser) return;
    setLoading(true);
    try {
      const qRef = query(collection(db, "bookings"), where("userId", "==", fbUser.uid));
      const snap = await getDocs(qRef);

      const items = await Promise.all(
        snap.docs.map(async (d) => {
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

      const now = Date.now();
      const withKeys = items.map((r) => {
        const dt = parseShowDateTime(r.showtime);
        const createdMs =
          (r.booking.createdAt?.seconds ? r.booking.createdAt.seconds * 1000 : null) ?? 0;
        return { r, dtMs: dt ? dt.getTime() : createdMs };
      });

      withKeys.sort((a, b) => {
        const aFuture = a.dtMs >= now;
        const bFuture = b.dtMs >= now;
        if (aFuture !== bFuture) return aFuture ? -1 : 1;
        return aFuture ? a.dtMs - b.dtMs : b.dtMs - a.dtMs;
      });

      setRows(withKeys.map((w) => w.r));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [fbUser]);

  const now = Date.now();
  const grouped = useMemo(() => {
    const upcoming: typeof rows = [];
    const past: typeof rows = [];
    rows.forEach((r) => {
      const dt = parseShowDateTime(r.showtime)?.getTime() ?? 0;
      (dt >= now ? upcoming : past).push(r);
    });
    return { upcoming, past };
  }, [rows]);

  const Card = ({ r }: { r: (typeof rows)[number] }) => {
    const uri = toSafeImageUri(r.movie?.posterUrl || "") || POSTER_FALLBACK;
    const dtStr = r.showtime ? `${r.showtime.date} · ${r.showtime.startTime}` : "—";
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.card,
        }}
      >
        <Image
          source={{ uri }}
          style={{ width: 80, height: 110, borderRadius: radius.sm, backgroundColor: "#1a1a1a" }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "800" }} numberOfLines={1}>
            {r.movie?.title || "Movie"}
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: 2 }}>{dtStr}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>
            {r.booking.seatType} • {r.booking.seats.join(", ")}
          </Text>
          <Text style={{ color: colors.text, marginTop: 2, fontWeight: "700" }}>
            Total: {r.booking.total}
          </Text>
          <Text style={{ color: colors.textSubtle, marginTop: 4, fontSize: 12 }}>
            ID: {r.booking.id}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: colors.text, marginTop: 8 }}>Loading tickets…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.accent}
          />
        }
      >
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>My Tickets</Text>

        {/* Upcoming */}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <View
              style={{ width: 6, height: 18, backgroundColor: colors.accent, borderRadius: 3 }}
            />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>
              Upcoming ({grouped.upcoming.length})
            </Text>
          </View>
          {grouped.upcoming.length === 0 ? (
            <Text style={{ color: colors.textSubtle }}>No upcoming tickets.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {grouped.upcoming.map((r) => (
                <Card key={r.booking.id} r={r} />
              ))}
            </View>
          )}
        </View>

        {/* Past */}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 }}>
            <View
              style={{ width: 6, height: 18, backgroundColor: colors.accent, borderRadius: 3 }}
            />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>
              Past ({grouped.past.length})
            </Text>
          </View>
          {grouped.past.length === 0 ? (
            <Text style={{ color: colors.textSubtle }}>No past tickets.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {grouped.past.map((r) => (
                <Card key={r.booking.id} r={r} />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
