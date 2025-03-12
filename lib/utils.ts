import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function callEmilioAPI(systemPrompt: string, userMessage: string) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDB8wlZQv_atQaRWy-SWdeyJfezEI3Bt-U",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }, { text: userMessage }],
            },
          ],
        }),
      },
    )

    const data = await response.json()

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text
    }

    return "I'm sorry, I couldn't generate a response at this time."
  } catch (error) {
    console.error("Error calling Emilio LLM API:", error)
    return "I'm sorry, I encountered an error while processing your request. Please try again later."
  }
}

