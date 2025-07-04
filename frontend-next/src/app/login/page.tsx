'use client'

import React, { useState, useEffect } from 'react'
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

    // 自动填充用户名和密码（从url参数获取）
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const u = params.get('username')
            const p = params.get('password')
            if (u) setUsername(u)
            if (p) setPassword(p)
        }
    }, [])

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
            <form autoComplete="off" onSubmit={e => { e.preventDefault(); submit(); }}>
            <input
                type="text"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                name="username"
            />

            <input
                type="password"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                name="password"
            />

            <button type="submit">
                {t.login}
            </button>
            <button style={{ marginTop: 10 }} onClick={() => router.push('/')}>{t.backToHome}</button>
            </form>
        </div>
    )
}
