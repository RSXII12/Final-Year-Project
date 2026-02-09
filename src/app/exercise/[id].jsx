import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import getClient from "../../graphqlClient"; // adjust if your path differs

const exerciseQuery = gql`
  query exercise($id: ID!) {
    exercise(id: $id) {
      id
      name
      category
      difficulty
      equipment
      primaryMuscles
      secondaryMuscles
      instructions
    }
  }
`;

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercise", id],
    queryFn: async () => {
      const client = await getClient();
      return client.request(exerciseQuery, { id });
    },
    enabled: !!id,
  });

  if (isLoading) return <ActivityIndicator style={{ marginTop: 30 }} />;
  if (error) return <Text style={{ padding: 10 }}>Error: {error.message}</Text>;

  const ex = data?.exercise;
  if (!ex) return <Text style={{ padding: 10 }}>Exercise not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{ex.name}</Text>

      <Text style={styles.meta}>
        {ex.primaryMuscles?.join(", ") || "—"}{"  "}•{"  "}
        {ex.equipment?.join(", ") || "—"}
      </Text>

      {!!ex.secondaryMuscles?.length && (
        <Text style={styles.section}>Secondary: {ex.secondaryMuscles.join(", ")}</Text>
      )}

      {!!ex.category && <Text style={styles.section}>Category: {ex.category}</Text>}
      {ex.difficulty != null && <Text style={styles.section}>Difficulty: {ex.difficulty}</Text>}

      <Text style={styles.h2}>Instructions</Text>
      {(ex.instructions?.length ? ex.instructions : ["No instructions available."]).map((step, idx) => (
        <Text key={idx} style={styles.step}>
          {idx + 1}. {step}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  meta: { color: "dimgray", marginBottom: 12 },
  h2: { fontSize: 18, fontWeight: "700", marginTop: 14, marginBottom: 8 },
  section: { marginTop: 6 },
  step: { marginBottom: 8, lineHeight: 20 },
});