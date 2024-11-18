import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteColor, setNoteColor] = useState('#fff');
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

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

  }, [navigation]);

  const addOrEditNote = () => {
    if (title.trim() && note.trim()) {
      const newNote = { title, note, color: noteColor };
      const updatedNotes = [...notes];
      editingIndex !== null ? (updatedNotes[editingIndex] = newNote) : updatedNotes.push(newNote);
      setNotes(updatedNotes);
      resetNote();
      closeModal();
    }
  };

  const deleteNote = (index) => setNotes(notes.filter((_, i) => i !== index));
  const openEditModal = (index) => {
    setTitle(notes[index].title);
    setNote(notes[index].note);
    setNoteColor(notes[index].color);
    setEditingIndex(index);
    openModal();
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
    ]).start(openModal);
  };

  const changeNoteColor = (color) => setNoteColor(color);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.note.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar resumos..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Os resumos adicionados aparecem aqui</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Animated.View style={[styles.noteItem, { backgroundColor: item.color }]}>
              <TouchableOpacity onPress={() => openEditModal(index)}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteText}>{item.note}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteNote(index)}>
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

      <Modal visible={isModalVisible} animationType="none" transparent={true}>
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: modalAnimation, transform: [{ translateY: modalAnimation.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }] },
          ]}
        >
          <View style={styles.modalContent}>
            <TextInput style={styles.input} placeholder="Título do resumo" value={title} onChangeText={setTitle} />
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Escreva seu resumo aqui..."
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.colorPickerContainer}>
              <TouchableOpacity style={[styles.colorPickerButton, { backgroundColor: noteColor }]} onPress={() => setIsColorPickerVisible(!isColorPickerVisible)}>
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
    height: 350,
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
});
