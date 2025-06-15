import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="game-container">
            <h1 className="game-title">404 - Page Not Found</h1>
            <p className="feedback">The page you are looking for does not exist.</p>
            <Link href="/" className="next-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Go Home
            </Link>
        </div>
    )
}