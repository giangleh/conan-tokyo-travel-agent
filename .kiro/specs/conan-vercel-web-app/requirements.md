# Requirements Document

## Introduction

This document defines the requirements for a public-facing web application that hosts the Conan Tokyo travel agent chatbot on Vercel. The application provides a streaming chat interface powered by Next.js, the Vercel AI SDK, and Anthropic Claude. Users interact with Conan through a modern chat UI to receive personalized Tokyo itinerary recommendations backed by real-time Google data. The chatbot behavior, persona, recommendation logic, and master list data are defined in the existing Conan travel agent requirements (`.kiro/specs/conan-travel-agent/requirements.md`) and are referenced rather than duplicated here.

## Glossary

- **Web_App**: The Next.js web application deployed on Vercel that hosts the Conan chatbot interface.
- **Chat_UI**: The frontend chat interface component that displays the conversation between the user and Conan, including message history, input field, and streaming response indicators.
- **Chat_API_Route**: The Next.js API route located at `/api/chat` that receives user messages, constructs the LLM prompt with system context, and streams responses from Claude back to the client.
- **Vercel_AI_SDK**: The `ai` npm package providing React hooks (`useChat`) and server utilities for building streaming AI chat applications.
- **useChat_Hook**: The Vercel AI SDK React hook that manages chat state, message history, and streaming communication between the Chat_UI and the Chat_API_Route.
- **System_Prompt**: The instruction set sent to Claude that defines the Conan persona, recommendation rules, and behavioral constraints as specified in the existing Conan travel agent requirements.
- **Master_List_Context**: The complete dataset of 94 curated Tokyo locations across 16 neighborhoods, bundled as context for the LLM within the System_Prompt.
- **Claude_LLM**: The Anthropic Claude language model used as the AI backend for generating Conan's responses.
- **Streaming_Response**: A server-sent event stream that delivers Claude's response tokens incrementally to the Chat_UI as they are generated.
- **Google_Data_Fetch**: The process of retrieving real-time location data (ratings, hours, reviews) from Google when Conan recommends specific locations.
- **Message_Bubble**: A visual container in the Chat_UI that displays a single message from either the user or Conan.

## Requirements

### Requirement 1: Next.js Application Structure

**User Story:** As a developer, I want the web application built with Next.js using the App Router, so that it integrates natively with Vercel's deployment platform and supports modern React patterns.

#### Acceptance Criteria

1. THE Web_App SHALL be a Next.js application using the App Router architecture.
2. THE Web_App SHALL include a Chat_API_Route at the path `/api/chat` that handles POST requests containing user messages.
3. THE Web_App SHALL be deployable to Vercel without additional infrastructure configuration.
4. THE Web_App SHALL use TypeScript for type safety across all source files.

### Requirement 2: Streaming Chat Interface

**User Story:** As a user, I want to see Conan's responses appear in real time as they are generated, so that I get immediate feedback and a responsive conversational experience.

#### Acceptance Criteria

1. THE Chat_UI SHALL use the useChat_Hook from the Vercel_AI_SDK to manage chat state and streaming communication.
2. WHEN the user submits a message, THE Chat_UI SHALL display the message immediately in a user Message_Bubble.
3. WHEN the Chat_API_Route begins streaming a response, THE Chat_UI SHALL render incoming tokens progressively in a Conan Message_Bubble.
4. WHILE a Streaming_Response is in progress, THE Chat_UI SHALL display a visual indicator that Conan is generating a response.
5. WHEN a Streaming_Response completes, THE Chat_UI SHALL remove the generating indicator and display the full response.
6. THE useChat_Hook SHALL send messages to the Chat_API_Route at `/api/chat`.

### Requirement 3: Chat API Route and LLM Integration

**User Story:** As a developer, I want the API route to send user messages to Claude with the full Conan system prompt and master list data, so that Conan responds with accurate, persona-consistent recommendations.

#### Acceptance Criteria

1. WHEN the Chat_API_Route receives a POST request, THE Chat_API_Route SHALL forward the conversation history to the Claude_LLM with the System_Prompt prepended.
2. THE Chat_API_Route SHALL include the complete Master_List_Context (94 locations across 16 neighborhoods) within the System_Prompt sent to the Claude_LLM.
3. THE Chat_API_Route SHALL include all Conan persona rules, recommendation logic, and display format requirements from the existing Conan travel agent requirements within the System_Prompt.
4. THE Chat_API_Route SHALL stream the Claude_LLM response back to the client using the Vercel_AI_SDK streaming utilities.
5. THE Chat_API_Route SHALL use the Anthropic Claude model via the Vercel AI SDK's Anthropic provider.
6. IF the Claude_LLM returns an error, THEN THE Chat_API_Route SHALL return an appropriate error response to the client.

### Requirement 4: Master List Data Bundling

**User Story:** As a developer, I want the master list CSV data bundled into the application so that Conan has access to all 94 curated locations without external data fetches at runtime.

#### Acceptance Criteria

