import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpFeedbackScreen from '../screens/HelpFeedbackScreen';

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Pomodoro" component={PomodoroScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Ajuda e Feedback" component={HelpFeedbackScreen} />
    </Drawer.Navigator>
  );
}
