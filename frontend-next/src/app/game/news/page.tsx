'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/apiFetch'
import { useLanguage } from '@/contexts/languageContext'
import { translations } from '@/i18n/translations'
import { TFQuestion } from '@/types'

export default function NewsGamePage() {
    const [questions, setQuestions] = useState<TFQuestion[]>([])
    const [idx, setIdx] = useState(0)
    const [selected, setSelected] = useState<'human' | 'ai' | null>(null)
    const [feedback, setFeedback] = useState('')
    const [score, setScore] = useState(0)
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const router = useRouter()
    const { language } = useLanguage()
    const t = translations[language]

    useEffect(() => {
        apiFetch(`/api/generate-tf?lang=${language}`)
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text())
                return res.json()
            })
            .then((data) => {
                if (!data.questions?.length) throw new Error('No questions.')
                setQuestions(data.questions)
            })
            .catch((err) => setErrorMsg(err.message))
            .finally(() => setLoading(false))
    }, [language])

    const parsePrompt = (prompt: string) => {
        const [title, content] = prompt.split('\n').map((l) => l.trim())
        return {
            title: title?.replace(/^Title:\s*/, ''),
            content: content?.replace(/^Content:\s*/, '')
        }
    }

    const handleAnswer = (ans: 'human' | 'ai') => {
        setSelected(ans)
        const isHuman = questions[idx].correctAnswer === 'True'
        const isCorrect = (isHuman && ans === 'human') || (!isHuman && ans === 'ai')
        setFeedback(isCorrect ? t.correct : `${t.incorrect} ${isHuman ? t.human : t.ai}`)
        if (isCorrect) setScore((s) => s + 1)
    }

    const next = async () => {
        if (idx + 1 < questions.length) {
            setIdx((i) => i + 1)
            setSelected(null)
            setFeedback('')
        } else {
            alert(`${t.gameOver} ${score}/${questions.length}`)
            try {
                const token = localStorage.getItem('token')
                await apiFetch('/api/record', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ mode: 'T/F', score, total: questions.length }),
                })
            } catch (err) {
                console.warn('Record save failed:', err)
            }
            router.push('/')
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p className="loading-text">{t.loading}</p>
            </div>
        )
    }

    if (errorMsg) {
        return (
            <div className="game-container">
                <h1 className="game-title">{t.newsGameTitle}</h1>
                <p className="feedback">{errorMsg}</p>
                <button className="next-button" onClick={() => router.push('/')}>
                    {t.backToHome}
                </button>
            </div>
        )
    }

    const q = questions[idx]
    const { title, content } = parsePrompt(q.prompt)

    return (
        <div className="game-container">
            <h1 className="game-title">{t.newsGameTitle}</h1>

            <div className="question-box">
                <p><strong>{t.title}:</strong> {title}</p>
                <p><strong>{t.content}:</strong> {content}</p>
            </div>

            <div className="options">
                {['human', 'ai'].map((side) => (
                    <button
                        key={side}
                        onClick={() => handleAnswer(side as 'human' | 'ai')}
                        disabled={selected !== null}
                        className={`option-card ${selected === side
                                ? (q.correctAnswer === 'True' && side === 'human') ||
                                    (q.correctAnswer === 'False' && side === 'ai')
                                    ? 'correct'
                                    : 'incorrect'
                                : ''
                            }`}
                    >
                        {side === 'human' ? t.human : t.ai}
                    </button>
                ))}
            </div>

            {feedback && <p className="feedback">{feedback}</p>}

            {selected && (
                <button className="next-button" onClick={next}>
                    {t.nextQuestion}
                </button>
            )}
        </div>
    )
}



