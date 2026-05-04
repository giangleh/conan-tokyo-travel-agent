'use client';

import { useState, type FormEvent } from 'react';

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
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
        className="flex-1 rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
