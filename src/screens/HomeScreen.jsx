import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Animated, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../config/firebase'; // Importação do Firebase
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, where } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [noteColor, setNoteColor] = useState('#fff');
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(false);
  const [isChecklistModalVisible, setIsChecklistModalVisible] = useState(false);
  const [checklistItems, setChecklistItems] = useState([{ text: '', checked: false }]);

  const modalAnimation = useRef(new Animated.Value(0)).current;
  const addButtonAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-circle-outline" size={30} color="#000" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });

    fetchNotes();
    fetchChecklists();
  }, [navigation]);

  const fetchNotes = async () => {
    try {
      if (auth.currentUser) {
        const userEmail = auth.currentUser.email;
        const notesQuery = query(collection(db, 'quickNotes'), where('email', '==', userEmail));
        const notesSnapshot = await getDocs(notesQuery);
        const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(notesList);
      }
    } catch (error) {
      console.error('Erro ao buscar notas rápidas:', error);
    }
  };

  const fetchChecklists = async () => {
    try {
      if (auth.currentUser) {
        const userEmail = auth.currentUser.email;
        const checklistsQuery = query(collection(db, 'checklists'), where('email', '==', userEmail));
        const checklistsSnapshot = await getDocs(checklistsQuery);
        const checklistsList = checklistsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChecklists(checklistsList);
      }
    } catch (error) {
      console.error('Erro ao buscar checklists:', error);
    }
  };

  const addOrEditNote = async () => {
    if (title.trim() && note.trim()) {
      const newNote = {
        title,
        note,
        color: noteColor,
        uid: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        email: auth.currentUser ? auth.currentUser.email : 'anonimo'
      };
      try {
        if (editingIndex !== null) {
          const noteToEdit = notes[editingIndex];
          const noteDocRef = doc(db, 'quickNotes', noteToEdit.id);
          await setDoc(noteDocRef, { ...newNote }, { merge: true });
        } else {
          await addDoc(collection(db, 'quickNotes'), newNote);
        }
        fetchNotes();
        resetNote();
        closeModal();
      } catch (error) {
        Alert.alert('Erro', 'Ocorreu um erro ao salvar a nota.');
        console.error('Erro ao salvar a nota:', error);
      }
    }
  };

  const saveChecklist = async () => {
    const filteredItems = checklistItems.filter(item => item.text.trim() !== '');

    if (filteredItems.length === 0) {
      Alert.alert('Aviso', 'A checklist precisa ter pelo menos um item não vazio.');
      return;
    }

    const newChecklist = {
      title: "Checklist",
      checklistItems: filteredItems,
      color: '#f0f2f5',
      uid: auth.currentUser ? auth.currentUser.uid : 'anonimo',
      email: auth.currentUser ? auth.currentUser.email : 'anonimo'
    };

    try {
      if (editingIndex !== null) {
        const checklistToEdit = checklists[editingIndex];
        const checklistDocRef = doc(db, 'checklists', checklistToEdit.id);
        await setDoc(checklistDocRef, { ...newChecklist }, { merge: true });
      } else {
        await addDoc(collection(db, 'checklists'), newChecklist);
      }
      fetchChecklists();
      setIsChecklistModalVisible(false);
      setChecklistItems([{ text: '', checked: false }]);
      setEditingIndex(null);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a checklist.');
      console.error('Erro ao salvar a checklist:', error);
    }
  };

  const deleteNote = async (index) => {
    const noteToDelete = notes[index];
    setNotes(prevNotes => prevNotes.filter((_, i) => i !== index)); // Atualiza a interface imediatamente.
  
    try {
      const noteDocRef = doc(db, 'quickNotes', noteToDelete.id);
      await deleteDoc(noteDocRef);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao deletar a nota.');
      console.error('Erro ao deletar nota:', error);
  
      // Em caso de erro, adiciona a nota de volta.
      setNotes(prevNotes => [...prevNotes.slice(0, index), noteToDelete, ...prevNotes.slice(index)]);
    }
  };
  

  const deleteChecklist = async (index) => {
    try {
      const checklistToDelete = checklists[index];
      const checklistDocRef = doc(db, 'checklists', checklistToDelete.id);
      await deleteDoc(checklistDocRef);
      fetchChecklists();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao deletar a checklist.');
      console.error('Erro ao deletar checklist:', error);
    }
  };

  const openEditModal = (index, type = 'note') => {
    if (type === 'checklist') {
      const checklist = checklists[index];
      setChecklistItems(checklist.checklistItems);
      setEditingIndex(index);
      setIsChecklistModalVisible(true);
    } else {
      const note = notes[index];
      setTitle(note.title);
      setNote(note.note);
      setNoteColor(note.color);
      setEditingIndex(index);
      openModal();
    }
  };

  const resetNote = () => {
    setTitle('');
    setNote('');
    setNoteColor('#fff');
    setEditingIndex(null);
  };

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setIsModalVisible(false);
      resetNote();
    });
  };

  const pressAddButton = () => {
    Animated.sequence([
      Animated.timing(addButtonAnimation, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(addButtonAnimation, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setIsAddButtonVisible(!isAddButtonVisible);
    });
  };

  const changeNoteColor = (color) => setNoteColor(color);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.note.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredChecklists = checklists.filter(
    (checklist) =>
      checklist.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar notas e checklists..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {filteredNotes.length === 0 && filteredChecklists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>As notas e checklists adicionadas aparecem aqui</Text>
        </View>
      ) : (
        <FlatList
          data={[...filteredNotes, ...filteredChecklists]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Animated.View style={[styles.noteItem, { backgroundColor: item.color }]}>
              {item.checklistItems ? (
                <View>
                  {item.checklistItems.map((checkItem, checkIndex) => (
                    <TouchableOpacity
                      key={checkIndex}
                      style={styles.checklistItem}
                    >
                      <Ionicons
                        name={checkItem.checked ? "checkbox-outline" : "square-outline"}
                        size={20}
                        color={checkItem.checked ? "#4CAF50" : "#000"}
                      />
                      <Text
                        style={[
                          styles.noteText,
                          checkItem.checked && { textDecorationLine: 'line-through', color: '#888' },
                        ]}
                      >
                        {checkItem.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity onPress={() => openEditModal(index, 'note')}>
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.noteText}>{item.note}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => item.checklistItems ? deleteChecklist(index) : deleteNote(index)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}

      <Animated.View style={[styles.addButton, { transform: [{ scale: addButtonAnimation }] }]}>
        <TouchableOpacity onPress={pressAddButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {isAddButtonVisible && (
        <View style={styles.additionalButtonsContainer}>
          <TouchableOpacity style={styles.additionalButton} onPress={openModal}>
            <Text style={styles.additionalButtonText}>Textos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalButton} onPress={() => setIsChecklistModalVisible(true)}>
            <Text style={styles.additionalButtonText}>Listas</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Notas */}
      <Modal visible={isModalVisible} animationType="none" transparent={true}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalAnimation,
              transform: [{ translateY: modalAnimation.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }],
            },
          ]}
        >
          <View style={styles.modalContent}>
            <TextInput style={styles.input} placeholder="Título da nota" value={title} onChangeText={setTitle} />
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Escreva sua nota aqui..."
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.colorPickerContainer}>
              <TouchableOpacity
                style={[styles.colorPickerButton, { backgroundColor: noteColor }]}
                onPress={() => setIsColorPickerVisible(!isColorPickerVisible)}
              >
                <Ionicons name="color-palette-outline" size={30} color="#000" />
              </TouchableOpacity>
              {isColorPickerVisible && (
                <View style={styles.colorOptions}>
                  {['#fff', '#f28b82', '#fbbc04', '#ccff90', '#a7ffeb', '#d7aefb'].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorOption, { backgroundColor: color }]}
                      onPress={() => {
                        changeNoteColor(color);
                        setIsColorPickerVisible(false);
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={addOrEditNote}>
                <Text style={styles.saveButtonText}>{editingIndex !== null ? 'Salvar Edição' : 'Salvar Nota'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>

     {/* Modal de Checklists */}
<Modal visible={isChecklistModalVisible} animationType="none" transparent={true}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <FlatList
        data={checklistItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.checklistItem}>
            <TouchableOpacity
              onPress={() => {
                const updatedItems = [...checklistItems];
                updatedItems[index].checked = !updatedItems[index].checked;
                setChecklistItems(updatedItems);

                // Atualizando diretamente no banco de dados para manter o estado persistente
                if (editingIndex !== null) {
                  const checklistToEdit = checklists[editingIndex];
                  checklistToEdit.checklistItems = updatedItems;
                  setChecklists([...checklists]);
                  saveChecklist(); // Salvar checklist atualizada
                }
              }}
            >
              <Ionicons
                name={item.checked ? "checkbox-outline" : "square-outline"}
                size={24}
                color={item.checked ? "#4CAF50" : "#000"}
              />
            </TouchableOpacity>
            <TextInput
              style={[
                styles.checklistTextInput,
                item.checked && { textDecorationLine: 'line-through', color: '#888' },
              ]}
              placeholder="Item"
              value={item.text}
              onChangeText={(text) => {
                const updatedItems = [...checklistItems];
                updatedItems[index].text = text;
                setChecklistItems(updatedItems);
              }}
            />
          </View>
        )}
      />
      <TouchableOpacity
        onPress={() => setChecklistItems([...checklistItems, { text: '', checked: false }])}
        style={styles.addChecklistItemButton}
      >
        <Text style={styles.addChecklistItemText}>Adicionar Item</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={saveChecklist} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Salvar Checklist</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsChecklistModalVisible(false)} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  searchInput: {
    height: 42,
    backgroundColor: '#e1e5e8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 10,
    fontStyle: 'italic',
  },
  noteItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  noteText: {
    fontSize: 15,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#87cefa',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    height: 42,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  noteInput: {
    height: 450,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorPickerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  colorOptions: {
    flexDirection: 'row',
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#87cefa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#87cefa',
    fontSize: 16,
  },
  additionalButtonsContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  additionalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    padding: 25,
  },
  additionalButtonText: {
    fontSize: 16,
    color: '#008CBA',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checklistTextInput: {
    flex: 1,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  addChecklistItemButton: {
    paddingVertical: 10,
    paddingBottom: 55,
    marginRight: 250,
    paddingTop: 15,
    alignItems: 'center',
  },
  addChecklistItemText: {
    color: '#007BFF',
  },
  checklistItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checklistItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
