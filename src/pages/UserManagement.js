import React, { useState } from 'react';

const UserManagement = ({ registeredUsers, addUser, deleteUser }) => {
  const [newUser, setNewUser] = useState({ name: '', phone: '', isAdmin: false });

  const handleAddUser = () => {
    if (newUser.name && newUser.phone) {
      addUser(newUser);
      setNewUser({ name: '', phone: '', isAdmin: false });
    } else {
      alert('אנא מלא את כל השדות עבור המשתמש החדש.');
    }
  };

  return (
    <div className="user-management p-8">
      <h1 className="text-3xl font-bold mb-6">ניהול משתמשים</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">הוסף משתמש חדש</h2>
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
          <button onClick={handleAddUser} className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">
            הוסף משתמש
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">רשימת משתמשים פעילים</h2>
        <ul className="space-y-4">
          {registeredUsers.map((user) => (
            <li key={user.phone} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-xl"><strong>שם:</strong> {user.name}</p>
                <p className="text-xl"><strong>טלפון:</strong> {user.phone}</p>
                <p className="text-xl"><strong>סוג משתמש:</strong> {user.isAdmin ? 'מנהל' : 'משתמש'}</p>
              </div>
              <button
                onClick={() => deleteUser(user.phone)}
                className="bg-red-600 text-white rounded p-2 hover:bg-red-700"
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