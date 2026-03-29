import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

const AboutContext = createContext(null);

export const AboutProvider = ({ children }) => {
  const [aboutData, setAboutData] = useState(null);

  const fetchAbout = useCallback(async () => {
    try {
      const res = await api.getAbout();
      setAboutData(res.data.about || res.data);
    } catch {
      // silently fail — components use their own defaults
    }
  }, []);

  useEffect(() => {
    fetchAbout();
    window.addEventListener("about:updated", fetchAbout);
    return () => window.removeEventListener("about:updated", fetchAbout);
  }, [fetchAbout]);

  return (
    <AboutContext.Provider value={aboutData}>
      {children}
    </AboutContext.Provider>
  );
};

export const useAbout = () => useContext(AboutContext);
