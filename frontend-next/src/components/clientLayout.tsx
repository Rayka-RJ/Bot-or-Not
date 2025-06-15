'use client'

import { useEffect } from 'react'

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        // Auto logout when page is closed
        const handleBeforeUnload = () => {
            localStorage.removeItem('token')
            localStorage.removeItem('username')
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    return <>{children}</>
}