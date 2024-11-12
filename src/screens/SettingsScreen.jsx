import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Pressable, TextInput, FlatList, CheckBox, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db, auth } from '../config/firebase'; // Importar suas configurações do Firebase
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

  // Função para buscar dados do Firestore
  const fetchSquares = async () => {
    try {
      if (auth.currentUser) {
        const userEmail = auth.currentUser.email;
        const squaresQuery = query(collection(db, 'squares'), where('email', '==', userEmail));
        const squaresSnapshot = await getDocs(squaresQuery);
        const squaresList = squaresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSquares(squaresList);
      }
    } catch (error) {
      console.error('Erro ao buscar quadrados:', error);
    }
  };

  useEffect(() => {
    fetchSquares(); // Carrega os quadrados do Firestore ao iniciar o app
  }, []);

  // Função para adicionar um novo quadrado ao Firestore
  const addSquare = async () => {
    if (title.trim() === '') {
      alert('Por favor, insira um título.');
      return;
    }
    try {
      const userEmail = auth.currentUser ? auth.currentUser.email : 'anonimo';
      await addDoc(collection(db, 'squares'), {
        color: selectedColor,
        title,
        content,
        email: userEmail,
      });
      fetchSquares(); // Atualiza a lista após adicionar
      setModalVisible(false);
      setTitle('');
      setContent('');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao adicionar o quadrado.');
      console.error('Erro ao adicionar quadrado:', error);
    }
  };

  // Função para editar um quadrado existente no Firestore
  const finishEditing = async (index) => {
    const squareToEdit = squares[index];
    try {
      const squareDocRef = doc(db, 'squares', squareToEdit.id);
      await setDoc(squareDocRef, { ...squareToEdit, content: editText }, { merge: true });
      fetchSquares(); // Atualiza a lista após a edição
      setEditingIndex(null);
      setEditText('');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao editar o quadrado.');
      console.error('Erro ao editar quadrado:', error);
    }
  };

  // Função para deletar quadrados selecionados do Firestore
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

  const openEditModal = (index) => {
    setEditingIndex(index);
    setEditText(squares[index].content);
    setEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Icon name="edit" size={24} color="#000" />
        <Text style={styles.text}>Resumos</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para adicionar quadrado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
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
              style={[styles.titleInput, { height: 100 }]}
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
          </View>
        </View>
      </Modal>

      {/* Modal para editar o resumo */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
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
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => finishEditing(editingIndex)}
            >
              <Text style={styles.modalButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={squares}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.squareContainer}>
            <TouchableOpacity
              style={[styles.square, { backgroundColor: item.color }]}
              onPress={() => openEditModal(index)}
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
    marginVertical: 10,
  },
  square: {
    flex: 1,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 5,
    padding: 10,
  },
  squareTitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
  },
  colorRow: {
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    width: 200,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
  },
  fullScreenModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  fullScreenModalContent: {
    flex: 1,
    padding: 20,
    width: '100%',
    justifyContent: 'center',
  },
});
