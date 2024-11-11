import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, storage } from '../config/firebase'; // Certifique-se de importar o storage corretamente
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('HomeScreen');
      }
    });

    return unsubscribe;
  }, []);

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('Usuário cancelou a seleção de imagem');
      } else if (response.errorMessage) {
        console.error('Erro ao selecionar imagem:', response.errorMessage);
        Alert.alert('Erro', 'Ocorreu um erro ao selecionar a imagem.');
      } else if (response.assets && response.assets.length > 0) {
        try {
          const sourceUri = response.assets[0].uri;
          setProfileImageUrl(sourceUri); // Mostra a imagem selecionada imediatamente

          const storageRef = ref(storage, `profileImages/${email}`);
          const responseBlob = await fetch(sourceUri);
          const blob = await responseBlob.blob();

          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

          setProfileImageUrl(downloadURL); // Atualiza com o URL de download após o upload
          Alert.alert('Sucesso', 'Imagem de perfil carregada com sucesso!');
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          Alert.alert('Erro', 'Não foi possível fazer o upload da imagem.');
        }
      } else {
        console.error('Erro: Nenhum arquivo selecionado ou estrutura de resposta inesperada.');
        Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
      }
    });
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Cadastro realizado com sucesso!', `Bem-vindo, ${email}`);
      setIsLogin(true);
    } catch (error) {
      handleError(error.code);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login realizado com sucesso!', `Bem-vindo, ${email}`);
      navigation.navigate('HomeScreen');
    } catch (error) {
      handleError(error.code);
    } finally {
      setIsLoading(false);
    }
  };

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
      {!isLogin && (
        <>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={100} color="#ccc" style={styles.defaultProfileIcon} />
          )}
          <TouchableOpacity style={styles.imagePickerButton} onPress={openImagePicker}>
            <Text style={styles.imagePickerButtonText}>Escolher Imagem</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.brandTitle}>Pomofocus</Text>
      <Text style={styles.title}>{isLogin ? 'Fazer Login' : 'Fazer Cadastro'}</Text>

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

      <TouchableOpacity
        style={styles.button}
        onPress={isLogin ? handleLogin : handleSignup}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

      <View style={styles.buttonSpacing}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIsLogin(!isLogin);
            setErrorMessage(''); // Limpa a mensagem de erro ao alternar
          }}
        >
          <Text style={styles.buttonText}>
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </Text>
        </TouchableOpacity>
      </View>
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
  brandTitle: {
    fontSize: 36,
    textAlign: 'center',
    color: 'black',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  defaultProfileIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  imagePickerButton: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
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
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonSpacing: {
    marginTop: 10, // Adiciona espaçamento entre os botões
  },
  button: {
    backgroundColor: '#007bff', // Cor do botão
    borderRadius: 5, // Raio da borda
    paddingVertical: 10, // Espaçamento vertical interno
    alignItems: 'center', // Centraliza o texto
  },
  buttonText: {
    color: '#fff', // Cor do texto do botão
    fontSize: 16,
  },
});
