import React, { useState } from 'react';

const UserManagement = ({ registeredUsers, addUser, deleteUser }) => {
  const [newUser, setNewUser] = useState({ name: '', phone: '', isAdmin: false });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.phone) {
      alert('אנא מלא את כל השדות.');
      return;
    }

    addUser(newUser);
    setNewUser({ name: '', phone: '', isAdmin: false });
  };

  return (
    <div className="user-management container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ניהול משתמשים</h1>

      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">הוסף משתמש חדש</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">שם</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">מספר טלפון</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">מנהל</label>
            <input
              type="checkbox"
              checked={newUser.isAdmin}
              onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
              className="mr-2"
            />
            <span>{newUser.isAdmin ? 'כן' : 'לא'}</span>
          </div>
          <button
            onClick={handleAddUser}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            הוסף משתמש
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-bold mb-4">רשימת משתמשים</h2>
        <ul className="space-y-4">
          {registeredUsers.map((user) => (
            <li key={user.phone} className="flex justify-between items-center">
              <div>
                <p><strong>שם:</strong> {user.name}</p>
                <p><strong>טלפון:</strong> {user.phone}</p>
                <p><strong>סוג משתמש:</strong> {user.isAdmin ? 'מנהל' : 'משתמש'}</p>
              </div>
              <button
                onClick={() => deleteUser(user.phone)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                מחק
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;
