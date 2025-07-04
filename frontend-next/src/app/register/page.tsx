'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/apiFetch'
import { useLanguage } from '@/contexts/languageContext'
import { translations } from '@/i18n/translations'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const { language } = useLanguage()
    const t = translations[language]

    const submit = async () => {
        setError('')
        if (!username) {
            setError(t.username + ' ' + (language === 'zh' ? '不能为空' : 'cannot be empty'))
            return
        }
        if (!password) {
            setError(t.password + ' ' + (language === 'zh' ? '不能为空' : 'cannot be empty'))
            return
        }
        if (password.length < 6) {
            setError(language === 'zh' ? '密码长度不能少于6位' : 'Password must be at least 6 characters')
            return
        }
        try {
            const res = await apiFetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (!res.ok) {
                const errorText = await res.text(); 
                setError(errorText)
                return
            }

            const data = await res.json()

            if (res.ok) {
                // 注册成功后跳转到登录页，并传递用户名和密码
                router.push(`/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
            } else {
                setError(data.message || data.error || (language === 'zh' ? '注册失败' : 'Registration failed'))
            }
            
        } catch (error) {
            console.error('Registration error:', error)
            setError(language === 'zh' ? '注册失败，请重试。' : 'Registration failed. Please try again.')
        }
    }

    return (
        <div className="login-container">
            <h1>{t.register}</h1>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
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
            <button style={{ marginTop: 10 }} onClick={() => router.push('/')}>{t.backToHome}</button>
        </div>
    )
}