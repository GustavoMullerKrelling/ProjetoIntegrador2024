import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { auth } from '../config/firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); 
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation(); 

  // Verifica se o usuário está autenticado ao abrir o app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('HomeScreen'); // Redireciona para a tela principal se já estiver logado
      }
    });

    return unsubscribe; // Cleanup listener
  }, []);

  // Função para lidar com login
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        Alert.alert("Login realizado com sucesso!", `Bem-vindo, ${userCredential.user.email}`);
        navigation.navigate('HomeScreen'); 
      })
      .catch(error => {
        handleError(error.code); // Chama a função de tratamento de erros
      });
  };

  // Função para lidar com cadastro
  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        Alert.alert("Cadastro realizado com sucesso!", `Bem-vindo, ${userCredential.user.email}`);
        setIsLogin(true);
      })
      .catch(error => {
        handleError(error.code);
      });
  };

  // Função para lidar com erros
  const handleError = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        setErrorMessage('Formato de e-mail inválido.');
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setErrorMessage('E-mail ou senha incorretos.');
        break;
      case 'auth/email-already-in-use':
        setErrorMessage('Este e-mail já está em uso.');
        break;
      case 'auth/weak-password':
        setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
        break;
      default:
        setErrorMessage('Ocorreu um erro inesperado.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Cadastro'}</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={isLogin ? 'Entrar' : 'Cadastrar'}
        onPress={isLogin ? handleLogin : handleSignup}
      />

      <Button
        title={isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
        onPress={() => setIsLogin(!isLogin)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