1. THE Web_App SHALL bundle the Master_List_Context containing all 94 Location_Entry records from the `Tokyo_Master_Full_94_Items.csv` file.
2. THE Chat_API_Route SHALL load the Master_List_Context at request time and include it in the System_Prompt sent to the Claude_LLM.
3. THE Master_List_Context SHALL include for each location: Neighborhood, Name, Category, Hours, Rating, What to Try, and Map Link.
4. THE Web_App SHALL store the master list data as a static asset or embedded module that does not require an external database or API call to access.

### Requirement 5: Real-Time Google Data Fetching

**User Story:** As a user, I want Conan to provide current Google ratings, hours, and reviews when recommending locations, so that I receive up-to-date information for planning my visit.

#### Acceptance Criteria

1. WHEN the Claude_LLM generates a recommendation for a specific location, THE Web_App SHALL support fetching real-time Google data (current rating, current hours, recent reviews) for that location.
2. THE System_Prompt SHALL instruct the Claude_LLM to include real-time Google ratings, hours, and review summaries when recommending locations.
3. IF real-time Google data is unavailable for a location, THEN THE Web_App SHALL fall back to the static data from the Master_List_Context.
4. THE Web_App SHALL not cache real-time Google data beyond the duration of a single chat session.

### Requirement 6: Public Access Without Authentication

**User Story:** As a public user, I want to access the Conan chatbot without creating an account or logging in, so that I can immediately start planning my Tokyo trip.

#### Acceptance Criteria

1. THE Web_App SHALL serve the Chat_UI to all visitors without requiring authentication or login.
2. THE Chat_API_Route SHALL process requests without requiring authentication tokens or session cookies.
3. THE Web_App SHALL not implement any user registration, login, or account management features.
4. WHEN any user navigates to the Web_App root URL, THE Web_App SHALL display the Chat_UI immediately.

### Requirement 7: Chat UI Design and Layout

**User Story:** As a user, I want a clean, modern chat interface that feels appropriate for a travel agent conversation, so that my planning experience is visually pleasant and easy to use.

#### Acceptance Criteria

1. THE Chat_UI SHALL display a scrollable message history area showing all Message_Bubbles in chronological order.
2. THE Chat_UI SHALL display a fixed input area at the bottom of the viewport containing a text input field and a send button.
3. THE Chat_UI SHALL visually distinguish user Message_Bubbles from Conan Message_Bubbles using different alignment or styling.
4. THE Chat_UI SHALL render Markdown content in Conan's responses, including bold text, links, and lists.
5. THE Chat_UI SHALL be responsive and usable on both desktop and mobile viewport sizes.
6. THE Chat_UI SHALL auto-scroll to the latest message when new content is received.
7. WHEN the message history is empty, THE Chat_UI SHALL display a welcome message or prompt indicating that the user can ask Conan about Tokyo travel planning.

### Requirement 8: Vercel Deployment Configuration

**User Story:** As a developer, I want the application configured for seamless Vercel deployment, so that I can deploy with minimal setup and the application runs reliably in production.

#### Acceptance Criteria

1. THE Web_App SHALL include a `next.config.js` (or `next.config.ts`) file with production-ready configuration for Vercel deployment.
2. THE Web_App SHALL use environment variables for the Anthropic API key, referenced as `ANTHROPIC_API_KEY`.
3. THE Web_App SHALL not hardcode any API keys or secrets in source code.
4. THE Web_App SHALL include a `package.json` with all required dependencies and standard Next.js build scripts (`dev`, `build`, `start`).
5. THE Chat_API_Route SHALL function within Vercel's serverless function execution limits.

### Requirement 9: Error Handling and Resilience

**User Story:** As a user, I want the chat interface to handle errors gracefully, so that I understand when something goes wrong and can continue my conversation.

#### Acceptance Criteria

1. IF the Chat_API_Route fails to reach the Claude_LLM, THEN THE Chat_UI SHALL display a user-friendly error message indicating the service is temporarily unavailable.
2. IF a network error occurs during a Streaming_Response, THEN THE Chat_UI SHALL inform the user that the response was interrupted and allow them to retry.
3. THE Chat_UI SHALL disable the send button and input field while a Streaming_Response is in progress to prevent duplicate submissions.
4. IF the user submits an empty message, THEN THE Chat_UI SHALL prevent the submission without sending a request to the Chat_API_Route.

### Requirement 10: Conan Persona and Behavior Integration

**User Story:** As a user, I want the web app version of Conan to behave identically to the defined Conan persona, so that I receive the same expert Tokyo travel guidance regardless of the interface.

#### Acceptance Criteria

1. THE System_Prompt SHALL include the complete Conan persona definition: an expert Tokyo travel agent specializing in detailed, neighborhood-by-neighborhood itineraries.
2. THE System_Prompt SHALL include all recommendation hierarchy rules: Master_List locations take priority over general knowledge, and exactly 3 external recommendations are provided when the Master_List has no matches.
3. THE System_Prompt SHALL include the display format requirements: every recommendation includes Google Maps photo link, navigation link, walk time from nearest station, Google rating, review summary, and place summary.
4. THE System_Prompt SHALL include the Master_List_Badge rule: display "**This is on Giang's Master List.**" for locations found in the Master_List.
5. THE System_Prompt SHALL instruct Conan to ask for trip duration when not specified and to organize itineraries by geographic proximity.
