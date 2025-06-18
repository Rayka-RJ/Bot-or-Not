'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/apiFetch'
import { useLanguage } from '@/contexts/languageContext'
import { translations } from '@/i18n/translations'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const { language } = useLanguage()
    const t = translations[language]

    const submit = async () => {
        try {
            const res = await apiFetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (!res.ok) {
                const errorText = await res.text(); 
                throw new Error(`Server error: ${errorText}`);
            }

            const data = await res.json()

            if (res.ok) {
                router.push('/login')
            } else {
                alert(data.message || data.error || 'Registration failed')
            }
            
        } catch (error) {
            console.error('Registration error:', error)
            alert('Registration failed. Please try again.')
        }
    }

    return (
        <div className="login-container">
            <h1>{t.register}</h1>

            <input
                type="text"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
            />

            <input
                type="password"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
            />

            <button onClick={submit}>
                {t.register}
            </button>
        </div>
    )
}