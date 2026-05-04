'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { UIMessage } from '@ai-sdk/ui-utils';

interface Props {
  message: UIMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const textContent =
    message.parts
      .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
      .map((p) => p.text)
      .join('') || '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{textContent}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-a:text-blue-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {textContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
