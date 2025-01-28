const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: 'test-key',
  authDomain: 'test-domain',
  projectId: 'test-project',
};

const app = initializeApp(firebaseConfig);

try {
  const db = getFirestore(app);
  const storage = getStorage(app);
  console.log('Firebase loaded successfully');
} catch (err) {
  console.error('Error initializing Firebase:', err);
}
