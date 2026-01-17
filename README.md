# MiowNation Prompter

**Prompter** is an advanced AI-powered platform designed to help users research, plan, and architect software projects. It uses a multi-agent orchestration system to transform simple ideas into comprehensive technical specifications, file systems, and production-ready prompts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

## 🚀 Key Features

### 🏗️ Architect Mode
The heart of the platform is the **Architect Orchestrator**, a state-based multi-agent system that guides development:
1.  **Research & Validation**: Market analysis and tech stack selection.
2.  **Strategic Planning**: Creation of project roadmaps and phase-by-phase breakdowns.
3.  **Master Context**: Synthesis of all project data into a "God Prompt".
4.  **Code Execution**: Generation of Virtual File Systems (VFS) and code structures.

### 🛠️ Builder & Playground
-   **Magic Refine**: iterating on prompts using specialized LLM techniques.
-   **Export Code**: Generate ready-to-use snippets in Python, TypeScript, and cURL.
-   **Modular Console**: A robust playground for testing agents with support for system prompts, variable interpolation, and history tracking.

### ⚡ Performance & Architecture
-   **Modular Design**: Feature-based architecture (`src/features`, `server/services/architect`) for scalability.
-   **Lazy Loading**: Heavy components (Visualizers, Playground) are code-split and lazy-loaded for fast initial paint.
-   **Optimized Hooks**: Core logic uses aggressive memoization (`useCallback`, `useMemo`) to ensure smooth performance even with complex state.

## 🛠️ Tech Stack

-   **Frontend**: React, Wright, Tailwind CSS, Lucide Icons, Mermaid.js
-   **Backend**: Node.js, Express, Prisma ORM
-   **Database**: PostgreSQL
-   **AI**: LangChain, OpenAI (GPT-4o), Anthropic (Claude), Ollama
-   **Deployment**: Docker Compose

## 📦 Installation & Development

### Prerequisites
-   Node.js v18+
-   Docker (for database)

### Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/miownation_prompter.git
    cd miownation_prompter
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    ```bash
    cp .env.example .env
    # Fill in required keys: DATABASE_URL, OPENAI_API_KEY, etc.
    ```

4.  **Database Migration**
    ```bash
    npx prisma migrate dev
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    # Runs both Frontend (Vite) and Backend (Express) concurrently
    ```

### Testing & Verification

We include a robust verification suite to ensure code quality:

-   **Run Unit Tests**:
    ```bash
    npm test
    ```
-   **Verify Build Integrity**:
    ```bash
    ./scripts/verify-build.sh
    # Runs type checking and full production build
    ```

## 🐳 Docker Deployment

For a production-ready containerized environment:

```bash
docker-compose up --build -d
```

## 📚 Documentation

-   [API Reference](docs/API.md)
-   [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## 📄 License

MIT
