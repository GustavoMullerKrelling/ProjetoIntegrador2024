import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { auth } from '../config/firebase';
import HomeScreen from '../screens/HomeScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen from '../screens/AuthScreen'; // Renomeado para 'AuthScreen'
import ProfileScreen from '../screens/ProfileScreen';
const Drawer = createDrawerNavigator();

// Componente Customizado para o Drawer
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      {/* Cabeçalho do Drawer */}
      <View style={styles.header}>
        <Text style={styles.title}>PomoFocus</Text>
      </View>
      
      {/* Itens do Drawer */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // Define true se o usuário estiver logado
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />} // Usando o drawer customizado
    >
      <Drawer.Screen name="Anotações" component={HomeScreen} />
      <Drawer.Screen name="Pomodoro" component={PomodoroScreen} />
      <Drawer.Screen name="Resumos" component={SettingsScreen} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />


    </Drawer.Navigator>
  );
}

// Estilos para o título
const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5', // Cor de fundo semelhante ao Google Keep
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});
