import { Text, ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { gql } from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import getClient from '../graphqlClient';

const setsQuery = gql`
  query ($exerciseName: String) {
    sets(exerciseName: $exerciseName) {
      _id
      weight
      reps
      date
      exerciseName
    }
  }
`;

const SetList = ({ exerciseName }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sets', exerciseName],
    queryFn: async () => {
      const client = await getClient();
      return client.request(setsQuery, { exerciseName });
    },
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error loading sets</Text>;
  if (!data?.sets?.length) return <Text>No sets found.</Text>;

  return (
    <FlatList
      data={data.sets}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.mainText}>
            {item.reps} reps × {item.weight} kg
          </Text>
          <Text style={styles.subText}>
            {new Date(item.date).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  mainText: {
    fontWeight: '600',
  },
  subText: {
    color: 'gray',
    fontSize: 12,
    marginTop: 4,
  },
});

export default SetList;
