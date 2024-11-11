import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Pressable, TextInput, FlatList, CheckBox, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, db } from '../config/firebase'; // Suas configurações do Firebase aqui
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, where } from 'firebase/firestore';

export default function App() {
  const [squares, setSquares] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#007bff');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedSquares, setSelectedSquares] = useState(new Set());

  const colorPalette = [
    'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet',
    'pink', 'purple', 'brown', 'gray', 'black'
  ];

  // Função para buscar os quadrados do Firestore associados ao email do usuário
  const fetchSquares = async () => {
    try {
      if (auth.currentUser) {
        const userEmail = auth.currentUser.email; // Captura o email do usuário logado
        const squaresQuery = query(collection(db, 'squares'), where('email', '==', userEmail)); // Filtra pelo email do usuário
        const squaresSnapshot = await getDocs(squaresQuery);
        const squaresList = squaresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSquares(squaresList);
      }
    } catch (error) {
      console.error('Erro ao buscar quadrados:', error);
    }
  };

  useEffect(() => {
    fetchSquares(); // Buscar quadrados ao carregar o componente
  }, []);

  const addSquare = async () => {
    if (title.trim() === '') {
      alert('Por favor, insira um título.');
      return;
    }
    try {
      const userEmail = auth.currentUser ? auth.currentUser.email : 'anonimo'; // Adiciona o email do usuário logado
      await addDoc(collection(db, 'squares'), {
        color: selectedColor,
        title,
        content,
        uid: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        email: userEmail, // Salva o email do usuário junto com o quadrado
      });
      fetchSquares(); // Atualiza a lista de quadrados após adicionar
      setModalVisible(false);
      setTitle('');
      setContent('');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao adicionar o quadrado.');
      console.error('Erro ao adicionar quadrado:', error);
    }
  };

  const finishEditing = async (index) => {
    const squareToEdit = squares[index];
    try {
      const squareDocRef = doc(db, 'squares', squareToEdit.id);
      await setDoc(squareDocRef, { ...squareToEdit, content: editText }, { merge: true });
      fetchSquares(); // Atualiza a lista de quadrados após edição
      setEditingIndex(null);
      setEditText('');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao editar o quadrado.');
      console.error('Erro ao editar quadrado:', error);
    }
  };

  const deleteSelectedSquares = async () => {
    try {
      for (let index of selectedSquares) {
        const squareToDelete = squares[index];
        const squareDocRef = doc(db, 'squares', squareToDelete.id);
        await deleteDoc(squareDocRef);
      }
      fetchSquares(); // Atualiza a lista após deletar
      setSelectedSquares(new Set());
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao deletar os quadrados.');
      console.error('Erro ao deletar quadrado:', error);
    }
  };

  const toggleSelectSquare = (index) => {
    const updatedSelectedSquares = new Set(selectedSquares);
    if (updatedSelectedSquares.has(index)) {
      updatedSelectedSquares.delete(index);
    } else {
      updatedSelectedSquares.add(index);
    }
    setSelectedSquares(updatedSelectedSquares);
  };

  return (
    <View style={styles.container}>
      {/* Botão para abrir modal de adicionar quadrado */}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para adicionar quadrado */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha uma cor e insira um título</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Título do Resumo"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.titleInput, { height: 100 }]} // Aumenta a altura do campo de resumo
              placeholder="Resumo"
              value={content}
              onChangeText={setContent}
              multiline
            />
            <FlatList
              data={colorPalette}
              numColumns={4}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.colorButton, { backgroundColor: item }]}
                  onPress={() => setSelectedColor(item)}
                />
              )}
              keyExtractor={(item) => item}
              columnWrapperStyle={styles.colorRow}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addSquare}>
              <Text style={styles.modalButtonText}>Adicionar Quadrado</Text>
            </TouchableOpacity>
            {/* Botão Cancelar para fechar o modal */}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para editar o resumo */}
      <Modal animationType="slide" transparent={false} visible={editModalVisible}>
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <Text style={styles.modalTitle}>Editar Resumo</Text>
            <TextInput
              style={[styles.titleInput, { height: '100%' }]}
              placeholder="Resumo"
              value={editText}
              onChangeText={setEditText}
              multiline
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => finishEditing(editingIndex)}>
              <Text style={styles.modalButtonText}>Salvar</Text>
            </TouchableOpacity>
            {/* Botão Cancelar para fechar o modal de edição */}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 10 }]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lista de quadrados */}
      <FlatList
        data={squares}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.squareContainer}>
            <TouchableOpacity
              style={[styles.square, { backgroundColor: item.color }]}
              onPress={() => {
                setEditingIndex(index);
                setEditText(item.content);
                setEditModalVisible(true);
              }}
            >
              <Text style={styles.squareTitle}>{item.title}</Text>
            </TouchableOpacity>
            <CheckBox
              value={selectedSquares.has(index)}
              onValueChange={() => toggleSelectSquare(index)}
            />
          </View>
        )}
      />

      {/* Botão de deletar quadrados */}
      <TouchableOpacity style={styles.deleteButton} onPress={deleteSelectedSquares}>
        <Text style={styles.deleteButtonText}>Concluído</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginLeft: 8,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#007bff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  square: {
    width: 100,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  squareTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  titleInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  colorRow: {
    justifyContent: 'space-between',
  },
  modalButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ff0000',
    borderRadius: 5,
    alignItems: 'center',
    width: 300,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
