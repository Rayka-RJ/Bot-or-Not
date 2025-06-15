'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'

interface LanguageContextType {
    language: 'en' | 'zh'
    toggleLanguage: () => void
}

interface LanguageProviderProps {
    children: ReactNode
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<'en' | 'zh'>('en')

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'en' ? 'zh' : 'en'))
    }

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}