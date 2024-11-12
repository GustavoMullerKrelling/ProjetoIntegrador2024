import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function RotinaScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        title="Rotina de Estudante"
        onPress={() => navigation.navigate('Task', { type: 'Estudante' })}
      />
      <Button
        title="Rotina de Trabalho"
        onPress={() => navigation.navigate('Task', { type: 'Trabalho' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
