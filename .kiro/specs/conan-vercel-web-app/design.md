# Design Document: Conan Vercel Web App

## Overview

This design describes a public-facing Next.js web application deployed on Vercel that hosts the Conan Tokyo travel agent chatbot. The application uses the Vercel AI SDK with the `@ai-sdk/google` provider to stream Gemini responses to a React chat UI. The 94-item curated master list is bundled as static data within the application, and the system prompt encodes the full Conan persona, recommendation hierarchy, and display format rules defined in the existing Conan travel agent requirements.

The architecture follows the standard Vercel AI SDK pattern: a React frontend using the `useChat` hook communicates with a Next.js API route at `/api/chat`, which calls Gemini via `streamText` and returns a streaming response. No authentication is required — the app is fully public.

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js (App Router) | Native Vercel deployment, React Server Components, built-in API routes |
| LLM Provider | Google Gemini via `@ai-sdk/google` | Strong instruction following for persona adherence, large context window for master list |
| Chat Integration | Vercel AI SDK `useChat` + `streamText` | Handles streaming, message state, and SSE transport out of the box |
| Data Strategy | CSV bundled as static TypeScript module | Zero runtime DB dependency, fast cold starts, simple deployment |
| Real-time Data | Static CSV data only (no external API) | All location details (ratings, hours, "What to Try") come from the bundled master list — no Google Places API calls |
| Auth | None | Fully public per requirements |
| Styling | Tailwind CSS | Standard Next.js/Vercel ecosystem, responsive by default |
| Markdown Rendering | `react-markdown` with `remark-gfm` | Conan responses include bold, links, lists |

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph Browser
        UI[Chat UI<br/>useChat hook]
    end

    subgraph Vercel Serverless
        API["/api/chat<br/>Route Handler"]
        SP[System Prompt<br/>Builder]
        ML[Master List<br/>Module]
    end

    subgraph External
        Gemini[Google Gemini<br/>API]
    end

    UI -->|POST /api/chat<br/>messages[]| API
    API --> SP
    SP --> ML
    API -->|streamText()| Gemini
    Gemini -->|SSE stream| API
    API -->|toUIMessageStreamResponse()| UI
```

### Request Flow

1. User types a message in the Chat UI and submits
2. The `useChat` hook sends a POST request to `/api/chat` with the full conversation history
3. The route handler loads the master list data and constructs the system prompt
4. The route handler calls `streamText()` with the Google Gemini model, system prompt, and conversation messages
5. Gemini generates a streaming response
6. The response is converted to a UI message stream and sent back as SSE
7. The `useChat` hook receives tokens incrementally and updates the UI in real time

### Project Structure

```
conan-vercel-web-app/
├── app/
│   ├── layout.tsx              # Root layout with metadata, fonts, global styles
│   ├── page.tsx                # Home page — renders the Chat UI
│   ├── globals.css             # Global styles (Tailwind directives)
│   └── api/
│       └── chat/
│           └── route.ts        # Chat API route handler
├── components/
│   ├── Chat.tsx                # Main chat container component
│   ├── MessageBubble.tsx       # Individual message display (user vs Conan)
│   ├── ChatInput.tsx           # Input field + send button
│   ├── TypingIndicator.tsx     # "Conan is typing..." indicator
│   └── WelcomeMessage.tsx      # Initial empty-state prompt
├── lib/
│   ├── master-list.ts          # Parsed master list data + types
│   └── system-prompt.ts        # System prompt construction
├── data/
│   └── master-list.json        # Pre-processed master list (from CSV)
├── public/
│   └── conan-avatar.png        # Conan avatar image (optional)
├── .env.local                  # Local environment variables (not committed)
├── .env.example                # Template for required env vars
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Setup and deployment instructions
```

## Components and Interfaces

### 1. Chat API Route (`app/api/chat/route.ts`)

The serverless function that bridges the frontend and Gemini.

```typescript
// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { buildSystemPrompt } from '@/lib/system-prompt';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = buildSystemPrompt();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

