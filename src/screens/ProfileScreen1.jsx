import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth, db, storage } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfileScreen({ navigation }) {
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EA4335" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (auth.currentUser) {
      fetchProfileData();
    }
  }, [auth.currentUser]);

  const fetchProfileData = async () => {
    if (auth.currentUser) {
      try {
        const userProfileDoc = doc(db, 'users', auth.currentUser.uid);
        const userProfileSnapshot = await getDoc(userProfileDoc);
        if (userProfileSnapshot.exists()) {
          const data = userProfileSnapshot.data();
          setProfileImageUrl(data.profileImageUrl);
          setName(data.name || '');
          setEmail(data.email || auth.currentUser.email || '');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
      }
    }
  };

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
      } else {
        try {
          if (auth.currentUser) {
            const source = { uri: response.assets[0].uri };
            setProfileImageUrl(source.uri);

            const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
            const responseBlob = await fetch(response.assets[0].uri);
            const blob = await responseBlob.blob();

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            setProfileImageUrl(downloadURL);
            await setDoc(doc(db, 'users', auth.currentUser.uid), { profileImageUrl: downloadURL }, { merge: true });

            Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso!');
          } else {
            Alert.alert('Erro', 'Usuário não autenticado.');
          }
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          Alert.alert('Erro', 'Não foi possível fazer o upload da imagem.');
        }
      }
    });
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos.');
      return;
    }

    try {
      const updateData = {
        name,
        email,
      };

      if (password.trim()) {
        await auth.currentUser.updatePassword(password);
        Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
      }

      await setDoc(doc(db, 'users', auth.currentUser.uid), updateData, { merge: true });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');

      // Redireciona para a tela Home após salvar as alterações
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('LoginScreen');
    } catch (error) {
      Alert.alert('Erro ao sair da conta', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={120} color="#ccc" />
          )}
        </View>

        <TouchableOpacity style={styles.cameraButton} onPress={openImagePicker}>
          <Ionicons name="camera" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  profileContainer: {
    position: 'relative',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    overflow: 'hidden',
    width: 140,
    height: 140,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#4285F4',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#34A853',
    paddingVertical: 14,
    borderRadius: 12,
    width: '50%',
    alignItems: 'center',
    marginTop: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});
