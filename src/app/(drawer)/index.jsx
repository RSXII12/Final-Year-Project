import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import ExerciseListItem from '../../components/ExerciseListItem';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import getClient from '../../graphqlClient';
import { Link, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

const exercisesQuery = gql`
  query exercises($muscle: String, $name: String) {
    exercises(muscle: $muscle, name: $name) {
      name
      muscle
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
  }, [loading, token]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const client = await getClient();
      return client.request(exercisesQuery);
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
    return <Text> Something went wrong: {error.message} </Text>;
  }

  return (
    <View style={styles.container}>

      {/* Logout button */}
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <FlatList
        data={data?.exercises || []}
        contentContainerStyle={{ gap: 5 }}
        keyExtractor={(item, index) => item.name + index}
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

  historyButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },

  historyText: {
    color: 'white',
    fontWeight: '600',
  },
});