**Interface contract:**
- **Input**: POST body with `{ messages: UIMessage[] }` — the full conversation history
- **Output**: SSE stream conforming to the Vercel AI SDK UI message stream protocol
- **Error**: Returns HTTP 500 with JSON `{ error: string }` on Gemini API failure

### 2. System Prompt Builder (`lib/system-prompt.ts`)

Constructs the complete system prompt by combining:
1. Conan persona definition and behavioral rules
2. Recommendation hierarchy logic
3. Display format requirements (photo link, nav link, walk time, rating, reviews, summary)
4. Master list badge rule
5. The full master list dataset as structured context

```typescript
// lib/system-prompt.ts
import { getMasterList } from './master-list';

export function buildSystemPrompt(): string {
  const masterListData = getMasterList();
  const masterListContext = formatMasterListForPrompt(masterListData);

  return `${CONAN_PERSONA}

${RECOMMENDATION_RULES}

${DISPLAY_FORMAT_RULES}

${MASTER_LIST_BADGE_RULE}

## Master List Data (94 Curated Locations)

${masterListContext}`;
}
```

The prompt sections encode all rules from the Conan travel agent requirements:
- **Persona**: Expert Tokyo travel agent, neighborhood-by-neighborhood itineraries
- **Recommendation hierarchy**: Master list first, then exactly 3 external recommendations if no matches
- **Display format**: Every recommendation includes Google Maps photo link, navigation link, walk time, rating, review summary, place summary
- **Badge**: "**This is on Giang's Master List.**" for master list locations
- **Trip duration**: Ask if not specified, organize by geographic proximity

### 3. Master List Module (`lib/master-list.ts`)

Loads and provides typed access to the 94-location dataset.

```typescript
// lib/master-list.ts
import masterListData from '@/data/master-list.json';

export interface LocationEntry {
  neighborhood: string;
  name: string;
  category: 'Bakery' | 'Coffee' | 'Camera' | 'Eyewear' | 'Sight';
  hours: string;
  rating: number;
  whatToTry: string;
  mapLink: string;
}

export function getMasterList(): LocationEntry[] {
  return masterListData as LocationEntry[];
}

export function formatMasterListForPrompt(locations: LocationEntry[]): string {
  const byNeighborhood = groupBy(locations, 'neighborhood');
  return Object.entries(byNeighborhood)
    .map(([hood, locs]) =>
      `### ${hood} (${locs.length} items)\n` +
      locs.map(l =>
        `- **${l.name}** (${l.category}) | ${l.hours} | ★${l.rating} | Try: ${l.whatToTry} | [Map](${l.mapLink})`
      ).join('\n')
    ).join('\n\n');
}
```

### 4. Chat Component (`components/Chat.tsx`)

The main chat container using the `useChat` hook.

```typescript
// components/Chat.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { WelcomeMessage } from './WelcomeMessage';
import { TypingIndicator } from './TypingIndicator';

export function Chat() {
  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat();

  const isStreaming = status === 'streaming';
  const isSubmitted = status === 'submitted';

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="p-4 border-b text-center">
        <h1>Conan — Tokyo Travel Agent</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && <WelcomeMessage />}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {(isStreaming || isSubmitted) && <TypingIndicator />}
      </div>

      {error && (
        <div className="p-3 mx-4 mb-2 bg-red-50 text-red-700 rounded">
          Something went wrong. Please try again.
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming || isSubmitted}
      />
    </div>
  );
}
```

### 5. MessageBubble Component (`components/MessageBubble.tsx`)

Renders a single message with role-based styling and Markdown support.

```typescript
// components/MessageBubble.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { UIMessage } from '@ai-sdk/react';

