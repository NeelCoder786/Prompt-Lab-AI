import { generateText } from 'ai'
import { NextResponse } from 'next/server'

const availableModels = new Set([
  'google/gemini-2.5-flash',
  'google/gemini-3-flash',
  'alibaba/qwen-3-32b',
])

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Enter a prompt to generate a response.' }, { status: 400 })
    }

    const { prompt, model, temperature } = body as {
      prompt?: unknown
      model?: unknown
      temperature?: unknown
    }

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000) {
      return NextResponse.json({ error: 'Prompt must be between 1 and 8,000 characters.' }, { status: 400 })
    }
    if (typeof model !== 'string' || !availableModels.has(model)) {
      return NextResponse.json({ error: 'Choose an available model.' }, { status: 400 })
    }

    const chosenTemperature = typeof temperature === 'number' && Number.isFinite(temperature)
      ? Math.max(0, Math.min(1, temperature))
      : 0.7

    const { text } = await generateText({
      model,
      prompt: prompt.trim(),
      temperature: chosenTemperature,
      maxOutputTokens: 1600,
      abortSignal: request.signal,
    })

    return NextResponse.json({ text })
  } catch (cause) {
    if (cause instanceof Error && /credit card on file/i.test(cause.message)) {
      return NextResponse.json(
        {
          error: 'AI Gateway needs a valid credit card on file before it can run models.',
          setupUrl: 'https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card',
        },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'AI generation is temporarily unavailable. Please retry in a moment.' },
      { status: 502 },
    )
  }
}
