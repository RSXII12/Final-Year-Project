import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import getClient from "../utils/graphqlClient";

const ADD_WORKOUT_MUTATION = gql`
  mutation AddWorkout($exerciseName: String!, $reps: Int!, $weight: Float) {
    addWorkout(exerciseName: $exerciseName, reps: $reps, weight: $weight) {
      _id
      exerciseName
      reps
      weight
      date
    }
  }
`;

const NewSetInput = ({ exerciseName }) => {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const queryClient = useQueryClient();

  const addSet = async () => {
    try {
      const client = await getClient();

      const variables = {
        exerciseName,
        reps: parseInt(reps, 10),
        weight: weight ? parseFloat(weight) : null,
      };

      await client.request(ADD_WORKOUT_MUTATION, variables);

      // Clear inputs
      setReps("");
      setWeight("");

      // Refetch sets for this exercise
      queryClient.invalidateQueries({ queryKey: ["sets", exerciseName] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    } catch (err) {
      console.error("❌ Error saving workout:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Log set</Text>
      <TextInput
        value={reps}
        onChangeText={setReps}
        placeholder="Reps"
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        value={weight}
        onChangeText={setWeight}
        placeholder="Weight"
        style={styles.input}
        keyboardType="numeric"
      />

      <Button title="Add Set" onPress={addSet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "gainsboro",
    padding: 10,
    flex: 1,
    borderRadius: 5,
  },
});

export default NewSetInput;
