import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: 'AIzaSyBmGsdOqFAxoeVV2SZ-SU3L37a9tL2qTEc',
  authDomain: 'brd-generator-app-ce7a5.firebaseapp.com',
  projectId: 'brd-generator-app-ce7a5',
  storageBucket: 'brd-generator-app-ce7a5.firebasestorage.app',
  messagingSenderId: '1083919603735',
  appId: '1:1083919603735:web:124d11a271434971fa6452',
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
