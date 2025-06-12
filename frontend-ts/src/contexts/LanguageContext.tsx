import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Define context type
interface LanguageContextType {
  language: 'en' | 'zh';
  toggleLanguage: () => void;
}

// 2. Create context, and specify type (null initial)
const LanguageContext = createContext<LanguageContextType | null>(null);

// 3. Define provider's props type
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'zh' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 4. Custom Hook, automatically add non-null assertion (type guarantee)
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
