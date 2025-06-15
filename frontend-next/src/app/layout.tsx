import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/languageContext'
import ClientLayout from '@/components/clientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Bot or Not? - Can you tell AI from a human?',
    description: 'A fun game to test if you can distinguish between AI-generated and human-created content',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <LanguageProvider>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </LanguageProvider>
            </body>
        </html>
    )
}