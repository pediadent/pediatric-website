import { NextRequest, NextResponse } from 'next/server'
import { generateAIContent, AIProviderError } from '@/lib/ai-providers'
import { requireAdminAuth } from '@/lib/auth'

type Provider = 'openai' | 'anthropic' | 'gemini'

interface AIRequestBody {
  provider?: Provider
  apiKey?: string
  model?: string
  prompt?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

const REQUIRED_FIELDS: Array<keyof AIRequestBody> = [
  'provider',
  'apiKey',
  'model',
  'prompt'
]

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if ('response' in auth) {
    return auth.response
  }

  try {
    const body = (await request.json()) as AIRequestBody

    for (const field of REQUIRED_FIELDS) {
      if (!body[field] || typeof body[field] !== 'string') {
        return NextResponse.json(
          { error: `Missing or invalid ${field}` },
          { status: 400 }
        )
      }
    }

    const result = await generateAIContent({
      provider: body.provider as Provider,
      apiKey: body.apiKey as string,
      model: body.model as string,
      prompt: body.prompt as string,
      systemPrompt: body.systemPrompt,
      temperature: typeof body.temperature === 'number' ? body.temperature : undefined,
      maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : undefined
    })

    return NextResponse.json({
      text: result.text
    })
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 502 }
      )
    }

    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content with the selected provider.' },
      { status: 500 }
    )
  }
}
