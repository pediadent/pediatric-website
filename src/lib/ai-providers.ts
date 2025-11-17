type AIProvider = 'openai' | 'anthropic' | 'gemini'

interface AIRequestOptions {
  provider: AIProvider
  apiKey: string
  model: string
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

interface AIResponsePayload {
  text: string
  raw?: unknown
}

class AIProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'AIProviderError'
  }
}

const DEFAULT_TEMPERATURE = 0.5
const DEFAULT_MAX_TOKENS = 1024

const buildSystemPrompt = (systemPrompt?: string) =>
  systemPrompt?.trim() ||
  'You are an assistant that generates clean, concise SEO metadata and image descriptions. Avoid exaggerated language and keep outputs professional.'

const sanitizeText = (text: string) => text.replace(/\s+/g, ' ').trim()

async function callOpenAI(options: AIRequestOptions): Promise<AIResponsePayload> {
  const { apiKey, model, prompt, systemPrompt, temperature, maxTokens } = options

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
      messages: [
        { role: 'system', content: buildSystemPrompt(systemPrompt) },
        { role: 'user', content: prompt }
      ]
    })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new AIProviderError(
      errorBody?.error?.message || 'OpenAI request failed',
      response.status
    )
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new AIProviderError('OpenAI response did not include completion text')
  }

  return {
    text: sanitizeText(content),
    raw: data
  }
}

async function callAnthropic(options: AIRequestOptions): Promise<AIResponsePayload> {
  const { apiKey, model, prompt, systemPrompt, temperature, maxTokens } = options

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: temperature ?? DEFAULT_TEMPERATURE,
      system: buildSystemPrompt(systemPrompt),
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new AIProviderError(
      errorBody?.error?.message || 'Anthropic request failed',
      response.status
    )
  }

  const data = await response.json()
  const content =
    data?.content
      ?.map((item: { text?: string } | undefined) => item?.text ?? '')
      .join(' ')
      .trim() || ''

  if (!content) {
    throw new AIProviderError('Anthropic response did not include completion text')
  }

  return {
    text: sanitizeText(content),
    raw: data
  }
}

async function callGemini(options: AIRequestOptions): Promise<AIResponsePayload> {
  const { apiKey, model, prompt, systemPrompt, temperature, maxTokens } = options

  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  )
  url.searchParams.set('key', apiKey)

  const contents = [
    {
      parts: [{ text: buildSystemPrompt(systemPrompt) }],
      role: 'user'
    },
    {
      parts: [{ text: prompt }],
      role: 'user'
    }
  ]

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: temperature ?? DEFAULT_TEMPERATURE,
        maxOutputTokens: maxTokens ?? DEFAULT_MAX_TOKENS
      }
    })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new AIProviderError(
      errorBody?.error?.message || 'Gemini request failed',
      response.status
    )
  }

  const data = await response.json()
  const parts = data?.candidates?.[0]?.content?.parts as Array<{ text?: string }> | undefined
  const content =
    parts?.map((part) => part?.text ?? '').join(' ').trim() || ''

  if (!content) {
    throw new AIProviderError('Gemini response did not include completion text')
  }

  return {
    text: sanitizeText(content),
    raw: data
  }
}

export async function generateAIContent(
  options: AIRequestOptions
): Promise<AIResponsePayload> {
  switch (options.provider) {
    case 'openai':
      return callOpenAI(options)
    case 'anthropic':
      return callAnthropic(options)
    case 'gemini':
      return callGemini(options)
    default:
      throw new AIProviderError(`Unsupported provider: ${options.provider}`)
  }
}

export { AIProviderError }
