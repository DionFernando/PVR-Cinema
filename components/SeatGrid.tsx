// components/SeatGrid.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ROWS, COLS, makeSeatId, seatTypeFromId } from "../lib/seatConfig";

type Props = {
  reserved: string[];             // seats already booked
  selected: string[];             // current selection
  maxSelect: number;              // required count
  lockedType?: "Classic" | "Prime" | "Superior" | null;  // if set, only allow that type
  onToggle: (seatId: string) => void;
};

export default function SeatGrid({ reserved, selected, maxSelect, lockedType, onToggle }: Props) {
  const reservedSet = useMemo(() => new Set(reserved), [reserved]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // helpers
  const canSelect = (id: string) => {
    if (reservedSet.has(id)) return false;
    const type = seatTypeFromId(id);
    if (lockedType && type !== lockedType) return false;
    if (!selectedSet.has(id) && selected.length >= maxSelect) return false;
    return true;
  };

  const RowDivider = ({ label }: { label: string }) => (
    <View style={{ alignItems: "center", marginVertical: 8 }}>
      <View style={{ height: 1, backgroundColor: "#ddd", alignSelf: "stretch" }} />
      <Text style={{ marginTop: 6, color: "#555" }}>{label}</Text>
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
      {/* Seats */}
      {ROWS.map((r, idx) => {
        const showDividerAfter = r === "C" ? "Classic" : r === "F" ? "Prime" : null;

        return (
          <View key={r} style={{ marginBottom: 6 }}>
            {/* Row label */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ width: 18, textAlign: "right", color: "#666" }}>{r}</Text>

              {/* Seat cells */}
              <View style={{ flexDirection: "row", flexWrap: "nowrap", gap: 6 }}>
                {Array.from({ length: COLS }, (_, i) => i + 1).map((c) => {
                  const id = makeSeatId(r, c);
                  const isReserved = reservedSet.has(id);
                  const isSelected = selectedSet.has(id);
                  const selectable = canSelect(id);

                  const bg = isReserved ? "#ccc" : isSelected ? "#111" : "transparent";
                  const color = isReserved ? "#777" : isSelected ? "#fff" : "#111";
                  const border = isReserved ? "#bbb" : isSelected ? "#111" : "#999";

                  return (
                    <TouchableOpacity
                      key={id}
                      disabled={!selectable && !isSelected}
                      onPress={() => onToggle(id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: border,
                        backgroundColor: bg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 12, color }}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category divider label after C and F */}
            {showDividerAfter && <RowDivider label={showDividerAfter} />}
          </View>
        );
      })}

      {/* Screen + tip at the bottom */}
      <View style={{ marginTop: 16, alignItems: "center" }}>
        <View
          style={{
            height: 10,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            backgroundColor: "#222",
            width: "85%",
          }}
        />
        <Text style={{ marginTop: 8, color: "#666" }}>All eyes this way please</Text>
      </View>
    </View>
  );
}
