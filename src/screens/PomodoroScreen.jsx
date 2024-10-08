import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, Button } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons'; // Biblioteca de ícones
import { CircularProgress } from 'react-native-circular-progress'; // Barra de progresso circular
import { auth } from '../config/firebase'; // Importa o auth do Firebase

export default function PomodoroScreen({ navigation }) {
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Valor inicial (25 minutos)
  const [isActive, setIsActive] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [sound, setSound] = useState(null);
  const [workTime, setWorkTime] = useState(25); // Tempo de trabalho
  const [breakTime, setBreakTime] = useState(5);  // Tempo de pausa
  const [modalVisible, setModalVisible] = useState(false); // Controle de visibilidade do modal
  const [isSelectingForWork, setIsSelectingForWork] = useState(true); // Saber se está selecionando tempo de trabalho ou pausa

  async function playMusic() {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/music.mp3')
    );
    setSound(sound);
    await sound.setIsLoopingAsync(true);
    await sound.playAsync();
  }

  async function stopMusic() {
    if (sound) {
      await sound.stopAsync();
    }
  }

  const toggleMusic = () => {
    if (isMusicOn) {
      stopMusic();
    } else {
      playMusic();
    }
    setIsMusicOn(!isMusicOn);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      toggleMode();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const toggleMode = () => {
    setTimeLeft(isWorking ? breakTime * 60 : workTime * 60); // Alterna o tempo entre foco e pausa
    setIsWorking(!isWorking);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWorking ? workTime * 60 : breakTime * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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

  // Adiciona o botão de logout no header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={30} color="black" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Calcula a porcentagem do tempo restante
  const progressPercentage = () => {
    const totalTime = isWorking ? workTime * 60 : breakTime * 60;
    return (timeLeft / totalTime) * 100;
  };

  // Função que lida com a seleção do tempo (quando o usuário clica no cronômetro)
  const handleTimeSelection = () => {
    setModalVisible(true);
    setIsSelectingForWork(isWorking);
  };

  const applyTimeSelection = (selectedTime) => {
    if (isSelectingForWork) {
      setWorkTime(selectedTime);
      setTimeLeft(selectedTime * 60);
    } else {
      setBreakTime(selectedTime);
      setTimeLeft(selectedTime * 60);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isWorking ? 'Hora do foco!' : 'Pausa'}</Text>

      {/* Relógio animado clicável */}
      <TouchableOpacity onPress={handleTimeSelection}>
        <CircularProgress
          size={200} // Tamanho do círculo
          width={10} // Largura do círculo
          fill={progressPercentage()} // Porcentagem de preenchimento
          tintColor="#9a8c98" // Cor da barra de progresso
          backgroundColor="#f2e9e4" // Cor de fundo
        >
          {() => (
            <Text style={styles.timer}>
              {formatTime(timeLeft)}
            </Text>
          )}
        </CircularProgress>
      </TouchableOpacity>

      {/* Modal para seleção de tempo */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o tempo ({isSelectingForWork ? 'Foco' : 'Pausa'})</Text>
            <View style={styles.buttonRow}>
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={styles.timeButton}
                  onPress={() => applyTimeSelection(time)}
                >
                  <Text style={styles.timeButtonText}>{time} min</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={() => setIsActive(!isActive)}>
          <Text style={styles.buttonText}>{isActive ? 'Pausar' : 'Iniciar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetTimer}>
          <Text style={styles.buttonText}>Resetar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, styles.musicButton]} onPress={toggleMusic}>
        <Text style={styles.buttonText}>{isMusicOn ? 'Desligar Música' : 'Ligar Música'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 42,
    fontWeight: '600',
    color: '#4a4e69',
    marginBottom: 30,
  },
  timer: {
    fontSize: 40,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#9a8c98',
  },
  resetButton: {
    backgroundColor: '#f2e9e4',
  },
  musicButton: {
    backgroundColor: '#c9ada7',
    marginBottom: 20,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timeButton: {
    padding: 10,
    backgroundColor: '#9a8c98',
    borderRadius: 5,
    margin: 5,
  },
  timeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
