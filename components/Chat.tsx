'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { WelcomeMessage } from './WelcomeMessage';
import { TypingIndicator } from './TypingIndicator';

export function Chat() {
  const { messages, append, status, error } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  const isStreaming = status === 'streaming';
  const isSubmitted = status === 'submitted';
  const isBusy = isStreaming || isSubmitted;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = (text: string) => {
    append({ role: 'user', content: text });
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="p-4 border-b text-center shrink-0">
        <h1 className="text-xl font-semibold">Conan — Tokyo Travel Agent</h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && <WelcomeMessage />}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isBusy && <TypingIndicator />}
      </div>

      {error && (
        <div className="p-3 mx-4 mb-2 bg-red-50 text-red-700 rounded shrink-0">
          Something went wrong. Please try again.
        </div>
      )}

      <div className="shrink-0">
        <ChatInput onSend={handleSend} disabled={isBusy} />
      </div>
    </div>
  );
}
