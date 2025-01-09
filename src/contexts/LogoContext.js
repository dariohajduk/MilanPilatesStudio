import React, { createContext, useContext, useState, useEffect } from 'react';

// יצירת הקשר (Context) עבור הלוגו
const LogoContext = createContext();

// ספק הקשר (Provider) עבור הלוגו
export const LogoProvider = ({ children }) => {
  // יצירת משתנה מצב (state) עבור כתובת ה-URL של הלוגו
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('logoUrl') || '');

  // שימוש ב-useEffect כדי לעדכן את localStorage כאשר logoUrl משתנה
  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem('logoUrl', logoUrl);
    }
  }, [logoUrl]);

  // פונקציה לעדכון כתובת ה-URL של הלוגו
  const updateLogoUrl = (newUrl) => {
    setLogoUrl(newUrl); // עדכון מצב הלוגו
    localStorage.setItem('logoUrl', newUrl); // שמירת כתובת ה-URL החדשה ב-localStorage
  };

  // החזרת ספק ההקשר עם הערכים של logoUrl ו-updateLogoUrl
  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl: updateLogoUrl }}>
      {children} {/* הצגת הילדים של ספק ההקשר */}
    </LogoContext.Provider>
  );
};

// יצירת hook מותאם אישית לשימוש בהקשר של הלוגו
export const useLogo = () => useContext(LogoContext);