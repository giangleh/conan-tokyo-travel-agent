'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { UIMessage } from '@ai-sdk/ui-utils';
import { PlaceCard, parsePlaceCards } from './PlaceCard';

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

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg p-3 bg-blue-600 text-white">
          <p className="whitespace-pre-wrap">{textContent}</p>
        </div>
      </div>
    );
  }

  // Parse assistant messages for place cards
  const parts = parsePlaceCards(textContent);
  const hasCards = parts.some((p) => p.type === 'place');

  if (!hasCards) {
    // No place cards — render as regular Markdown
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-900">
          <div className="prose prose-sm max-w-none prose-a:text-blue-600">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {children}
                  </a>
                ),
              }}
            >
              {textContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Has place cards — render mixed content
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-lg p-3 bg-gray-100 text-gray-900">
        <div className="space-y-3">
          {parts.map((part, i) => {
            if (part.type === 'text') {
              return (
                <div key={i} className="prose prose-sm max-w-none prose-a:text-blue-600">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {part.content}
                  </ReactMarkdown>
                </div>
              );
            }
            return <PlaceCard key={i} place={part.data} />;
          })}
        </div>
      </div>
    </div>
  );
}
