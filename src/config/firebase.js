// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Importe o storage

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOMIeh3yar9OjJPrSEB6bMlhaC6lIzUXs",
    authDomain: "projetointegrador-cb566.firebaseapp.com",
    projectId: "projetointegrador-cb566",
    storageBucket: "projetointegrador-cb566.appspot.com",
    messagingSenderId: "1028105098678",
    appId: "1:1028105098678:web:7ef0babfba682e989d9d17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Inicialize e exporte o storage
