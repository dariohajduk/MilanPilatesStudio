import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc, // הוספנו setDoc
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetch all documents from a Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @returns {Promise<Array>} - A list of documents.
 */
export const fetchCollection = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Add a new document to a Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Object} data - The data to add to the collection.
 * @returns {Promise<Object>} - The added document.
 */
export const addDocument = async (collectionName, data) => {
  const newDoc = await addDoc(collection(db, collectionName), data);
  return { id: newDoc.id, ...data };
};

/**
 * Delete a document from a Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} id - The ID of the document to delete.
 */
export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};

/**
 * Fetch a single document from a Firestore collection by ID.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} id - The ID of the document to fetch.
 * @returns {Promise<Object|null>} - The document data, or null if it doesn't exist.
 */
export const fetchDocumentById = async (collectionName, id) => {
  const documentRef = doc(db, collectionName, id);
  const documentSnapshot = await getDoc(documentRef);
  return documentSnapshot.exists() ? { id, ...documentSnapshot.data() } : null;
};

/**
 * Fetch all lessons from the Lessons collection.
 * @returns {Promise<Array>} - List of lessons.
 */
export const fetchLessons = async () => {
  const querySnapshot = await getDocs(collection(db, 'Lessons'));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Fetch the registered lessons for a specific user.
 * @param {string} phone - The user's phone number.
 * @returns {Promise<Array>} - A list of registered lessons.
 */
export const getUserLessons = async (phone) => {
  const userRef = doc(db, 'Users', phone);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data().registeredLessons || [];
  }
  return [];
};

/**
 * Update a lesson in the Lessons collection.
 * @param {string} lessonId - The ID of the lesson to update.
 * @param {Object} data - The data to update.
 */
export const updateLesson = async (lessonId, data) => {
  const lessonRef = doc(db, 'Lessons', lessonId);
  await updateDoc(lessonRef, data);
};

/**
 * Update a user in the Users collection.
 * @param {string} userId - The ID of the user to update.
 * @param {Object} data - The data to update.
 */
export const updateUser = async (userId, data) => {
  const userRef = doc(db, 'Users', userId);
  await updateDoc(userRef, data);
};

/**
 * Update lesson registration in Firestore.
 * @param {string} lessonId - The lesson ID.
 * @param {Object} userData - The user data.
 * @param {boolean} isRegistering - True for registering, False for canceling.
 */
export const updateLessonRegistration = async (lessonId, userData, isRegistering) => {
  const lessonRef = doc(db, 'Lessons', lessonId);
  const userRef = doc(db, 'Users', userData.phone);

  const lessonUpdate = isRegistering
    ? {
        waitingList: arrayUnion(userData.phone),
        registeredParticipants: (userData.registeredParticipants || 0) + 1,
      }
    : {
        waitingList: arrayRemove(userData.phone),
        registeredParticipants: Math.max((userData.registeredParticipants || 0) - 1, 0),
      };

  const userUpdate = isRegistering
    ? {
        registeredLessons: arrayUnion({
          id: lessonId,
          date: new Date().toISOString(), // Replace with actual date
          type: 'Lesson Type', // Replace with actual type
        }),
      }
    : {
        registeredLessons: arrayRemove({
          id: lessonId,
          date: new Date().toISOString(),
        }),
      };

  await updateDoc(lessonRef, lessonUpdate);
  await updateDoc(userRef, userUpdate);
};

/**
 * Fetch all users from Firestore.
 * @returns {Promise<Array>} - List of users.
 */
export const fetchUsers = async () => {
  const snapshot = await getDocs(collection(db, 'Users'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Add a new user to Firestore.
 * @param {Object} userData - User data to be added.
 */
export const addUser = async (userData) => {
  const userRef = doc(db, 'Users', userData.phone);
  await setDoc(userRef, userData);
};

/**
 * Edit a user's data in Firestore.
 * @param {string} userId - The user's ID.
 * @param {Object} updatedData - Updated user data.
 */
export const editUser = async (userId, updatedData) => {
  const userRef = doc(db, 'Users', userId);
  await updateDoc(userRef, updatedData);
};

/**
 * Delete a user from Firestore.
 * @param {string} userId - The user's ID.
 */
export const deleteUser = async (userId) => {
  const userRef = doc(db, 'Users', userId);
  await deleteDoc(userRef);
};
