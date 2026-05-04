# Implementation Plan: Conan Vercel Web App

## Overview

Build a public-facing Next.js web application deployed on Vercel that hosts the Conan Tokyo travel agent chatbot. The app uses the Vercel AI SDK with `@ai-sdk/google` (Gemini 2.0 Flash) for streaming chat, a bundled 94-item master list as static JSON data, and a Tailwind CSS chat UI with Markdown rendering. Implementation proceeds incrementally: project scaffolding → data layer → system prompt → API route → UI components → error handling → tests → final wiring.

## Tasks

- [x] 1. Scaffold Next.js project and configure tooling
  - [x] 1.1 Initialize the Next.js project with TypeScript, Tailwind CSS, and App Router
    - Create `package.json` with all dependencies: `next`, `react`, `react-dom`, `ai`, `@ai-sdk/react`, `@ai-sdk/google`, `react-markdown`, `remark-gfm`
    - Add dev dependencies: `typescript`, `@types/react`, `@types/node`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Create `tsconfig.json` with `@/` path alias pointing to project root
    - Create `next.config.ts` with production-ready defaults
    - Create `tailwind.config.ts` scanning `app/` and `components/` directories
    - Create `postcss.config.mjs` with Tailwind plugin
    - Create `vitest.config.ts` configured for React (jsdom environment), path aliases, and test file patterns
    - _Requirements: 1.1, 1.3, 1.4, 8.1, 8.4_

  - [x] 1.2 Create environment and documentation files
    - Create `.env.example` with `GOOGLE_GENERATIVE_AI_API_KEY=your_key_here`
    - Create `README.md` with setup instructions, environment variable configuration, development commands, and Vercel deployment steps
    - _Requirements: 8.2, 8.3_

