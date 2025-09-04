import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPaYRXi1V_KucwYXuiph7shAJwhR_xheY",
  authDomain: "pvr-cinema.firebaseapp.com",
  projectId: "pvr-cinema",
  storageBucket: "pvr-cinema.firebasestorage.app",
  messagingSenderId: "624238439229",
  appId: "1:624238439229:web:ebf2977915d4cc968c3354"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);