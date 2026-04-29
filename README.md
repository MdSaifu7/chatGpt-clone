# ArcChat — AI Chat Application

A full-stack ChatGPT-style chat application with real-time messaging, persistent chat history, and long-term AI memory powered by vector embeddings.

![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Stack](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js) ![Stack](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb) ![Stack](https://img.shields.io/badge/Socket.io-4-black?logo=socket.io)

---

## Features

- **Real-time chat** via WebSockets (Socket.io)
- **Long-term memory** — AI recalls context from past messages using vector similarity search (Qdrant + OpenAI embeddings)
- **Short-term memory** — last 10 messages are included in every prompt for coherent conversations
- **Auto-generated chat titles** using GPT-4o-mini
- **Persistent history** — chats and messages are stored in MongoDB and restored on reload
- **JWT authentication** with HTTP-only cookies
- **Protected routes** on both the frontend and backend
- **Markdown rendering** for AI responses (code blocks, lists, etc.)
- **Responsive UI** with collapsible sidebar, typing indicator, and keyboard shortcuts

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 19 + Vite | UI framework and build tool |
| Tailwind CSS 4 | Styling |
| React Router v7 | Client-side routing |
| Socket.io Client | Real-time communication |
| Axios | HTTP requests |
| ReactMarkdown | Rendering AI markdown responses |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express 5 | REST API server |
| Socket.io | WebSocket server |
| MongoDB + Mongoose | Chat and user data persistence |
| Qdrant | Vector database for long-term memory |
| OpenAI API | Embeddings (`text-embedding-3-small`) + title generation (`gpt-4o-mini`) |
| Groq API | Main AI responses (fast inference) |
| JWT + bcryptjs | Authentication |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  Auth Context → Protected Routes → Home (Chat UI)   │
└────────────────────────┬────────────────────────────┘
                         │ HTTP (Axios) + WebSocket (Socket.io)
┌────────────────────────▼────────────────────────────┐
│                   Backend (Express)                  │
│                                                      │
│  /api/auth  ──→  Auth Controller                    │
│  /api/chat  ──→  Chat Controller                    │
│  socket.io  ──→  Socket Server (auth middleware)    │
└──────┬──────────────────┬───────────────────────────┘
       │                  │
┌──────▼──────┐   ┌───────▼───────────────────────────┐
│   MongoDB   │   │          AI Pipeline               │
│  Users      │   │  1. Convert message → embedding    │
│  Chats      │   │  2. Query Qdrant for similar msgs  │
│  Messages   │   │  3. Build context (LTM + STM)      │
└─────────────┘   │  4. Generate response via Groq     │
                  │  5. Store response embedding        │
                  └───────────────────────────────────┘
```

### Memory System

Each user message goes through a two-layer memory pipeline:

- **Short-term memory (STM):** The last 10 messages from the current chat are fetched from MongoDB and sent to the model as recent conversation history.
- **Long-term memory (LTM):** The message is converted to a vector embedding (OpenAI `text-embedding-3-small`) and used to query Qdrant for semantically similar past messages. Relevant snippets are injected into the system prompt so the AI can recall context from older conversations.

---

## Project Structure

```
├── backend/
│   ├── server.js               # Entry point — HTTP + Socket server
│   ├── src/
│   │   ├── app.js              # Express app, middleware, routes
│   │   ├── config/env.js       # Loads .env via dotenv
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── chat.routes.js
│   │   ├── controller/
│   │   │   ├── auth.controller.js
│   │   │   └── chat.controller.js
│   │   ├── middleware/
│   │   │   └── protect.routes.js   # JWT auth middleware
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── chat.model.js
│   │   │   └── message.model.js
│   │   ├── services/
│   │   │   ├── groq.ai.service.js  # AI response generation
│   │   │   ├── openai.service.js   # Title generation
│   │   │   └── vector.service.js   # OpenAI embeddings
│   │   ├── db/
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── qd.vector.db.js     # Qdrant client + operations
│   │   └── Sockets/
│   │       └── socket.server.js    # Real-time message handling + memory pipeline
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── AppRoutes.jsx
        ├── socket.js               # Socket.io client config
        ├── api/axiosConfig.js      # Axios base config
        ├── context/AuthContext.jsx # Global auth state
        ├── routes/ProtectedRoutes.jsx
        ├── pages/
        │   ├── Home.jsx            # Main chat UI
        │   ├── Login.jsx
        │   └── Register.jsx
        └── actions/userActions.js  # API call functions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- API keys for: [Groq](https://console.groq.com), [OpenAI](https://platform.openai.com), [Qdrant](https://cloud.qdrant.io)

### 1. Clone the repository

```bash
git clone https://github.com/MdSaifu7/arcchat.git
cd arcChat
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_DB_URL=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_here

GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

QDRANT_API_KEY=your_qdrant_api_key
# Also update the Qdrant cluster URL in src/db/qd.vector.db.js
```

Start the backend:

```bash
npm start
# Server runs on http://localhost:3000
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create a new account |
| POST | `/login` | Login and receive auth cookie |
| GET | `/login-status` | Check if current session is valid |

### Chat — `/api/chat` *(all routes require auth)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new chat |
| GET | `/getchat` | Get all chats for current user |
| GET | `/messages/:chatId` | Get all messages in a chat |
| POST | `/create-title` | Generate a title from a prompt |
| POST | `/delete` | Delete a chat and its messages |

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `user-message` | Client → Server | Send a message with `{ content, chat }` |
| `ai-response` | Server → Client | Receive AI reply with `{ user, ai }` |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_DB_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (use a long random string) |
| `GROQ_API_KEY` | Yes | API key from console.groq.com |
| `OPENAI_API_KEY` | Yes | API key from platform.openai.com |
| `QDRANT_API_KEY` | Yes | API key from cloud.qdrant.io |

---

## Roadmap

- [ ] Streaming AI responses (token-by-token)
- [ ] Logout endpoint
- [ ] User profile page
- [ ] Image upload support
- [ ] Mobile app (React Native)
- [ ] Rate limiting on auth endpoints

---

## License

MIT
