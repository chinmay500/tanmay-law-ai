// app/api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

// Initialize the Google Generative AI instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define the expected request body type
interface RequestBody {
    messages: {
        role: 'user' | 'assistant';
        content: string;
    }[];
}

export async function POST(req: NextRequest) {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'Gemini API key is not configured' }),
                { status: 500 }
            );
        }

        // Parse request body
        const body: RequestBody = await req.json();

        // Validate request body
        if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid request body' }),
                { status: 400 }
            );
        }

        // Get the user's message (last message in the array)
        const userMessage = body.messages[body.messages.length - 1];

        // Define system prompt for Indian law context
        const INDIAN_LAW_PROMPT = `You are an AI assistant specializing in Indian law. Your responses should:
1. Focus exclusively on Indian legal system, laws, and regulations
2. Provide general information and explanations about Indian law
3. Always mention that your responses are for informational purposes only and not legal advice
4. Recommend consulting with a qualified legal professional for specific legal situations
5. Stay updated to constitutional amendments and supreme court judgments up to 2024
6. If a question is not related to Indian law, politely redirect the conversation to Indian legal topics
7. Use simple, clear language while explaining legal concepts
8. When citing laws, mention specific sections and acts
9. If unsure about any information, clearly state that
10. Never give specific legal advice about personal cases
If the question is not related to Indian law, respond with: "I specialize in Indian law. Please ask me questions related to Indian legal system, laws, and regulations."`;

        // Initialize the model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Start a chat with system prompt
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: INDIAN_LAW_PROMPT }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand my role and boundaries as an Indian law assistant. I will proceed according to these guidelines.' }]
                },
                ...body.messages.slice(0, -1).map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                })),
            ],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            },
        });

        // Generate a response
        const result = await chat.sendMessage(userMessage.content);
        const response = await result.response;
        const text = response.text();

        // Return the response
        return new Response(
            JSON.stringify({
                role: 'assistant',
                content: text,
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error in chat API:', error);
        return new Response(
            JSON.stringify({
                error: 'An error occurred while processing your request',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            { status: 500 }
        );
    }
}