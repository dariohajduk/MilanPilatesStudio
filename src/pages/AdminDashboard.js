import React from 'react';

const AdminDashboard = ({ setCurrentScreen, setLogo }) => {
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="admin-dashboard p-8">
      <h1 className="text-3xl font-bold mb-6">לוח ניהול</h1>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">העלה לוגו</h2>
          <input type="file" onChange={handleLogoUpload} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
        </div>
        <button
          onClick={() => setCurrentScreen('userManagement')}
          className="w-full bg-blue-600 text-white rounded p-4 hover:bg-blue-700"
        >
          ניהול משתמשים
        </button>
        <button
          onClick={() => setCurrentScreen('lessonManagement')}
          className="w-full bg-blue-600 text-white rounded p-4 hover:bg-blue-700"
        >
          ניהול שיעורים
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;