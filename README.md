# Bot or Not? - Can You Spot the AI?

## Team Info
- Lian Yifan A0304264M
- Zhang Ruijia A0215695W
- Wang Meiyi A0309393X

## Demo Video
[Click here to watch the demo video](https://youtu.be/xswiCsXQIlU)  

## How to Run the Project Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- OpenAI API Key (if generating questions dynamically)

---

## Section 1: General

### 1.1 Relevance of Problem Statement
As AI-generated content becomes more widespread (e.g., ChatGPT, Midjourney), distinguishing between human and machine responses is increasingly difficult. Our game trains users to recognize subtle stylistic and linguistic patterns to improve AI literacy. This problem is relevant now and will remain significant over the next 2–10 years, especially in education, social media, and news.

### 1.2 Solution Architecture
We adopted a modular 3-tier architecture:
- **Frontend (React)**: Handles user interaction and UI.
- **Backend (Node.js + Express)**: Manages APIs, OpenAI communication, and data processing.
- **Database (MongoDB)**: Stores user info, scores, leaderboard, and submitted content.

### 1.3 Legal Aspects & Business Model
Our intention is to release **all source code** for “Bot or Not?” under the **MIT License** so that anyone can study, reuse or extend the project, while the team keeps attribution.  
External AI content is produced exclusively through official provider APIs and therefore remains subject to each provider’s Terms of Service:

| Provider | Usage in this project | Applicable ToS |
|----------|----------------------|----------------|
| **OpenAI** | Text generation (comments / fake news) | https://openai.com/policies/terms-of-use |
| **DeepAI** | Image generation (text-to-image) | https://deepai.org/terms |

By running or deploying the code you agree to comply with those terms.  
Potential business paths: a **freemium educational game** (basic “local model” tier + paid OpenAI tier), or an **open-source public good** supported by donations/academic grants.

### 1.4 Competition Analysis
- [AI or Not](https://www.aiornot.com/): Only supports image classification, no leaderboard or T/F mode.
- [WhichFaceIsReal](https://www.whichfaceisreal.com/): Focuses on static face comparison.
- Our project is more **interactive**, **multi-modal**, and **user-contributable**.

---

## Section 2: Implementation

### 2.1 Frontend Implementation
- Built with React.js and `react-router-dom`
- Pages include:
  - Homepage with navigation buttons
  - Three game modes: Text MCQ, Image T/F, News T/F
  - Login / Register
  - Submit page for user contributions
  - Leaderboard
- Uniform style using CSS (loading spinner, option cards, feedback UI)

### 2.2 Backend Implementation
- Express.js server with multiple routes:
  - `/api/generate-multi`: Generates text-based MCQ
  - `/api/generate-image-tf`: Fetches image T/F questions
  - `/api/generate-tf`: News article T/F judgment
  - `/api/record`: Saves game results
  - `/api/leaderboard`: Fetches top 10 + user best score per mode
- MongoDB stores user credentials (with bcrypt + JWT), game records, and user-submitted content.
- API authentication via JWT tokens.
- Uses OpenAI API for dynamic content generation.
- Automatic DB connect and start via `npm start`.

---

## Section 3. Novel Features

### 3.1 Front-end Innovations

- **Multi-mode Game UI**:  
  The application supports three distinct game modes: Text MCQ, News True/False, and Image True/False. Users can choose any mode from the homepage, and the app dynamically routes them to the appropriate component (`/game/text`, `/tfgame`, `/imagetf`). The interface logic is modular and scalable.

- **Interactive Quiz UX**:  
  The frontend offers polished UX features such as stylized option cards, instant feedback ("Correct"/"Incorrect"), disabled buttons after selection, and loading spinners for latency handling. These patterns are applied consistently across modes.

- **Account Awareness & Settings Panel**:  
  Logged-in users have a personalized experience, including a `SettingsModal` that lets them toggle between OpenAI and local model use, and optionally input their own API key. Login status is persisted via `localStorage`.

---

### 3.2 Back-end Innovations

- **Modular API Design**:  
  Each game mode has its own dedicated API endpoint:
  - `/api/generate-multi` (text comment game)  
  - `/api/generate-tf` (news game)  
  - `/api/generate-image-tf` (image game)  
  This separation ensures maintainable and clear backend structure.

- **JWT Authentication & Protected Routes**:  
  Users can register and log in. All sensitive endpoints (`/api/record`, `/api/leaderboard`) require valid JWT tokens, ensuring data protection and personalized tracking.

- **Aggregated Leaderboard with MongoDB**:  
  The `/api/leaderboard` endpoint uses aggregation pipelines to:
  - Return Top 10 scores per mode (by user)
  - Show the current user's best performance per mode (if logged in)

---

### 3.3 ML / Data Innovations

- **Generative AI Content Integration**:  
  Depending on the settings, the app can use OpenAI or local models (e.g., LLaMA via Ollama) to generate dynamic content:
  - In text mode, AI-generated comments are mixed with human ones  
  - In news mode, AI generates entire headlines and summaries

- **Multi-modal Dataset Handling**:  
  The game blends textual and visual modalities. The image game mixes base64-encoded real photos with AI-generated images (via DeepAI). Each requires separate pipelines and evaluation logic.

- **Hybrid Dataset: Curated + Crowdsourced**:  
  Real news and user-submitted comments are combined with dynamically generated AI content. Players can submit their own news-comment pairs to grow the dataset over time, enabling a self-improving data loop.

---

## Section 4: Software Engineering

- All major functions/components are annotated with inline comments.
- Modular file structure: `pages/`, `utils/`, and component separation.
- Good usability: all forms validated, clear error prompts (e.g., login/register).
- All borrowed code snippets (e.g., `apiFetch.js` headers) are custom-modified and noted.

---

## Section 5: Presentation 
[Click here to watch the demo video](https://youtu.be/xswiCsXQIlU)  
---

## Section 6: Project Management

- Commit messages added.
- Issues/notes tracked via commit logs and internal team messages.
---

## Appendix A: Full Feature List

### Frontend
- `/`: Homepage
- `/game/text`: Multi-choice text recognition
- `/imagetf`: True/False image guess
- `/tfgame`: True/False news article
- `/leaderboard`: Per-mode top 10 + personal best
- `/submit`: User content submission
- `/login`, `/register`: Auth

### Backend
- JWT authentication
- OpenAI API integration
- MongoDB persistence (users, questions, records)
- Record and score management
- Leaderboard logic with best score

---

## Appendix B: Tools & Scripts

- resizeImages.js – resize original images to 512×512 before base64 encoding
- initImages.js – seed labeled image dataset into MongoDB
- initQuestions.js – insert sample human-written news/comment pairs
- initRealNews.js – insert real-world news articles
- initExamples.js – insert crowd-sourced user comments

---

## Appendix C: Borrowed Code & External Libraries

- Used OpenAI API officially with documentation guidance.
- UI animations and spinners adapted from [CSS Loaders](https://css-loaders.com)
- `jwt`, `bcrypt`, and `mongodb` used with standard implementation patterns.
- Code generation with help of openAI chatgpt.

---
