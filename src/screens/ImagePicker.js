import * as ImagePicker from 'expo-image-picker';

export const openImagePicker = async () => {
  // Solicita permissão para acessar a galeria
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    alert('Permissão para acessar a galeria é necessária!');
    return;
  }

  // Abre o seletor de imagens
  const result = await ImagePicker.launchImageLibraryAsync();

  // Verifica se a seleção foi cancelada
  if (result.cancelled) {
    return null;
  }

  // Retorna a imagem selecionada
  return { uri: result.uri };
};
