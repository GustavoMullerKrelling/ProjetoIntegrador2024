import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { auth } from '../config/firebase';
import HomeScreen from '../screens/HomeScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileScreen from '../screens/ProfileScreen1';
import HelpFeedbackScreen from '../screens/HelpFeedbackScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Drawer = createDrawerNavigator();

// Função de logout
const handleLogout = () => {
  auth.signOut().catch((error) => {
    console.error('Erro ao fazer logout:', error);
  });
};

// Componente Customizado para o Drawer
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      {/* Cabeçalho do Drawer */}
      <View style={styles.header}>
        <Text style={styles.title}>BrainFocus</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
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
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Pomodoro" component={PomodoroScreen} />
      <Drawer.Screen name="Resumos" component={SettingsScreen} />
      <Drawer.Screen name="Ajuda & Feedback" component={HelpFeedbackScreen} />
      {/* <Drawer.Screen name="Perfil" component={ProfileScreen} /> */}
    </Drawer.Navigator>
  );
}

// criar uma Stack navigator
const Stack = createNativeStackNavigator();

const NavigationStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Home" component={AppNavigator} />
      <Stack.Screen name="Perfil" component={ProfileScreen} />
    </Stack.Navigator>
  )
}

// Estilos para o título e botão de logout
const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5', // Cor de fundo semelhante ao Google Keep
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 5,
    backgroundColor: '#87cefa',
    borderRadius: 5,
  },
});

export { NavigationStack };
