import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator, { NavigationStack } from './src/naviagation/AppNavigator'; // Corrija o caminho para o correto

// 

export default function App() {
  return (
    <NavigationContainer>
      {/* <AppNavigator /> */}
      <NavigationStack />
    </NavigationContainer>
  );
}


