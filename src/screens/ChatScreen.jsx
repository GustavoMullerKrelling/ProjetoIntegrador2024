import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Image, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { BlurView } from 'expo-blur';
import firebase from '../config/firebase'; // Importa a configuração Firebase.js

const db = getFirestore(firebase);
const auth = getAuth(firebase);

const ChatScreen = ({ route, navigation }) => {
  const { userId, otherUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera e galeria.');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const updateStatus = async (status) => {
      const userDocRef = doc(db, 'onlineStatus', userId);
      await updateDoc(userDocRef, { status, lastSeen: serverTimestamp() });
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) updateStatus('online');
      else updateStatus('offline');
    });

    return () => {
      updateStatus('offline');
      unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    const chatId = getChatId(userId, otherUserId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [userId, otherUserId]);

  const sendMessage = async (content, type = 'text') => {
    if ((content || newMessage.trim()) && userId) {
      const chatId = getChatId(userId, otherUserId);
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      await addDoc(messagesRef, {
        text: type === 'text' ? newMessage : '',
        imageUrl: type === 'image' ? content : '',
        senderId: userId,
        timestamp: serverTimestamp(),
        status: 'sent',
        type,
      });
      setNewMessage('');
    }
  };

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) await sendMessage(result.assets[0].uri, 'image');
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) await sendMessage(result.assets[0].uri, 'image');
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
    }
  };

  const getChatId = (user1, user2) => {
    return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
  };

  const renderMessage = ({ item }) => {
    const isSender = item.senderId === userId;
    return (
      <View style={[styles.messageContainer, isSender ? styles.sender : styles.receiver]}>
        {item.imageUrl ? (
          <TouchableOpacity onPress={() => setSelectedImage(item.imageUrl)}>
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={renderMessage} style={styles.messageList} />
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleTakePhoto} style={styles.iconButton}>
          <Ionicons name="camera" size={24} color="#8a0b07" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSelectImage} style={styles.iconButton}>
          <Ionicons name="image" size={24} color="#8a0b07" />
        </TouchableOpacity>
        <TextInput
          placeholder="Digite uma mensagem"
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => sendMessage(newMessage, 'text')} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>ENVIAR</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <Modal transparent={true} visible={!!selectedImage} onRequestClose={() => setSelectedImage(null)}>
          <View style={styles.modalContainer}>
            <BlurView intensity={100} style={styles.blurBackground}>
              <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
            </BlurView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  messageList: { padding: 10 },
  messageContainer: { maxWidth: '80%', marginVertical: 5, padding: 10, borderRadius: 10 },
  sender: { alignSelf: 'flex-end', backgroundColor: '#8a0b07' },
  receiver: { alignSelf: 'flex-start', backgroundColor: '#0a0a0a' },
  messageText: { color: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff' },
  iconButton: { padding: 5 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#f9f9f9' },
  sendButton: { backgroundColor: '#8a0b07', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 25 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blurBackground: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '90%', height: '70%' },
});

export default ChatScreen;
