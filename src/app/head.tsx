import { createElement, Fragment } from 'react'
import type { ReactNode } from 'react'
import type { AnyNode, Element } from 'domhandler'
import { load } from 'cheerio'
import { prisma } from '@/lib/prisma'

const ATTRIBUTE_MAP: Record<string, string> = {
  class: 'className',
  crossorigin: 'crossOrigin',
  'http-equiv': 'httpEquiv',
  rel: 'rel',
  charset: 'charSet',
  href: 'href'
}

const BOOLEAN_ATTRIBUTES = new Set(['async', 'defer'])

type AttributeRecord = Record<string, string>

const normalizeAttributes = (attributes: AttributeRecord | undefined) => {
  const result: Record<string, string | boolean> = {}

  if (!attributes) {
    return result
  }

  for (const [rawKey, rawValue] of Object.entries(attributes)) {
    const key = ATTRIBUTE_MAP[rawKey] ?? rawKey
    if (BOOLEAN_ATTRIBUTES.has(key) && rawValue === '') {
      result[key] = true
    } else if (rawValue !== undefined) {
      result[key] = rawValue
    }
  }

  return result
}

const renderNode = (
  node: AnyNode,
  key: string,
  $: ReturnType<typeof load>
): ReactNode => {
  if (node.type === 'text') {
    const text = node.data ?? ''
    return text.trim() ? text : null
  }

  if (node.type === 'comment' || node.type === 'directive') {
    return null
  }

  if (node.type === 'tag') {
    const element = node as Element
    const attributes = normalizeAttributes(element.attribs)
    const childrenHtml = $(element).html() ?? ''

    if (childrenHtml) {
      return createElement(element.name, {
        ...attributes,
        key,
        dangerouslySetInnerHTML: { __html: childrenHtml }
      })
    }

    return createElement(element.name, {
      ...attributes,
      key
    })
  }

  return null
}

const renderSnippetHtml = (html: string, keyPrefix: string) => {
  const wrapped = `<root>${html}</root>`
  const $ = load(wrapped, null, false)
  const nodes: ReactNode[] = []

  $('root')
    .contents()
    .each((index, node) => {
      const rendered = renderNode(node, `${keyPrefix}-${index}`, $)
      if (rendered !== null) {
        nodes.push(rendered)
      }
    })

  return nodes
}

export default async function Head() {
  const snippets = await prisma.analyticsSnippet.findMany({
    where: { isEnabled: true },
    orderBy: { createdAt: 'asc' }
  })

  if (!snippets.length) {
    return null
  }

  const rendered = snippets.flatMap((snippet) =>
    renderSnippetHtml(snippet.code, snippet.id)
  )

  return <Fragment>{rendered}</Fragment>
}
