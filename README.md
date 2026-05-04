# Conan — Tokyo Travel Agent

A public-facing Next.js web application that hosts the Conan Tokyo travel agent chatbot. Conan is an expert Tokyo travel agent that provides personalized, neighborhood-by-neighborhood itinerary recommendations backed by a curated master list of 94 locations across 16 neighborhoods.

Built with the Vercel AI SDK, Google Gemini, and Tailwind CSS.

## Prerequisites

- Node.js 18.x or later
- A Google Generative AI API key ([get one here](https://aistudio.google.com/apikey))

## Environment Variables

Copy the example environment file and add your API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder with your actual key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

> **Important:** Never commit `.env.local` or hardcode API keys in source code. The `.env.example` file is provided as a template only.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start chatting with Conan.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with metadata and global styles
│   ├── page.tsx                # Home page — renders the Chat UI
│   ├── globals.css             # Global styles (Tailwind CSS)
│   └── api/
│       └── chat/
│           └── route.ts        # Chat API route handler
├── components/
│   ├── Chat.tsx                # Main chat container component
│   ├── MessageBubble.tsx       # Individual message display
│   ├── ChatInput.tsx           # Input field + send button
│   ├── TypingIndicator.tsx     # "Conan is typing..." indicator
│   └── WelcomeMessage.tsx      # Initial empty-state prompt
├── lib/
│   ├── master-list.ts          # Parsed master list data + types
│   └── system-prompt.ts        # System prompt construction
├── data/
│   └── master-list.json        # Pre-processed master list (from CSV)
├── .env.example                # Template for required environment variables
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vitest.config.ts            # Test configuration
```

## Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.

2. Go to [vercel.com](https://vercel.com) and import your repository.

3. In the Vercel project settings, add the required environment variable:

   - **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value:** Your Google Generative AI API key

4. Deploy. Vercel automatically detects the Next.js framework and applies the correct build settings.

5. Your app will be live at the URL Vercel assigns (e.g., `your-project.vercel.app`).

### Updating

Push to your main branch to trigger automatic redeployments on Vercel.

## Tech Stack

- **Framework:** Next.js (App Router)
- **LLM:** Google Gemini via `@ai-sdk/google`
- **Chat SDK:** Vercel AI SDK (`useChat` + `streamText`)
- **Styling:** Tailwind CSS
- **Markdown:** `react-markdown` with `remark-gfm`
- **Testing:** Vitest + fast-check

## License

Private project.
