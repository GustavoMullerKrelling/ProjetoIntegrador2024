import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker'; // Biblioteca para selecionar a imagem
import { auth, db } from '../config/firebase'; // Importa auth e db do Firebase
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc, where } from 'firebase/firestore'; // Importa funções do Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importa funções para Firebase Storage
import { createDrawerNavigator } from '@react-navigation/drawer'; // Para navegação Drawer
import { NavigationContainer } from '@react-navigation/native'; // Para navegação

// Função principal da HomeScreen
export default function HomeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // Estado para a imagem do perfil
  const [profileImageUrl, setProfileImageUrl] = useState(null); // Estado para armazenar a URL da imagem de perfil do Firebase Storage

  const storage = getStorage(); // Inicializa o Firebase Storage

  useEffect(() => {
    if (!auth.currentUser) return; // Previne falha quando o usuário não está autenticado

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

  }, [navigation]);

  useEffect(() => {
    fetchNotes(); // Chama a função para buscar notas ao montar o componente
    fetchProfileData(); // Carrega a imagem de perfil ao montar o componente

  }, []);

  // Função para buscar notas do Firestore
  const fetchNotes = async () => {
    console.log("Busquei notas")
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const notesCollection = collection(db, 'notes', where("uid" === uid));
      const notesSnapshot = await getDocs(notesCollection);
      console.log(notesSnapshot);
      const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
    }
  };

  // Função para buscar a imagem do perfil do Firestore
  const fetchProfileData = async () => {
    if (auth.currentUser) {
      const userProfileDoc = doc(db, 'users', auth.currentUser.uid);
      const userProfileSnapshot = await getDoc(userProfileDoc);
      if (userProfileSnapshot.exists()) {
        const data = userProfileSnapshot.data();
        setProfileImageUrl(data.profileImageUrl); // Carrega a URL da imagem
      }
    }
  };

  // Função para adicionar ou editar nota
  const addOrEditNote = async () => {
    if (title.trim() && note.trim()) {
      if (editingIndex !== null) {
        // Editando uma nota existente
        const noteDocRef = doc(db, 'notes', notes[editingIndex].id);
        await setDoc(noteDocRef, { title, note });
        fetchNotes(); // Atualiza a lista após edição
      } else {
        // Adicionando uma nova nota
        await addDoc(collection(db, 'notes'), { title, note, uid: auth.currentUser.uid });
        fetchNotes(); // Atualiza a lista após adição
      }
      setTitle('');
      setNote('');
      setIsModalVisible(false);
      setEditingIndex(null);
    } else {
      Alert.alert('Erro', 'O título e a nota não podem estar vazios.');
    }
  };

  const deleteNote = async (index) => {
    const noteDocRef = doc(db, 'notes', notes[index].id);
    await deleteDoc(noteDocRef);
    fetchNotes(); // Atualiza a lista após a exclusão
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

        // Faz upload da imagem para o Firebase Storage
        const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
        const responseBlob = await fetch(response.assets[0].uri);
        const blob = await responseBlob.blob();

        uploadBytes(storageRef, blob).then((snapshot) => {
          getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            setProfileImageUrl(downloadURL); // Define a URL da imagem para exibição
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
      navigation.replace('LoginScreen'); // Volta para a tela de login após o logout
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

const Drawer = createDrawerNavigator();

function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="HomeScreen">
        <Drawer.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
        <Drawer.Screen name="PomodoroScreen" component={PomodoroScreen} options={{ title: 'Pomodoro' }} />
        <Drawer.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Configurações' }} />
        <Drawer.Screen name="HelpScreen" component={HelpScreen} options={{ title: 'Ajuda' }} />
        <Drawer.Screen name="FeedbackScreen" component={FeedbackScreen} options={{ title: 'Feedback' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// Estilos
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