interface Props {
  message: UIMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const textContent = message.parts
    ?.filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('') ?? '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        {isUser ? (
          <p>{textContent}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {textContent}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
```

### 6. ChatInput Component (`components/ChatInput.tsx`)

Fixed-bottom input with send button and empty-message prevention.

```typescript
// components/ChatInput.tsx
'use client';

import { useState, type FormEvent } from 'react';

interface Props {
  onSend: (message: { text: string }) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend({ text: trimmed });
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Conan about Tokyo..."
        disabled={disabled}
        className="flex-1 rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Chat message input"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        aria-label="Send message"
      >
        Send
      </button>
    </form>
  );
}
```

### 7. Google Data Fetching — Removed

The application uses static master list data exclusively for location details (ratings, hours, "What to Try"). No external API calls are made for location data at runtime. All 94 curated locations and their details are bundled in the `data/master-list.json` file and included in the system prompt.

## Data Models

### LocationEntry

The core data type representing a single curated location from the master list.

```typescript
interface LocationEntry {
  neighborhood: string;   // e.g., "Ginza", "Shibuya"
  name: string;           // e.g., "Turret Coffee"
  category: Category;     // "Bakery" | "Coffee" | "Camera" | "Eyewear" | "Sight"
  hours: string;          // e.g., "07:00-18:00"
  rating: number;         // e.g., 4.6
  whatToTry: string;      // e.g., "Turret Latte"
  mapLink: string;        // Google Maps URL
}

type Category = 'Bakery' | 'Coffee' | 'Camera' | 'Eyewear' | 'Sight';
```

### UIMessage (from Vercel AI SDK)

The message type managed by the `useChat` hook. Not defined by us — provided by `@ai-sdk/react`.

```typescript
// From @ai-sdk/react (reference only)
interface UIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  parts: UIPart[];
  status: 'submitted' | 'streaming' | 'ready' | 'error';
}
```

### Chat API Request/Response

```typescript
// POST /api/chat request body
interface ChatRequest {
  messages: UIMessage[];
}

// Response: SSE stream (not JSON)
// Content-Type: text/event-stream
// Each event contains a UI message stream chunk
```

### Environment Variables

```typescript
// Required
GOOGLE_GENERATIVE_AI_API_KEY: string;    // Google Generative AI API key for Gemini access
```

### Master List Statistics

| Metric | Value |
|--------|-------|
| Total locations | 94 |
| Neighborhoods | 16 |
| Categories | 5 (Bakery, Coffee, Camera, Eyewear, Sight) |
| Data format | JSON (pre-processed from CSV) |
| Approximate token count | ~3,000 tokens in system prompt |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: System prompt contains all master list locations

*For any* valid master list dataset of LocationEntry records, the output of `buildSystemPrompt()` SHALL contain the name of every location in the dataset, ensuring no locations are silently dropped during prompt construction.

**Validates: Requirements 3.2, 4.2**

### Property 2: Master list data completeness

*For any* LocationEntry in the loaded master list, all required fields (neighborhood, name, category, hours, rating, whatToTry, mapLink) SHALL be defined and non-empty, ensuring data integrity of the bundled dataset.

**Validates: Requirements 4.3**

### Property 3: Whitespace-only messages are rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines, or the empty string), the ChatInput component SHALL prevent form submission and SHALL NOT invoke the onSend callback, ensuring no empty messages reach the API.

**Validates: Requirements 9.4**

### Property 4: Message role determines bubble styling

*For any* UIMessage, the MessageBubble component SHALL apply right-aligned styling when the message role is `'user'` and left-aligned styling when the role is `'assistant'`, ensuring visual distinction between user and Conan messages.

**Validates: Requirements 7.3**

### Property 5: Markdown content is rendered as HTML in assistant messages

*For any* assistant message containing Markdown syntax (bold, links, lists), the MessageBubble component SHALL render the content through a Markdown processor rather than displaying raw Markdown text.

**Validates: Requirements 7.4**

### Property 6: Master list prompt formatting round-trip preserves all entries

*For any* array of LocationEntry records, formatting them into the prompt string and then checking for each entry's name in the output SHALL confirm that every entry is represented — i.e., `formatMasterListForPrompt(entries)` contains every `entry.name`.

**Validates: Requirements 3.2, 4.1**

## Error Handling

### API Route Errors

| Error Scenario | Handling | User Experience |
|----------------|----------|-----------------|
| Gemini API unreachable | Catch error in route handler, return HTTP 500 with `{ error: "Service temporarily unavailable" }` | Chat UI displays error banner via `useChat` error state |
| Gemini API rate limited | Return HTTP 429 with retry-after hint | Chat UI shows "Please try again in a moment" |
| Invalid request body | Return HTTP 400 with validation error | Chat UI shows generic error message |
| Missing GOOGLE_GENERATIVE_AI_API_KEY | Route handler throws on startup | Build-time or first-request error; developer must configure env var |

### Frontend Error Handling

| Error Scenario | Handling | User Experience |
|----------------|----------|-----------------|
| Network error during streaming | `useChat` `onError` callback fires, `error` state is set | Error banner displayed, user can retry |
| Stream interruption | `useChat` detects connection loss | Partial message shown with error indicator |
| Empty message submission | `ChatInput` prevents form submission client-side | Send button disabled, no request sent |
| Duplicate submission | Input and button disabled during streaming (`isStreaming \|\| isSubmitted`) | User cannot send while Conan is responding |

### Error Response Format

```typescript
// API error response
interface ErrorResponse {
  error: string;
  code?: string;
}