- [x] 2. Build the master list data layer
  - [x] 2.1 Pre-process CSV into JSON and create typed data access module
    - Parse `Tokyo_Master_Full_94_Items.csv` and generate `data/master-list.json` with all 94 entries
    - Each entry must include: `neighborhood`, `name`, `category`, `hours`, `rating`, `whatToTry`, `mapLink`
    - Create `lib/master-list.ts` with `LocationEntry` interface, `getMasterList()` function, `formatMasterListForPrompt()` function, and `groupBy` helper
    - The `formatMasterListForPrompt` function must group locations by neighborhood and format each entry with name, category, hours, rating, what to try, and map link
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.3, 5.4_

  - [ ]* 2.2 Write property test: Master list data completeness (Property 2)
    - **Property 2: Master list data completeness**
    - For each LocationEntry in the loaded master list, verify all 7 required fields (neighborhood, name, category, hours, rating, whatToTry, mapLink) are defined and non-empty
    - Use fast-check to generate indices into the master list array and verify field completeness
    - Tag: `Feature: conan-vercel-web-app, Property 2: Master list data completeness`
    - Minimum 100 iterations
    - **Validates: Requirements 4.3**

  - [ ]* 2.3 Write property test: Prompt formatting preserves all entries (Property 6)
    - **Property 6: Master list prompt formatting round-trip preserves all entries**
    - Generate random arrays of LocationEntry records using fast-check arbitraries
    - Verify that `formatMasterListForPrompt(entries)` output contains every `entry.name`
    - Tag: `Feature: conan-vercel-web-app, Property 6: Master list prompt formatting round-trip preserves all entries`
    - Minimum 100 iterations
    - **Validates: Requirements 3.2, 4.1**

  - [ ]* 2.4 Write unit tests for master list module
    - Test that `getMasterList()` returns exactly 94 entries
    - Test that all 16 neighborhoods are represented
    - Test that all 5 categories (Bakery, Coffee, Camera, Eyewear, Sight) are present
    - Test that `formatMasterListForPrompt` produces grouped output with neighborhood headers
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Build the system prompt module
  - [x] 3.1 Create the system prompt builder
    - Create `lib/system-prompt.ts` with `buildSystemPrompt()` function
    - Include Conan persona definition: expert Tokyo travel agent specializing in neighborhood-by-neighborhood itineraries
    - Include recommendation hierarchy rules: master list locations take priority, exactly 3 external recommendations when no master list matches
    - Include display format requirements: Google Maps photo link, navigation link, walk time from nearest station, Google rating, review summary, place summary
    - Include master list badge rule: `"**This is on Giang's Master List.**"` for master list locations
    - Include trip duration instruction: ask if not specified, organize by geographic proximity
    - Include the full master list data formatted via `formatMasterListForPrompt`
    - _Requirements: 3.1, 3.2, 3.3, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 3.2 Write property test: System prompt contains all master list locations (Property 1)
    - **Property 1: System prompt contains all master list locations**
    - Generate random arrays of LocationEntry records, mock `getMasterList` to return them
    - Verify `buildSystemPrompt()` output contains the name of every location in the dataset
    - Tag: `Feature: conan-vercel-web-app, Property 1: System prompt contains all master list locations`
    - Minimum 100 iterations
    - **Validates: Requirements 3.2, 4.2**

  - [ ]* 3.3 Write unit tests for system prompt builder
    - Test that output contains Conan persona text
    - Test that output contains recommendation hierarchy rules
    - Test that output contains "Giang's Master List" badge text
    - Test that output contains display format instructions
    - Test that output contains trip duration instruction
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 4. Checkpoint - Verify data layer and prompt
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement the Chat API route
  - [x] 5.1 Create the `/api/chat` route handler
    - Create `app/api/chat/route.ts` with a POST handler
    - Parse `messages` from the request body
    - Call `buildSystemPrompt()` to construct the system prompt with master list context
    - Use `streamText()` from the Vercel AI SDK with `google('gemini-2.0-flash')` model
    - Pass the system prompt via the `system` parameter and conversation messages via `convertToModelMessages`
    - Return `result.toUIMessageStreamResponse()` for SSE streaming
    - Add error handling: catch Gemini API errors and return HTTP 500 with `{ error: string }` JSON response
    - _Requirements: 1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.2, 5.2, 8.5, 9.1_

  - [ ]* 5.2 Write unit tests for the chat API route
    - Test that POST handler returns a streaming response
    - Test that system prompt is constructed with master list data
    - Test that errors from Gemini return HTTP 500 with error JSON
    - Mock `@ai-sdk/google` and `ai` modules for isolated testing
    - _Requirements: 3.4, 3.6, 9.1_

