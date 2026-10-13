
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { PetWeight } from "../services/weightService";

type Props = {
  weights: PetWeight[];
};

export function WeightChart({ weights }: Props) {
  const chartData = useMemo(() => {
    return [...weights]
      .sort((a, b) =>
        a.recorded_at.localeCompare(b.recorded_at),
      )
      .map((item) => {
        const [year, month, day] =
          item.recorded_at.slice(0, 10).split("-");

        return {
          value: Number(item.weight),
          label: `${day}/${month}`,
          dataPointText: `${item.weight}`,
        };
      });
  }, [weights]);

  if (chartData.length < 2) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Evolução do peso
        </Text>

        <Text style={styles.empty}>
          Registre pelo menos dois pesos para
          visualizar o gráfico.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Evolução do peso
      </Text>

      <Text style={styles.subtitle}>
        Histórico de peso em kg
      </Text>

      <View style={styles.chart}>
        <LineChart
          data={chartData}
          color="#2563EB"
          thickness={3}
          dataPointsColor="#2563EB"
          dataPointsRadius={5}
          textColor1="#374151"
          textFontSize={11}
          curved
          hideRules
          yAxisColor="#D1D5DB"
          xAxisColor="#D1D5DB"
          initialSpacing={18}
          spacing={65}
          scrollToEnd
          isAnimated
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginTop: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 20,
  },

  chart: {
    overflow: "hidden",
  },

  empty: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 12,
    lineHeight: 22,
  },
});
