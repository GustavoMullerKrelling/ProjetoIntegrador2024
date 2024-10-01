import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Cadastro

  // Função para lidar com login
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        Alert.alert("Login realizado com sucesso!", `Bem-vindo, ${userCredential.user.email}`);
      })
      .catch(error => {
        Alert.alert("Erro ao fazer login", error.message);
      });
  };

  // Função para lidar com cadastro
  const handleSignup = () => {

    createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        Alert.alert("Cadastro realizado com sucesso!", `Bem-vindo, ${userCredential.user.email}`);
      })
      .catch(error => {
        Alert.alert("Erro ao se cadastrar", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Cadastro'}</Text>

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
        onPress={() => setIsLogin(!isLogin)} // Alterna entre Login e Cadastro
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
});
