import React, { useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import getClient from "../graphqlClient";

const allWorkoutsQuery = gql`
  query {
    workouts {
      _id
      exerciseName
      reps
      weight
      date
    }
  }
`;

export default function WorkoutCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const client = await getClient();
      return client.request(allWorkoutsQuery);
    },
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error loading workouts</Text>;

  const workouts = data?.workouts || [];

  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const markedDates = sorted.reduce((acc, w) => {
    const d = new Date(w.date).toISOString().split("T")[0];
    acc[d] = { ...(acc[d] || {}), marked: true, dotColor: "#3b82f6" };
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: "#3b82f6",
    };
  }

  const workoutsForDay = selectedDate
    ? sorted.filter(
        (w) => new Date(w.date).toISOString().split("T")[0] === selectedDate
      )
    : [];

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
      />

      <Text style={styles.heading}>
        {selectedDate ? `Workouts on ${selectedDate}` : "Select a date"}
      </Text>

      <View style={styles.listContainer}>
        {selectedDate ? (
          workoutsForDay.length > 0 ? (
            <FlatList
              data={workoutsForDay}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                  <Text style={styles.setText}>
                    {item.reps} reps × {item.weight}kg
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(item.date).toLocaleTimeString()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noData}>
              No workouts logged on this day
            </Text>
          )
        ) : (
          <Text style={styles.noData}>Select a date to view workouts</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f8f9fa" },
  heading: {
    textAlign: "center",
    fontWeight: "600",
    marginVertical: 10,
  },
  listContainer: { marginTop: 10, flex: 1 },
  card: {
    backgroundColor: "white",
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseName: { fontWeight: "700", fontSize: 16, marginBottom: 5 },
  setText: { fontSize: 14 },
  dateText: { fontSize: 12, color: "gray", marginTop: 4 },
  noData: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
    fontSize: 14,
  },
});
