import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth, db, storage } from '../config/firebase'; // Certifique-se de importar storage do arquivo de configuração do Firebase
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfileScreen({ navigation }) {
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [name, setName] = useState('');
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

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
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
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
          const source = { uri: response.assets[0].uri };
          // Atualiza a visualização do ícone imediatamente
          setProfileImageUrl(source.uri);

          const storageRef = ref(storage, `profileImages/${auth.currentUser.email}`);
          const responseBlob = await fetch(response.assets[0].uri);
          const blob = await responseBlob.blob();

          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

          setProfileImageUrl(downloadURL);
          await setDoc(doc(db, 'users', auth.currentUser.uid), { profileImageUrl: downloadURL }, { merge: true });

          // Atualize a imagem de perfil no cabeçalho de navegação
          navigation.setOptions({
            headerRight: () => (
              <TouchableOpacity onPress={() => setIsProfileModalVisible(true)}>
                <Image source={{ uri: downloadURL }} style={styles.headerProfileIcon} />
              </TouchableOpacity>
            ),
          });

          Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso!');
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          Alert.alert('Erro', 'Não foi possível fazer o upload da imagem.');
        }
      }
    });
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), { name }, { merge: true });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
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
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
      ) : (
        <Ionicons name="person-circle-outline" size={100} color="#ccc" />
      )}
      <TouchableOpacity style={styles.imagePickerButton} onPress={openImagePicker}>
        <Text style={styles.imagePickerButtonText}>Escolher Imagem</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  imagePickerButton: { backgroundColor: '#4285F4', padding: 10, borderRadius: 8, marginBottom: 20 },
  imagePickerButtonText: { color: '#fff', fontSize: 16 },
  input: { width: '100%', padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 20 },
  saveButton: { backgroundColor: '#34A853', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16 },
  logoutButton: { backgroundColor: '#EA4335', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16 },
  headerProfileIcon: { width: 30, height: 30, borderRadius: 15, marginRight: 15 }, // Estilo para o ícone de perfil no cabeçalho
});
