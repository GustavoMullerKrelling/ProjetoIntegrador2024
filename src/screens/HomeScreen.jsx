import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { auth } from '../config/firebase'; // Importa o auth do Firebase
import { Ionicons } from '@expo/vector-icons'; // Biblioteca de ícones

export default function HomeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isHorizontal, setIsHorizontal] = useState(false);

  // Função para adicionar nota
  const addNote = () => {
    if (title.trim().length > 0 && note.trim().length > 0) {
      setNotes([...notes, { title, note }]);
      setTitle('');
      setNote('');
    }
  };

  // Função para deletar nota
  const deleteNote = (index) => {
    const newNotes = notes.filter((_, noteIndex) => noteIndex !== index);
    setNotes(newNotes);
  };

  // Função para alternar o layout
  const toggleLayout = () => {
    setIsHorizontal(!isHorizontal);
  };

  // Função para fazer logout
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.replace('AuthScreen'); // Volta para a tela de login após o logout
      })
      .catch(error => {
        Alert.alert('Erro ao sair da conta', error.message);
      });
  };

  // Configura o cabeçalho com o botão de logout
  useEffect(() => {
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
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="black" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isHorizontal, searchText]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.note.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anotações</Text>
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
      />
      <TouchableOpacity style={styles.addButton} onPress={addNote}>
        <Text style={styles.addButtonText}>Adicionar Nota</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredNotes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.noteItem, isHorizontal ? styles.horizontalNote : styles.verticalNote]}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteText}>{item.note}</Text>
            <TouchableOpacity onPress={() => deleteNote(index)}>
              <Text style={styles.deleteButtonText}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noteItem: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 16,
  },
  deleteButtonText: {
    color: 'red',
    marginTop: 10,
  },
  searchInput: {
    width: 200,
    padding: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
