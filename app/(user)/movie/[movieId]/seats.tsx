import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function SeatsPlaceholder() {
  const { movieId, showtimeId, seatCount } = useLocalSearchParams<{
    movieId: string;
    showtimeId: string;
    seatCount: string;
  }>();

  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:"700" }}>Seats — Coming Next</Text>
      <Text style={{ marginTop:8 }}>movieId: {String(movieId)}</Text>
      <Text>showtimeId: {String(showtimeId)}</Text>
      <Text>seatCount: {String(seatCount)}</Text>
    </View>
  );
}
