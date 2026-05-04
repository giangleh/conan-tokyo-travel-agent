import { streamText, convertToCoreMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { buildSystemPrompt } from '@/lib/system-prompt';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = buildSystemPrompt();

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'The travel agent service is temporarily unavailable. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
