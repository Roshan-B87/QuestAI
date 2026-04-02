# QuestAI - Frontend

> 🎓 An intelligent multi-language campus assistant powered by RAG and LLMs
>
> **Tagline:** "Understand Any Language, Respond in English"

A React + Vite frontend for QuestAI—an AI-powered chatbot designed to help college students with campus-related queries in multiple languages.

## 🌟 Features

- **Multi-Language Support**: Understand queries in English, Hindi, and regional languages
- **Smart Q&A**: Retrieval-Augmented Generation (RAG) for accurate, contextual answers
- **Document Upload**: Upload personal PDFs, DOCX, or TXT files for custom knowledge bases
- **Intent Classification**: Recognizes 9 query types (fees, scholarships, admissions, results, etc.)
- **Human Escalation**: Routes low-confidence queries to human agents with ticket tracking
- **Real-time Streaming**: Live response generation with typing indicators
- **Conversation History**: Session-based chat logging and retrieval
- **Multi-Platform Integration**: Connect via WhatsApp, Telegram, Slack, and Microsoft Teams
- **Responsive UI**: Beautiful, animated interface with Tailwind CSS and Framer Motion

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: UUID, Markdown support

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- Backend API running on `http://localhost:8000`

## 🚀 Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/src/
├── App.jsx                 # Main routing
├── main.jsx                # App entry point
├── components/
│   ├── LandingPage.jsx     # Hero landing page with features showcase
│   ├── LoginPage.jsx       # User authentication
│   ├── SignupPage.jsx      # User registration
│   ├── RagLayout.jsx       # Main chat interface
│   ├── Sidebar.jsx         # Document management & controls
│   ├── ChatPanel.jsx       # Message display & input
│   └── IntegrationPage.jsx # Integration documentation
└── assets/
    └── cam.png             # Logo
```

## 🎯 Main Pages

| Page | Purpose |
|------|---------|
| **Landing** | Hero section showcasing features and integrations |
| **Chat** | Main interface with RAG-powered conversations |
| **Document Upload** | Upload custom PDFs, DOCX, TXT for personalized Q&A |
| **Chat History** | Retrieve past conversations by session |
| **Integrations** | WhatsApp, Telegram, Slack, Teams documentation |

## 📡 API Integration

The frontend communicates with the FastAPI backend running on port 8000:

```javascript
// Example: Send a chat message
POST /chat
{
  "query": "What's the fee structure?",
  "session_id": "user-uuid",
  "language": "en"
}
```

See backend documentation for full API endpoints.

## 🌐 Supported Languages

- English
- Hindi
- Auto-detect regional languages (Tamil, Telugu, Kannada, Malayalam, Marathi)

All queries are processed in English for consistent AI responses.

## 📁 Session Management

Each user gets a unique UUID stored in `localStorage` for:
- Conversation history retrieval
- Document storage per user
- Chat logging
- Ticket escalation tracking

## 🔧 Environment Variables

Create a `.env` file if needed:

```env
VITE_API_URL=http://localhost:8000
```

## ✨ Key Components

### RagLayout
Main chat interface combining sidebar and chat panel. Handles:
- Document upload/management
- Language selection
- Message history
- Real-time responses

### ChatPanel
Displays messages, processes user input, shows typing indicators, and renders streamed responses.

### Sidebar
Manages uploaded documents, displays knowledge base info, shows recent queries.

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Responsive Design** for mobile and desktop
- **Dark/Light Theme Ready**

## 🚀 Building for Production

```bash
# Build optimized bundle
npm run build

# Analyze bundle size (if installed)
npm run preview
```

The production build is minified and optimized for performance.

## 📝 Notes

- Hot Module Replacement (HMR) enabled for rapid development
- ESLint configured for code quality
- Session IDs persist across browser sessions in localStorage
- All network requests are async with proper error handling

## 🤝 Contributing

Contributions are welcome! Please ensure code follows the project's style guidelines.

## 📄 License

This project is part of a 2026 Hackathon submission.
