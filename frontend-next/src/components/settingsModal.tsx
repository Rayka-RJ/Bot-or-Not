'use client'

import React, { useState, useEffect } from 'react'
import styles from './settingsModal.module.css'
import { useLanguage } from '@/contexts/languageContext'
import { translations } from '@/i18n/translations'

interface SettingsModalProps {
    onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState('')
    const [customKey, setCustomKey] = useState('')
    const { language } = useLanguage()
    const t = translations[language]

    useEffect(() => {
        // Initialize from localStorage on client side
        setMode(localStorage.getItem('aiMode') || 'free')
        setCustomKey(localStorage.getItem('deepseekKey') || '')
    }, [])

    useEffect(() => {
        localStorage.setItem('aiMode', mode)
        if (mode === 'deepseek') {
            localStorage.setItem('deepseekKey', customKey)
        } else {
            localStorage.removeItem('deepseekKey')
        }
    }, [mode, customKey])

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <h2>Settings</h2>

                <label>
                    <input
                        type="radio"
                        value="free"
                        checked={mode === 'free'}
                        onChange={() => setMode('free')}
                    />
                    {t.useFreeModel}
                </label>

                <label>
                    <input
                        type="radio"
                        value="deepseek"
                        checked={mode === 'deepseek'}
                        onChange={() => setMode('deepseek')}
                    />
                    {t.useDeepSeekAPI}
                </label>

                {mode === 'deepseek' && (
                    <div>
                        <input
                            type="text"
                            value={customKey}
                            onChange={(e) => setCustomKey(e.target.value)}
                            placeholder={t.deepSeekAPIKeyPlaceholder}
                        />
                    </div>
                )}

                <div className={styles.actions}>
                    <button onClick={onClose}>Save &amp; Close</button>
                </div>
            </div>
        </div>
    )
}

export default SettingsModal;