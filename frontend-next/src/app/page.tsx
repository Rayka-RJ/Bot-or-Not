'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import SettingsModal from '@/components/settingsModal'
import { useLanguage } from '@/contexts/languageContext'
import { translations } from '@/i18n/translations'

export default function HomePage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [showSettings, setShowSettings] = useState(false)
    const { language, toggleLanguage } = useLanguage()
    const t = translations[language]

    useEffect(() => {
        const user = localStorage.getItem('username')
        if (user) setUsername(user)
    }, [])

    const logout = () => {
        localStorage.removeItem('username')
        localStorage.removeItem('token')
        setUsername('')
        router.refresh()
    }

    return (
        <>
            <div className="homepage-header">
                <div className="user-info">
                    {username ? (
                        <>
                            <span>{t.welcome}, {username}!</span>
                            <button className="mini-button" onClick={logout}>{t.logout}</button>
                            <button className="mini-button" onClick={() => router.push('/leaderboard')}>{t.leaderboard}</button>
                            <button className="mini-button" onClick={() => setShowSettings(true)}>{t.settings}</button>
                        </>
                    ) : (
                        <>
                            <button className="mini-button" onClick={() => router.push('/login')}>{t.login}</button>
                            <button className="mini-button" onClick={() => router.push('/register')}>{t.register}</button>
                            <button className="mini-button" onClick={() => setShowSettings(true)}>{t.settings}</button>
                        </>
                    )}
                    <button className="mini-button" onClick={toggleLanguage}>
                        {language === 'en' ? t.switchToChinese : t.switchToEnglish}
                    </button>
                </div>
            </div>

            <div className="homepage-container">
                <Image src="/logo.png" alt="Bot or Not Logo" width={150} height={150} className="logo" priority />
                <h1 className="homepage-title">{t.homepageTitle}</h1>
                <p className="homepage-description">{t.homepageDescription}</p>

                <button
                    className="homepage-button"
                    onClick={() => router.push('/game/text')}
                >
                    {t.playTextGame}
                </button>

                <button
                    className="homepage-button"
                    onClick={() => router.push('/game/image')}
                >
                    {t.playImageGame}
                </button>

                <button
                    className="homepage-button"
                    onClick={() => router.push('/game/news')}
                >
                    {t.playNewsGame}
                </button>

                <button
                    className="homepage-button"
                    onClick={() => router.push('/submit')}
                >
                    {t.submitNews}
                </button>
            </div>

            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    )
}