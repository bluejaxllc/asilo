import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

/**
 * Core utility for the BlueJax AI Engine.
 * Uses Google Gemini (gemini-2.5-flash) via Vercel AI SDK.
 */
export async function generateBlueJaxResponse(
    prompt: string,
    systemContext?: string
): Promise<string> {
    try {
        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            system: systemContext || 'Eres BlueJax, un asistente de IA experto para un sistema de gestión de residencias de ancianos (asilos). Tu objetivo es proporcionar información clara, profesional y clínica.',
            prompt: prompt,
        });

        return text;
    } catch (error) {
        console.error('Error generating BlueJax AI response:', error);
        throw new Error('Fallo al generar respuesta de BlueJax AI');
    }
}
