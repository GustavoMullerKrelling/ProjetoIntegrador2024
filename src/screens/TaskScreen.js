import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';

export default function TaskScreen({ route }) {
  const { type } = route.params;
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const [tasks, setTasks] = useState(Array(24).fill(''));

  const handleTaskChange = (text, index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = text;
    setTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`Rotina de ${type}`}</Text>
      <FlatList
        data={hours}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.hour}>{item}</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua tarefa"
              value={tasks[index]}
              onChangeText={(text) => handleTaskChange(text, index)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hour: {
    width: 50,
    fontSize: 16,
  },
  input: {
    flex: 1,
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
});
