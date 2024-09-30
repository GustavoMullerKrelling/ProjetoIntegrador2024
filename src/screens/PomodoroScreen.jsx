import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroScreen() {
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [sound, setSound] = useState(null);

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
    setTimeLeft(isWorking ? BREAK_TIME : WORK_TIME);
    setIsWorking(!isWorking);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWorking ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isWorking ? 'Hora do foco!' : 'Pausa'}</Text>
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
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
    fontSize: 60,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 40,
  },
  timer: {
    fontSize: 60,
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
  },

});
