import React, { useState, useEffect } from 'react';
import { fetchUsers, addUser, editUser, deleteUser } from '../services/firebaseService';
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
  const { refreshUserData } = useUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      handleError('שגיאה בטעינת המשתמשים');
    }
  };

  const handleError = (message) => {
    console.error(message);
    setError(message);
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.phone || !newUser.membership) {
      handleError('אנא מלא את כל השדות החובה');
      return;
    }

    try {
      await addUser(newUser);
      setUsers((prev) => [...prev, { id: newUser.phone, ...newUser }]);
      setIsPopupOpen(false);
      setError('');
      resetForm();
    } catch (err) {
      handleError('שגיאה בהוספת המשתמש');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser.name || !editingUser.phone || !editingUser.membership) {
      setError('אנא מלא את כל השדות החובה');
      return;
    }

    try {
      await editUser(editingUser.id, editingUser);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...editingUser } : user
        )
      );

      setEditingUser(null);
      setIsPopupOpen(false);
      setError('');
    } catch (error) {
      console.error('Error editing user:', error);
      setError('שגיאה בעדכון המשתמש');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) return;

    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      handleError('שגיאה במחיקת המשתמש');
    }
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      phone: '',
      isAdmin: false,
      membership: '',
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
        <button
          onClick={() => {
            resetForm();
            setIsPopupOpen(true);
          }}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-4 w-full sm:w-auto"
        >
          הוסף משתמש
        </button>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">רשימת משתמשים</h2>
        <ul className="space-y-3">
          {filteredUsers.map((user) => (
            <li key={user.id} className="flex justify-between items-center p-3 rounded-md bg-gray-100">
              <div>
                <p>{user.name}</p>
                <p>{user.phone}</p>
              </div>
              <div>
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
                    ? setEditingUser((prev) => ({ ...prev, name: e.target.value }))
                    : setNewUser((prev) => ({ ...prev, name: e.target.value }))
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
                    ? setEditingUser((prev) => ({ ...prev, phone: e.target.value }))
                    : setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
              />
              <select
                name="membership"
                value={editingUser ? editingUser.membership : newUser.membership}
                onChange={(e) => {
                  const value = e.target.value;
                  if (editingUser) {
                    setEditingUser((prev) => ({
                      ...prev,
                      membership: value,
                    }));
                  } else {
                    setNewUser((prev) => ({ ...prev, membership: value }));
                  }
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">בחר מנוי</option>
                {/* Replace this list dynamically */}
                <option value="כרטיסייה">כרטיסייה</option>
                <option value="מנוי חודשי">מנוי חודשי</option>
              </select>
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
