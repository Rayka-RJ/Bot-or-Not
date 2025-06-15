'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="game-container">
            <h1 className="game-title">Something went wrong!</h1>
            <p className="feedback">{error.message || 'An unexpected error occurred'}</p>
            <button className="next-button" onClick={reset}>
                Try again
            </button>
        </div>
    )
}