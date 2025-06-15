'use client'

import React, { useState, useEffect } from 'react'
import styles from './settingsModal.module.css'

interface SettingsModalProps {
    onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [mode, setMode] = useState('')
    const [customKey, setCustomKey] = useState('')

    useEffect(() => {
        // Initialize from localStorage on client side
        setMode(localStorage.getItem('aiMode') || 'free')
        setCustomKey(localStorage.getItem('openaiKey') || '')
    }, [])

    useEffect(() => {
        localStorage.setItem('aiMode', mode)
        if (mode === 'openai') {
            localStorage.setItem('openaiKey', customKey)
        } else {
            localStorage.removeItem('openaiKey')
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
                    Use Free / Local Model
                </label>

                <label>
                    <input
                        type="radio"
                        value="openai"
                        checked={mode === 'openai'}
                        onChange={() => setMode('openai')}
                    />
                    Use My Own OpenAI&nbsp;API&nbsp;Key
                </label>

                {mode === 'openai' && (
                    <div>
                        <input
                            type="text"
                            value={customKey}
                            onChange={(e) => setCustomKey(e.target.value)}
                            placeholder="Enter your OpenAI API Key"
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