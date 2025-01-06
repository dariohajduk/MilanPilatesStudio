import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgRjJShNJqWB2nq931kKobLRHUeejW0vo",
  authDomain: "milan-studio-b8b4b.firebaseapp.com",
  databaseURL: "https://milan-studio-b8b4b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "milan-studio-b8b4b",
  storageBucket: "milan-studio-b8b4b.firebasestorage.app",
  messagingSenderId: "961084768524",
  appId: "1:961084768524:web:2cdbc3a67dc018d8058929",
  measurementId: "G-8XF83E9KQY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };