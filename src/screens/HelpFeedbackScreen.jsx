import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, Alert, TextInput, TouchableOpacity } from 'react-native';

export default function HelpFeedbackScreen() {
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleFeedback = () => {
    if (feedbackMessage.trim() === '') {
      Alert.alert('Erro', 'Por favor, escreva uma mensagem antes de enviar.');
      return;
    }

    Alert.alert(
      'Obrigado pelo seu feedback!',
      'Sua mensagem foi enviada com sucesso. Sua opinião é muito importante para nós.'
    );
    // Aqui você pode integrar com um serviço de backend ou API para enviar o feedback
    setFeedbackMessage(''); // Limpa o campo de texto após o envio
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao aplicativo!</Text>

      <Text style={styles.subtitle}>Como usar o aplicativo:</Text>
      <Text style={styles.text}>
        Navegue entre as diferentes seções usando a barra de navegação. Você pode acessar suas notas, listas e outras funcionalidades diretamente pela tela inicial.
      </Text>

      <Text style={styles.subtitle}>Pesquisar notas e listas:</Text>
      <Text style={styles.text}>
        Utilize a barra de pesquisa localizada no topo da tela para encontrar rapidamente notas e listas. Basta digitar uma palavra-chave e os resultados correspondentes aparecerão.
      </Text>

      <Text style={styles.subtitle}>Criar ou editar uma nota:</Text>
      <Text style={styles.text}>
        Para criar uma nova nota, pressione o botão de "Nova Nota" na tela inicial. Para editar uma nota existente, clique na nota desejada e selecione a opção "Editar". Lembre-se de salvar suas alterações antes de sair.
      </Text>

      <View style={styles.feedbackContainer}>
        <Text style={styles.subtitle}>Enviar Feedback ou Relatar Erro:</Text>
        <Text style={styles.text}>
          Sua opinião é muito importante para nós! Descreva seu feedback ou qualquer problema que encontrou abaixo e clique em "Enviar".
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu feedback ou relatório de erro aqui..."
          value={feedbackMessage}
          onChangeText={setFeedbackMessage}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleFeedback}>
          <Text style={styles.buttonText}>Enviar Feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a4e69',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4e69',
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4e69',
    textAlign: 'left',
    marginTop: 10,
  },
  feedbackContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  input: {
    marginTop: 15,
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4a4e69',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
