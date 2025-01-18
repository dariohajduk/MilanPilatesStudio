import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { setDoc, doc, getDocs, collection, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';

const UserManagement = () => {
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    isAdmin: false,
    membership: '',
    remainingLessons: 0,
    registeredLessons: [],
    completedLessons: 0,
    joinDate: new Date().toISOString().split('T')[0],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembership, setFilterMembership] = useState('');
  const [error, setError] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const { refreshUserData } = useUser(); // Import refreshUserData

  useEffect(() => {
    fetchMemberships();
    fetchUsers();
  }, []);

  const fetchMemberships = async () => {
    try {
      const membershipsSnapshot = await getDocs(collection(db, 'Memberships'));
      const membershipsList = membershipsSnapshot.docs.map((doc) => doc.data().name);
      setMemberships(membershipsList);
    } catch (err) {
      console.error('Error fetching memberships:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.phone || !newUser.membership) {
      setError('אנא מלא את כל השדות החובה כולל סוג מנוי');
      return;
    }

    try {
      await setDoc(doc(db, 'Users', newUser.phone), {
        ...newUser,
        createdAt: new Date().toISOString(),
      });

      setUsers((prev) => [...prev, { id: newUser.phone, ...newUser }]);
      setError('');
      setIsPopupOpen(false);
      resetForm();

      // Refresh user data
      if (newUser.phone) {
        await refreshUserData(newUser.phone);
      } else {
        console.error('Phone number is missing for refreshUserData');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError('אירעה שגיאה בהוספת המשתמש');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser.membership) {
      setError('יש לבחור מנוי');
      return;
    }

    try {
      if (editingUser.phone !== users.find(user => user.id === editingUser.id)?.phone) {
        await setDoc(doc(db, 'Users', editingUser.phone), editingUser);
        await deleteDoc(doc(db, 'Users', editingUser.id));
        setUsers((prev) => prev.filter((user) => user.id !== editingUser.id));
      } else {
        await updateDoc(doc(db, 'Users', editingUser.phone), editingUser);
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? { id: editingUser.phone, ...editingUser } : user))
      );
      setEditingUser(null);
      setIsPopupOpen(false);

      // Refresh user data
      if (editingUser.phone) {
        await refreshUserData(editingUser.phone);
      } else {
        console.error('Phone number is missing for refreshUserData');
      }
    } catch (err) {
      console.error('Error editing user:', err);
      setError('אירעה שגיאה בעדכון המשתמש');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש הזה?')) {
      try {
        await deleteDoc(doc(db, 'Users', userId));
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('אירעה שגיאה במחיקת המשתמש');
      }
    }
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      phone: '',
      isAdmin: false,
      membership: memberships[0] || '',
      remainingLessons: 0,
      registeredLessons: [],
      completedLessons: 0,
      joinDate: new Date().toISOString().split('T')[0],
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      (!searchTerm || user.name.includes(searchTerm) || user.phone.includes(searchTerm)) &&
      (!filterMembership || user.membership === filterMembership)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <input
          type="text"
          placeholder="חפש לפי שם או טלפון"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg w-full sm:w-1/2 mb-2 sm:mb-0"
        />
        <select
          value={filterMembership}
          onChange={(e) => setFilterMembership(e.target.value)}
          className="p-2 border rounded-lg w-full sm:w-1/4"
        >
          <option value="">כל המנויים</option>
          {memberships.map((membership) => (
            <option key={membership} value={membership}>
              {membership}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          resetForm();
          setIsPopupOpen(true);
        }}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-4 w-full sm:w-auto"
      >
        הוסף משתמש
      </button>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">רשימת משתמשים</h2>
        <ul className="space-y-3">
          {filteredUsers.map((user) => (
            <li key={user.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-3 rounded-md shadow">
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">טלפון: {user.phone}</p>
                <p className="text-sm text-gray-600">מנוי: {user.membership}</p>
                {user.membership === 'כרטיסייה' && (
                  <p className="text-sm text-gray-600">אימונים שנותרו: {user.remainingLessons}</p>
                )}
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse mt-4 sm:mt-0">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setIsPopupOpen(true);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                >
                  ערוך
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                  מחק
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">
              {editingUser ? 'ערוך משתמש' : 'הוסף משתמש'}
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="space-y-3">
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
                className="w-full p-2 border rounded-md"
              />
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
                className="w-full p-2 border rounded-md"
              />
              <select
                name="membership"
                value={editingUser ? editingUser.membership : newUser.membership}
                onChange={(e) => {
                  const value = e.target.value;
                  if (editingUser) {
                    setEditingUser({
                      ...editingUser,
                      membership: value,
                      remainingLessons: value === 'כרטיסייה' ? editingUser.remainingLessons : 0,
                    });
                  } else {
                    handleChange(e);
                    if (value === 'כרטיסייה') {
                      setNewUser((prev) => ({ ...prev, remainingLessons: 0 }));
                    }
                  }
                }}
                className="w-full p-2 border rounded-md"
              >
                {memberships.map((membership) => (
                  <option key={membership} value={membership}>
                    {membership}
                  </option>
                ))}
              </select>
              {(editingUser?.membership === 'כרטיסייה' || newUser.membership === 'כרטיסייה') && (
                <input
                  type="number"
                  name="remainingLessons"
                  placeholder="מספר אימונים בכרטיסייה"
                  value={editingUser ? editingUser.remainingLessons : newUser.remainingLessons}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, remainingLessons: parseInt(e.target.value, 10) || 0 })
                      : setNewUser((prev) => ({ ...prev, remainingLessons: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-full p-2 border rounded-md"
                />
              )}
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  ביטול
                </button>
                <button
                  onClick={editingUser ? handleEditUser : handleAddUser}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
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
