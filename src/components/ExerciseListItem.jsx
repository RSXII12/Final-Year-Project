import {StyleSheet,Text, View, Pressable} from 'react-native';
import {Link} from 'expo-router';

export default function ExerciseListItem({item}) {
  return (
    //</Link><Link href={{ pathname: '/[name]', params: { name: item.name } }} asChild>
    <Link href = {`/${item.name}`} asChild>
      <Pressable style = {styles.exerciseContainer}>
        <Text style = {styles.exerciseName}>
          {item.name}              
        </Text>
        <Text style = {styles.exerciseSubtitle}>
          <Text style = {styles.subValue}> {item.muscle} </Text> | <Text style ={styles.subValue}>{item.equipment} </Text>
        </Text>
      </Pressable>
    </Link>
  );
}


const styles = StyleSheet.create({

  exerciseName:{
    fontSize : 20 ,
    fontWeight: '500'
  },

  exerciseSubtitle: {
    color : 'dimgray'
  },

  exerciseContainer: {
    backgroundColor: 'ghostwhite',
    padding: 10,
    borderRadius: 10,
    gap: 5,
    marginHorizontal: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,

    elevation: 2,
  },

  subValue: {
    textTransform: 'capitalize'
  }

});
