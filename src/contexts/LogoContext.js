import { createContext, useContext, useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoRef = doc(db, "AppConfig", "logo"); // Adjust Firestore path if needed
        const logoDoc = await getDoc(logoRef);

        if (logoDoc.exists()) {
          const data = logoDoc.data();
          if (data.url) {
            setLogoUrl(data.url);
            console.debug("✅ Logo fetched successfully:", data.url);
          } else {
            console.warn("⚠️ Logo document found, but 'url' field is missing!");
            setLogoUrl("/fallback-logo.png"); // Use a fallback logo
          }
        } else {
          console.warn("⚠️ Logo document not found in Firestore.");
          setLogoUrl("/fallback-logo.png");
        }
      } catch (error) {
        console.error("❌ Error fetching logo from Firestore:", error);
        setLogoUrl("/fallback-logo.png");
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return (
    <LogoContext.Provider value={{ logoUrl, loading }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error("useLogo must be used within a LogoProvider");
  }
  return context;
};
