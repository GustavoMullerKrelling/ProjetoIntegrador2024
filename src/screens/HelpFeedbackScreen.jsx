import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HelpFeedbackScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajuda e Feedback</Text>
      <Text style={styles.helpText}>
        Se você tiver alguma dúvida ou sugestão, entre em contato conosco!
      </Text>
      <Text style={styles.subTitle}>Feedback:</Text>
      <TextInput
        style={styles.input}
        placeholder="Escreva seu feedback aqui..."
        multiline
      />
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '600',
    color: '#4a4e69',
  },
  helpText: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    width: '80%',
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: '#9a8c98',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
