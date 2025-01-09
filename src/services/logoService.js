// src/services/logoService.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';

// שירות לניהול לוגו
export const logoService = {
  // העלאת לוגו חדש
  async uploadLogo(file) {
    try {
      // העלאה ל-Storage
      const storageRef = ref(storage, 'logo/studio-logo');
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // שמירת URL ב-Firestore
      await setDoc(doc(db, 'settings', 'logo'), {
        url,
        updatedAt: new Date().toISOString()
      });

      return url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  // קבלת URL של הלוגו הנוכחי
  async getCurrentLogo() {
    try {
      const logoRef = ref(storage, 'logo/studio-logo');
      return await getDownloadURL(logoRef);
    } catch {
      return null;
    }
  }
};