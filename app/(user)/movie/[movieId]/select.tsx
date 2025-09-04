import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { listShowtimesByMovie } from "../../../../lib/showtimeService";
import type { Showtime } from "../../../../lib/types";

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default function SelectShowtime() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [seatCount, setSeatCount] = useState<number>(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (movieId) {
          const sts = await listShowtimesByMovie(String(movieId));
          setShowtimes(sts);
          if (sts.length) setDate(sts[0].date); // default to first available date
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [movieId]);

  const dates = useMemo(() => uniq(showtimes.map(s => s.date)), [showtimes]);
  const timesForDate = useMemo(
    () => showtimes.filter(s => s.date === date).map(s => s.startTime),
    [showtimes, date]
  );

  const selectedShowtime = useMemo(
    () => showtimes.find(s => s.date === date && s.startTime === time) || null,
    [showtimes, date, time]
  );

  const proceed = () => {
    if (!movieId || !selectedShowtime) return;
    router.push({
      pathname: "/(user)/movie/[movieId]/seats",
      params: {
        movieId: String(movieId),
        showtimeId: selectedShowtime.id,
        seatCount: String(seatCount),
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop:8 }}>Loading showtimes…</Text>
      </View>
    );
  }

  if (!showtimes.length) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding:16 }}>
        <Text>No showtimes available for this movie.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:16 }}>
      <Text style={{ fontSize:20, fontWeight:"700" }}>Select Date</Text>

      <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8 }}>
        {dates.map(d => {
          const active = d === date;
          return (
            <TouchableOpacity
              key={d}
              onPress={() => { setDate(d); setTime(""); }}
              style={{
                paddingVertical:10, paddingHorizontal:14, borderRadius:999,
                borderWidth:1, borderColor: active ? "#111" : "#ccc",
                backgroundColor: active ? "#111" : "transparent"
              }}
            >
              <Text style={{ color: active ? "#fff" : "#111" }}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={{ fontSize:20, fontWeight:"700", marginTop:8 }}>Select Time</Text>

      <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8 }}>
        {timesForDate.length ? timesForDate.map(t => {
          const active = t === time;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTime(t)}
              style={{
                paddingVertical:10, paddingHorizontal:14, borderRadius:999,
                borderWidth:1, borderColor: active ? "#111" : "#ccc",
                backgroundColor: active ? "#111" : "transparent"
              }}
            >
              <Text style={{ color: active ? "#fff" : "#111" }}>{t}</Text>
            </TouchableOpacity>
          );
        }) : (
          <Text style={{ color:"#666" }}>No times for this date.</Text>
        )}
      </View>

      <Text style={{ fontSize:20, fontWeight:"700", marginTop:8 }}>Select Seat Count</Text>

      <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const active = n === seatCount;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => setSeatCount(n)}
              style={{
                width:48, height:48, borderRadius:12,
                alignItems:"center", justifyContent:"center",
                borderWidth:1, borderColor: active ? "#111" : "#ccc",
                backgroundColor: active ? "#111" : "transparent"
              }}
            >
              <Text style={{ color: active ? "#fff" : "#111", fontWeight:"600" }}>{n}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={proceed}
        disabled={!selectedShowtime}
        style={{
          marginTop:8, padding:14, borderRadius:10,
          backgroundColor: selectedShowtime ? "#0a7" : "#aaa"
        }}
      >
        <Text style={{ textAlign:"center", color:"#fff", fontWeight:"700" }}>
          {selectedShowtime ? "Proceed" : "Select date & time"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
