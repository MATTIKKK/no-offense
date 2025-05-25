import { API_URL } from "../config";

export async function rephraseMessage(message: string): Promise<string> {
  const response = await fetch(`${API_URL}/ai/rephrase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  return data.rephrased || message;
}