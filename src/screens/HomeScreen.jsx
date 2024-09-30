import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isHorizontal, setIsHorizontal] = useState(false);

  const addNote = () => {
    if (title.trim().length > 0 && note.trim().length > 0) {
      setNotes([...notes, { title, note }]);
      setTitle('');
      setNote('');
    }
  };

  const deleteNote = (index) => {
    const newNotes = notes.filter((_, noteIndex) => noteIndex !== index);
    setNotes(newNotes);
  };

  const toggleLayout = () => {
    setIsHorizontal(!isHorizontal);
  };

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
  // estilos vão aqui (mesmo estilo que estava no arquivo anterior)
});








