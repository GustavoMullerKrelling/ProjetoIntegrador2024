import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth, db } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const storage = getStorage();

  useEffect(() => {
    if (!auth.currentUser) return;

    navigation.setOptions({
      headerTitle: () => (
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar notas..."
          value={searchText}
          onChangeText={setSearchText}
        />
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsProfileModalVisible(true)}>
          <Ionicons name="person-circle-outline" size={30} color="#000" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });

  }, [navigation, searchText]);

  useEffect(() => {
    if (auth.currentUser) {
      fetchNotes();
      fetchProfileData();
    }
  }, [auth.currentUser]);

  const fetchNotes = async () => {
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const notesQuery = query(collection(db, 'notes'), where("uid", "==", uid));
        const notesSnapshot = await getDocs(notesQuery);
        const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(notesList);
      }
    } catch (error) {
      console.error("Erro ao buscar notas:", error);
    }
  };

  const fetchProfileData = async () => {
    if (auth.currentUser) {
      try {
        const userProfileDoc = doc(db, 'users', auth.currentUser.uid);
        const userProfileSnapshot = await getDoc(userProfileDoc);
        if (userProfileSnapshot.exists()) {
          const data = userProfileSnapshot.data();
          setProfileImageUrl(data.profileImageUrl);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    }
  };

  const addOrEditNote = async () => {
    if (title.trim() && note.trim()) {
      try {
        if (editingIndex !== null) {
          const noteDocRef = doc(db, 'notes', notes[editingIndex].id);
          await setDoc(noteDocRef, { title, note });
          fetchNotes();
        } else {
          await addDoc(collection(db, 'notes'), { title, note, uid: auth.currentUser.uid });
          fetchNotes();
        }
        setTitle('');
        setNote('');
        setIsModalVisible(false);
        setEditingIndex(null);
      } catch (error) {
        Alert.alert('Erro', 'Ocorreu um erro ao salvar a nota.');
        console.error("Erro ao salvar nota:", error);
      }
    } else {
      Alert.alert('Erro', 'O título e a nota não podem estar vazios.');
    }
  };

  const deleteNote = async (index) => {
    try {
      const noteDocRef = doc(db, 'notes', notes[index].id);
      await deleteDoc(noteDocRef);
      fetchNotes();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao deletar a nota.');
      console.error("Erro ao deletar nota:", error);
    }
  };

  const openEditModal = (index) => {
    setTitle(notes[index].title);
    setNote(notes[index].note);
    setEditingIndex(index);
    setIsModalVisible(true);
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
        console.log('Erro: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfileImage(source);

        const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
        const responseBlob = await fetch(response.assets[0].uri);
        const blob = await responseBlob.blob();

        uploadBytes(storageRef, blob).then((snapshot) => {
          getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            setProfileImageUrl(downloadURL);
            await setDoc(doc(db, 'users', auth.currentUser.uid), { profileImageUrl: downloadURL });
            Alert.alert('Sucesso', 'Imagem de perfil atualizada!');
          });
        });
      }
    });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('LoginScreen');
    } catch (error) {
      Alert.alert('Erro ao sair da conta', error.message);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.note.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>As notas adicionadas aparecem aqui</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => openEditModal(index)}>
              <View style={styles.noteItem}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteText}>{item.note}</Text>
                <TouchableOpacity onPress={() => deleteNote(index)}>
                  <Text style={styles.deleteButtonText}>Deletar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsModalVisible(true);
          setEditingIndex(null);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Título da nota"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Escreva sua nota aqui..."
              value={note}
              onChangeText={setNote}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={addOrEditNote}>
                <Text style={styles.saveButtonText}>
                  {editingIndex !== null ? 'Salvar Edição' : 'Salvar Nota'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isProfileModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={100} color="#ccc" />
            )}
            <TouchableOpacity style={styles.imagePickerButton} onPress={openImagePicker}>
              <Text style={styles.imagePickerButtonText}>Selecionar Imagem</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsProfileModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    width: 250,
  },
  noteItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  noteTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  noteText: {
    fontSize: 16,
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 36,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
  },
  deleteButtonText: {
    color: '#f44336',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePickerButtonText: {
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
  },
});

