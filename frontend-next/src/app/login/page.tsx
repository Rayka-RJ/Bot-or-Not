'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/apiFetch'
import { useLanguage } from '@/contexts/languageContext'
import { translations } from '@/i18n/translations'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const { language } = useLanguage()
    const t = translations[language]

    const submit = async () => {
        const res = await apiFetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })

        const data = await res.json()
        if (res.ok) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('username', username)
            router.push('/')
        } else {
            alert(data.error)
        }
    }

    return (
        <div className="login-container">
            <h1>{t.login}</h1>

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
                autoComplete="current-password"
            />

            <button onClick={submit}>
                {t.login}
            </button>
        </div>
    )
}