- [x] 6. Build the Chat UI components
  - [x] 6.1 Create global styles and root layout
    - Create `app/globals.css` with Tailwind CSS directives (`@import "tailwindcss"`)
    - Create `app/layout.tsx` as the root layout with HTML metadata (title: "Conan — Tokyo Travel Agent"), font configuration, and global CSS import
    - _Requirements: 1.1, 7.5_

  - [x] 6.2 Implement the WelcomeMessage component
    - Create `components/WelcomeMessage.tsx` displaying a welcome prompt when no messages exist
    - Include text indicating the user can ask Conan about Tokyo travel planning
    - Style with Tailwind CSS for centered, visually appealing empty state
    - _Requirements: 7.7_

  - [x] 6.3 Implement the TypingIndicator component
    - Create `components/TypingIndicator.tsx` showing an animated indicator while Conan is generating a response
    - Use CSS animation (e.g., bouncing dots) styled with Tailwind
    - _Requirements: 2.4, 2.5_

  - [x] 6.4 Implement the MessageBubble component
    - Create `components/MessageBubble.tsx` that renders a single message
    - Extract text content from `message.parts` array (filter for `type === 'text'`)
    - Apply right-aligned blue styling for user messages (plain text rendering)
    - Apply left-aligned gray styling for assistant messages (Markdown rendering via `react-markdown` with `remark-gfm`)
    - Ensure Markdown content renders bold text, links, and lists correctly
    - _Requirements: 7.3, 7.4_

  - [ ]* 6.5 Write property test: Message role determines bubble styling (Property 4)
    - **Property 4: Message role determines bubble styling**
    - Generate UIMessage objects with random roles (`user` or `assistant`) using fast-check
    - Verify that user messages get right-aligned styling and assistant messages get left-aligned styling
    - Tag: `Feature: conan-vercel-web-app, Property 4: Message role determines bubble styling`
    - Minimum 100 iterations
    - **Validates: Requirements 7.3**

  - [ ]* 6.6 Write property test: Markdown content is rendered as HTML in assistant messages (Property 5)
    - **Property 5: Markdown content is rendered as HTML in assistant messages**
    - Generate assistant messages containing Markdown syntax (bold, links, lists) using fast-check
    - Verify that the rendered output contains HTML elements (not raw Markdown text)
    - Tag: `Feature: conan-vercel-web-app, Property 5: Markdown content is rendered as HTML in assistant messages`
    - Minimum 100 iterations
    - **Validates: Requirements 7.4**

  - [x] 6.7 Implement the ChatInput component
    - Create `components/ChatInput.tsx` with a text input field and send button
    - Prevent submission of empty or whitespace-only messages (trim and validate before calling `onSend`)
    - Disable input and send button while streaming is in progress (`disabled` prop)
    - Clear input field after successful send
    - Add `aria-label` attributes for accessibility on input and button
    - _Requirements: 7.2, 9.3, 9.4_

  - [ ]* 6.8 Write property test: Whitespace-only messages are rejected (Property 3)
    - **Property 3: Whitespace-only messages are rejected**
    - Generate random whitespace-only strings (spaces, tabs, newlines, empty string) using fast-check
    - Simulate form submission with each string and verify `onSend` callback is never invoked
    - Tag: `Feature: conan-vercel-web-app, Property 3: Whitespace-only messages are rejected`
    - Minimum 100 iterations
    - **Validates: Requirements 9.4**

  - [ ]* 6.9 Write unit tests for ChatInput component
    - Test that send button is disabled when input is empty
    - Test that send button is disabled during streaming
    - Test that input clears after successful send
    - _Requirements: 9.3, 9.4_

- [x] 7. Checkpoint - Verify UI components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Assemble the main Chat component and page
  - [x] 8.1 Implement the Chat container component
    - Create `components/Chat.tsx` as a client component (`'use client'`)
    - Use the `useChat` hook from `@ai-sdk/react` to manage chat state and streaming
    - Render the header with "Conan — Tokyo Travel Agent" title
    - Render scrollable message area with `WelcomeMessage` when empty, `MessageBubble` for each message, and `TypingIndicator` during streaming/submitted states
    - Render error banner when `error` state is set (user-friendly message)
    - Render `ChatInput` at the bottom, disabled during streaming
    - Implement auto-scroll to latest message when new content arrives
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.6, 9.1, 9.2, 9.3_

  - [x] 8.2 Create the home page
    - Create `app/page.tsx` that renders the `Chat` component
    - Ensure the page is accessible at the root URL without authentication
    - _Requirements: 1.1, 6.1, 6.4_

  - [ ]* 8.3 Write unit tests for Chat component
    - Test that welcome message renders when message history is empty
    - Test that typing indicator shows during streaming state
    - Test that error banner displays when error state is set
    - Mock `useChat` hook for isolated component testing
    - _Requirements: 2.4, 7.7, 9.1, 9.2_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document (Properties 1–6)
- Unit tests validate specific scenarios and edge cases
- The design uses TypeScript throughout — all code examples and implementations use TypeScript
- All 94 master list locations are pre-processed from `Tokyo_Master_Full_94_Items.csv` into static JSON
- No authentication is required — the app is fully public
