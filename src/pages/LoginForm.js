import React, { useState } from 'react';

const LoginForm = ({ registeredUsers, setUser, setCurrentScreen }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = registeredUsers.find((user) => user.phone === phone);
    if (user) {
      setUser(user);
      setCurrentScreen('home');
    } else {
      alert('מספר טלפון לא נכון');
    }
  };

  return (
    <div className="login-form max-w-md mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">התחברות</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">מספר טלפון</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          התחבר
        </button>
      </div>
    </div>
  );
};

export default LoginForm;