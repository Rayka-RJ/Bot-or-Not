// Common option type for multiple choice questions
export interface Option {
    text: string
    source: string // 'ai' or 'human'
}

// Multiple choice question structure (GamePage)
export interface MultiChoiceQuestion {
    prompt: string
    options: Option[]
    correctAnswer: string // source value
}

// Image question structure (ImageTFGame)
export interface ImageQuestion {
    imageUrl: string
    description: string
    correctAnswer: 'ai' | 'human'
}

// News T/F question structure (TFGame)
export interface TFQuestion {
    prompt: string // contains title + content, needs parsing
    correctAnswer: 'True' | 'False'
}

// Leaderboard score structure
export interface Score {
    username: string
    score: number
    total: number
}

// Leaderboard data structure
export interface LeaderboardData {
    top10ByMode: Record<string, Score[]>
    myBest: Record<string, Score>
}