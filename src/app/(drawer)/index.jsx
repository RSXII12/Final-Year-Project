import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import ExerciseListItem from "../../components/ExerciseListItem";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import getClient from "../../utils/graphqlClient";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

const exercisesQuery = gql`
  query exercises(
    $muscle: String
    $q: String
    $equipment: String
    $limit: Int
    $offset: Int
  ) {
    exercises(
      muscle: $muscle
      q: $q
      equipment: $equipment
      limit: $limit
      offset: $offset
    ) {
      id
      name
      primaryMuscles
      equipment
    }
  }
`;

export default function ExercisesScreen() {
  const { token, loading, logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercises", token],
    queryFn: async () => {
      const client = await getClient();
      return client.request(exercisesQuery, {
        muscle: null,
        q: null,
        equipment: null,
        limit: 30,
        offset: 0,
      });
    },
    enabled: !!token && !loading,
  });

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading || isLoading) {
    return <ActivityIndicator />;
  }

  if (!token) return null;

  if (error) {
    return <Text>Something went wrong: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <FlatList
        data={data?.exercises || []}
        contentContainerStyle={{ gap: 5 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExerciseListItem item={item} />}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  logoutButton: {
    alignSelf: "flex-end",
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
  },

  logoutText: {
    color: "white",
    fontWeight: "600",
  },
});
