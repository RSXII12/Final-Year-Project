import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { gql } from "graphql-request";
import { useQuery } from "@tanstack/react-query";
import getClient from "../graphqlClient";
import NewSetInput from "../components/NewSetInput";
import SetList from "../components/SetList";
import { useState } from "react";

const exerciseDetailsQuery = gql`
  query exercises($name: String) {
    exercises(name: $name) {
      name
      muscle
      instructions
      equipment
    }
  }
`;

export default function ExerciseDetailsScreen() {
  const { name } = useLocalSearchParams();
  const [isInstructionExpanded, setIsInstructionExpanded] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercise", name],
    queryFn: async () => {
      const client = await getClient();
      return client.request(exerciseDetailsQuery, { name });
    },
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text> Something went wrong: {error.message} </Text>;

  const exercise = data?.exercises?.[0];
  if (!exercise) return <Text>Exercise not found</Text>;

  return (
    <FlatList
      data={[]}       // FlatList must have data, so we give an empty array
      ListHeaderComponent={
        <View style={styles.container}>
          <Stack.Screen options={{ title: exercise.name }} />

          <View style={styles.panel}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseSubtitle}>
              <Text style={styles.subValue}>{exercise.muscle}</Text> |{" "}
              <Text style={styles.subValue}>{exercise.equipment}</Text>
            </Text>
          </View>

          <View style={styles.panel}>
            <Text
              style={styles.instructions}
              numberOfLines={isInstructionExpanded ? 0 : 3}
            >
              {exercise.instructions}
            </Text>
            <Text
              onPress={() => setIsInstructionExpanded(!isInstructionExpanded)}
              style={styles.seeMore}
            >
              {isInstructionExpanded ? "See less" : "See more"}
            </Text>
          </View>

          <View style={styles.panel}>
            <NewSetInput exerciseName={exercise.name} />
          </View>

          <View style={styles.panel}>
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>
              Logged sets
            </Text>
            <SetList exerciseName={exercise.name} />
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  exerciseName: {
    fontSize: 20,
    fontWeight: "500",
  },
  exerciseSubtitle: {
    color: "dimgray",
  },
  subValue: {
    textTransform: "capitalize",
  },
  container: {
    gap: 10,
    padding: 10,
  },
  instructions: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    gap: 5,
    marginHorizontal: 3,
  },
  seeMore: {
    color: "skyblue",
    marginTop: 10,
    fontWeight: "500",
    alignSelf: "center",
  },
});
