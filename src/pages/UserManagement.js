import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { setDoc, doc, getDocs, collection, deleteDoc, updateDoc } from 'firebase/firestore';

const UserManagement = () => {
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    isAdmin: false,
    membershipType: 'רגיל',
    registeredLessons: [],
    completedLessons: 0,
    joinDate: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup state
  const [editingUser, setEditingUser] = useState(null); // State for editing

  const membershipTypes = ['רגיל', 'פרימיום', 'חודשי', 'שנתי'];

  // Load users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.phone) {
      setError('אנא מלא את כל השדות החובה');
      return;
    }

    try {
      await setDoc(doc(db, 'Users', newUser.phone), {
        ...newUser,
        createdAt: new Date().toISOString(),
      });

      setUsers((prev) => [...prev, { id: newUser.phone, ...newUser }]); // Update state
      setError('');
      setIsPopupOpen(false); // Close popup
      resetForm();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('אירעה שגיאה בהוספת המשתמש');
    }
  };

  const handleEditUser = async () => {
    try {
      await updateDoc(doc(db, 'Users', editingUser.phone), editingUser);

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.phone ? { id: editingUser.phone, ...editingUser } : user))
      );
      setEditingUser(null); // Close edit form
      setIsPopupOpen(false); // Close popup
    } catch (err) {
      console.error('Error editing user:', err);
      setError('אירעה שגיאה בעדכון המשתמש');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'Users', userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId)); // Update state
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('אירעה שגיאה במחיקת המשתמש');
    }
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      phone: '',
      isAdmin: false,
      membershipType: 'רגיל',
      registeredLessons: [],
      completedLessons: 0,
      joinDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Add User Button */}
      <button
        onClick={() => {
          resetForm();
          setIsPopupOpen(true);
        }}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-4"
      >
        הוסף משתמש
      </button>

      {/* Users List */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">רשימת משתמשים</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id} className="flex justify-between items-center mb-4 border-b pb-2">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">טלפון: {user.phone}</p>
                <p className="text-sm text-gray-600">מנוי: {user.membershipType}</p>
              </div>
              <div className="space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setIsPopupOpen(true);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                >
                  ערוך
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                >
                  מחק
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {editingUser ? 'ערוך משתמש' : 'הוסף משתמש'}
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
            )}
            <div className="space-y-4">
              {/* Name */}
              <input
                type="text"
                name="name"
                placeholder="שם מלא"
                value={editingUser ? editingUser.name : newUser.name}
                onChange={(e) =>
                  editingUser
                    ? setEditingUser({ ...editingUser, name: e.target.value })
                    : handleChange(e)
                }
                className="w-full p-2 border rounded-lg"
              />
              {/* Phone */}
              <input
                type="tel"
                name="phone"
                placeholder="טלפון"
                value={editingUser ? editingUser.phone : newUser.phone}
                onChange={(e) =>
                  editingUser
                    ? setEditingUser({ ...editingUser, phone: e.target.value })
                    : handleChange(e)
                }
                className="w-full p-2 border rounded-lg"
                disabled={!!editingUser}
              />
              {/* Membership */}
              <select
                name="membershipType"
                value={editingUser ? editingUser.membershipType : newUser.membershipType}
                onChange={(e) =>
                  editingUser
                    ? setEditingUser({ ...editingUser, membershipType: e.target.value })
                    : handleChange(e)
                }
                className="w-full p-2 border rounded-lg"
              >
                {membershipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {/* Buttons */}
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  ביטול
                </button>
                <button
                  onClick={editingUser ? handleEditUser : handleAddUser}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  {editingUser ? 'שמור שינויים' : 'הוסף'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