// Example: Gemini API failure
// HTTP 500
{ "error": "The travel agent service is temporarily unavailable. Please try again." }
```

## Testing Strategy

### Testing Approach

This project uses a dual testing approach:

1. **Property-based tests** verify universal properties across many generated inputs using [fast-check](https://github.com/dubzzz/fast-check)
2. **Example-based unit tests** verify specific scenarios, edge cases, and integration points using [Vitest](https://vitest.dev/) with React Testing Library

### Property-Based Tests

Each property test runs a minimum of 100 iterations with randomly generated inputs.

| Property | Test Description | Library |
|----------|-----------------|---------|
| Property 1: System prompt contains all locations | Generate random arrays of LocationEntry, verify `buildSystemPrompt()` output contains every name | fast-check |
| Property 2: Master list data completeness | For each entry in the loaded master list, verify all 7 fields are defined and non-empty | fast-check |
| Property 3: Whitespace rejection | Generate random whitespace strings, verify ChatInput does not call onSend | fast-check |
| Property 4: Role-based styling | Generate messages with random roles, verify correct CSS classes applied | fast-check |
| Property 5: Markdown rendering | Generate assistant messages with Markdown, verify HTML output (not raw text) | fast-check |
| Property 6: Prompt formatting preserves entries | Generate random LocationEntry arrays, verify all names appear in formatted output | fast-check |

**Tag format**: Each test is tagged with `Feature: conan-vercel-web-app, Property {N}: {description}`

**Configuration**: Minimum 100 iterations per property test.

### Example-Based Unit Tests

| Area | Tests |
|------|-------|
| Chat API Route | POST returns streaming response; error returns 500; system prompt includes persona rules, badge rule, display format |
| System Prompt | Contains Conan persona text; contains recommendation hierarchy; contains "Giang's Master List" badge text; contains trip duration instruction |
| Master List Module | Loads exactly 94 entries; covers all 16 neighborhoods; covers all 5 categories |
| Chat Component | Renders welcome message when empty; shows typing indicator during streaming; hides indicator when complete; displays error banner on API failure |
| ChatInput | Disables input during streaming; clears input after send; focuses input on mount |
| MessageBubble | Renders user message as plain text; renders assistant message with Markdown |

### Integration Tests

| Test | Description |
|------|-------------|
| Full chat flow | Submit message → API route called → streaming response rendered |
| Error recovery | API returns error → error displayed → user retries → success |
| Empty state | Initial load shows welcome message, input is focused |

### Test File Structure

```
__tests__/
├── lib/
│   ├── master-list.test.ts          # Master list loading and formatting
│   └── system-prompt.test.ts        # System prompt construction
├── components/
│   ├── Chat.test.tsx                # Chat container behavior
│   ├── ChatInput.test.tsx           # Input validation and submission
│   └── MessageBubble.test.tsx       # Message rendering and styling
├── api/
│   └── chat.test.ts                 # API route handler
└── properties/
    ├── system-prompt.property.test.ts   # Properties 1, 6
    ├── master-list.property.test.ts     # Property 2
    ├── chat-input.property.test.ts      # Property 3
    └── message-bubble.property.test.ts  # Properties 4, 5
```

