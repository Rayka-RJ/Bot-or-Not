'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/apiFetch'
import { useLanguage } from '@/contexts/languageContext'
import { translations } from '@/i18n/translations'
import { MultiChoiceQuestion, Option } from '@/types'

export default function TextGamePage() {
    const router = useRouter()
    const { language } = useLanguage()
    const t = translations[language]

    // Basic game state
    const [questions, setQuestions] = useState<MultiChoiceQuestion[]>([])
    const [current, setCurrent] = useState(0)
    const [selected, setSelected] = useState<Option | null>(null)
    const [feedback, setFeedback] = useState('')
    const [score, setScore] = useState(0)

    // UI state
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        apiFetch(`/api/generate-multi?lang=${language}`)
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text())
                return res.json()
            })
            .then((data) => {
                if (!data.questions?.length) throw new Error('No questions returned.')
                setQuestions(data.questions)
            })
            .catch((err) => setErrorMsg(err.message))
            .finally(() => setLoading(false))
    }, [language]);

    const handleAnswerClick = (option: Option) => {
        if (!questions[current]) return
        setSelected(option)
        const correct = questions[current].correctAnswer
        setFeedback(option.source === correct ? t.correct : t.incorrect)
        if (option.source === correct) setScore((s) => s + 1)
    }

    const nextQuestion = async () => {
        if (current + 1 < questions.length) {
            setCurrent((i) => i + 1)
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
                    body: JSON.stringify({ mode: 'text', score, total: questions.length }),
                })
            } catch (e) {
                console.warn('Save failed:', e)
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
                <h1 className="game-title">{t.textRecognitionGame}</h1>
                <p className="feedback">{errorMsg}</p>
                <button className="next-button" onClick={() => router.push('/')}>
                    {t.backToHome}
                </button>
            </div>
        )
    }

    const q = questions[current]

    return (
        <div className="game-container">
            <h1 className="game-title">{t.textRecognitionGame}</h1>

            <div className="question-box">
                <p>{q.prompt}</p>
            </div>

            <div className="options">
                {q.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswerClick(opt)}
                        disabled={!!selected}
                        className={`option-card ${selected === opt
                                ? opt.source === q.correctAnswer
                                    ? 'correct'
                                    : 'incorrect'
                                : ''
                            }`}
                    >
                        {opt.text}
                    </button>
                ))}
            </div>

            {feedback && <p className="feedback">{feedback}</p>}

            {selected && (
                <button className="next-button" onClick={nextQuestion}>
                    {t.nextQuestion}
                </button>
            )}
        </div>
    )
}
