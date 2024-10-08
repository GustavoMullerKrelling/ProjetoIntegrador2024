import React, { useState, useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { auth } from '../config/firebase'; // Certifique-se de que o Firebase está importado
import HomeScreen from '../screens/HomeScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpFeedbackScreen from '../screens/HelpFeedbackScreen';
import AuthScreen from '../screens/AuthScreen'; // Renomeei para 'AuthScreen'

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica o estado de autenticação do Firebase
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true); // Se o usuário estiver logado, define como autenticado
      } else {
        setIsAuthenticated(false); // Se não estiver logado, define como não autenticado
      }
    });

    return () => unsubscribe(); // Limpa o listener quando o componente desmonta
  }, []);

  if (!isAuthenticated) {
    // Se o usuário não estiver autenticado, mostra a tela de Login/Cadastro
    return <AuthScreen />;
  }

  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Pomodoro" component={PomodoroScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Ajuda e Feedback" component={HelpFeedbackScreen} />
    </Drawer.Navigator>
  );
}
