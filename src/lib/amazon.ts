import crypto from 'crypto'

type AmazonEnvironment = {
  accessKey: string
  secretKey: string
  partnerTag: string
  marketplace: string
  host: string
  region: string
}

export type AmazonItemSummary = {
  asin: string
  title?: string
  detailPageUrl?: string
  imageUrl?: string
  price?: {
    display: string
    amount: number
    currency: string
  }
  rating?: number
  totalReviews?: number
}

const getAmazonEnvironment = (): AmazonEnvironment | null => {
  const accessKey = process.env.AMAZON_PA_ACCESS_KEY
  const secretKey = process.env.AMAZON_PA_SECRET_KEY
  const partnerTag = process.env.AMAZON_ASSOCIATE_TAG

  if (!accessKey || !secretKey || !partnerTag) {
    return null
  }

  return {
    accessKey,
    secretKey,
    partnerTag,
    marketplace: process.env.AMAZON_MARKETPLACE ?? 'www.amazon.com',
    host: process.env.AMAZON_PA_ENDPOINT ?? 'webservices.amazon.com',
    region: process.env.AMAZON_PA_REGION ?? 'us-east-1'
  }
}

const hash = (value: string): string =>
  crypto.createHash('sha256').update(value, 'utf8').digest('hex')

const hmac = (key: crypto.BinaryLike, value: string): Buffer =>
  crypto.createHmac('sha256', key).update(value, 'utf8').digest()

const buildSignature = ({
  payload,
  host,
  region,
  accessKey,
  secretKey
}: {
  payload: string
  host: string
  region: string
  accessKey: string
  secretKey: string
}) => {
  const method = 'POST'
  const service = 'ProductAdvertisingAPI'
  const canonicalUri = '/paapi5/getitems'
  const canonicalQueryString = ''
  const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'

  const isoDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const amzDate = isoDate.replace(/[:-]/g, '')
  const dateStamp = amzDate.slice(0, 8)

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=UTF-8\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`

  const signedHeaders =
    'content-encoding;content-type;host;x-amz-date;x-amz-target'
  const payloadHash = hash(payload)

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n')

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hash(canonicalRequest)
  ].join('\n')

  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${secretKey}`, dateStamp), region), service),
    'aws4_request'
  )

  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(stringToSign, 'utf8')
    .digest('hex')

  const authorizationHeader = [
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ')

  return {
    amzDate,
    authorizationHeader,
    target
  }
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

type CacheEntry =
  | {
      expiresAt: number
      value: AmazonItemSummary | null
    }
  | undefined

const AMAZON_CACHE_TTL_MS = 1000 * 60 * 30
const AMAZON_NULL_CACHE_TTL_MS = 1000 * 60 * 5
const amazonItemCache = new Map<string, CacheEntry>()

const getCachedItem = (asin: string): AmazonItemSummary | null | undefined => {
  const entry = amazonItemCache.get(asin)
  if (!entry) return undefined
  if (entry.expiresAt <= Date.now()) {
    amazonItemCache.delete(asin)
    return undefined
  }
  return entry.value ?? null
}

const setCachedItem = (
  asin: string,
  value: AmazonItemSummary | null,
  ttl: number = AMAZON_CACHE_TTL_MS
) => {
  amazonItemCache.set(asin, {
    value,
    expiresAt: Date.now() + ttl
  })
}

export const getAmazonItems = async (
  asins: string[]
): Promise<Record<string, AmazonItemSummary>> => {
  const env = getAmazonEnvironment()

  if (!env) {
    return {}
  }

  const uniqueAsins = Array.from(new Set(asins.map((asin) => asin.trim()))).filter(
    (asin) => asin.length > 0
  )

  if (uniqueAsins.length === 0) {
    return {}
  }

  const results: Record<string, AmazonItemSummary> = {}
  const uncached: string[] = []

  for (const asin of uniqueAsins) {
    const cached = getCachedItem(asin)
    if (cached === undefined) {
      uncached.push(asin)
    } else if (cached) {
      results[asin] = cached
    }
  }

  if (uncached.length === 0) {
    return results
  }

  for (const group of chunk(uncached, 10)) {
    const payload = JSON.stringify({
      Marketplace: env.marketplace,
      PartnerTag: env.partnerTag,
      PartnerType: 'Associates',
      ItemIds: group,
      Resources: [
        'Images.Primary.Large',
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.IsPrimeEligible',
        'Offers.Summaries.LowestPrice',
        'BrowseNodeInfo.BrowseNodes',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating'
      ]
    })

    const { amzDate, authorizationHeader, target } = buildSignature({
      payload,
      host: env.host,
      region: env.region,
      accessKey: env.accessKey,
      secretKey: env.secretKey
    })

    try {
      const response = await fetch(`https://${env.host}/paapi5/getitems`, {
        method: 'POST',
        headers: {
          'Content-Encoding': 'amz-1.0',
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Amz-Date': amzDate,
          'X-Amz-Target': target,
          Authorization: authorizationHeader,
          Host: env.host,
          'User-Agent':
            process.env.AMAZON_PA_USER_AGENT ??
            'PediatricDirectory/1.0 (Language=JavaScript; Platform=Node.js)'
        },
        body: payload,
        cache: 'no-store'
      })

      if (!response.ok) {
        console.warn(
          `Amazon PA-API request failed with status ${response.status}`
        )
        if (response.status === 429) {
          for (const asin of group) {
            setCachedItem(asin, null, AMAZON_NULL_CACHE_TTL_MS)
          }
          await new Promise((resolve) => setTimeout(resolve, 1200))
        }
        continue
      }

      const data = (await response.json()) as {
        ItemsResult?: {
          Items?: Array<{
            ASIN?: string
            DetailPageURL?: string
            Images?: {
              Primary?: {
                Medium?: { URL?: string }
                Large?: { URL?: string }
              }
            }
            ItemInfo?: {
              Title?: { DisplayValue?: string }
            }
            Offers?: {
              Listings?: Array<{
                Price?: {
                  DisplayAmount?: string
                  Amount?: number
                  Currency?: string
                }
              }>
            }
            CustomerReviews?: {
              StarRating?: { DisplayValue?: number }
              Count?: number
            }
          }>
        }
      }

      const items = data.ItemsResult?.Items ?? []

      for (const item of items) {
        if (!item?.ASIN) continue

        const listing = item.Offers?.Listings?.[0]

        results[item.ASIN] = {
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue,
          detailPageUrl: item.DetailPageURL,
          imageUrl:
            item.Images?.Primary?.Large?.URL ??
            item.Images?.Primary?.Medium?.URL ??
            undefined,
          price: listing?.Price?.DisplayAmount
            ? {
                display: listing.Price.DisplayAmount,
                amount: listing.Price.Amount ?? 0,
                currency: listing.Price.Currency ?? ''
              }
            : undefined,
          rating: item.CustomerReviews?.StarRating?.DisplayValue ?? undefined,
          totalReviews: item.CustomerReviews?.Count ?? undefined
        }

        setCachedItem(item.ASIN, results[item.ASIN])
      }

      for (const asin of group) {
        if (!results[asin]) {
          setCachedItem(asin, null, AMAZON_NULL_CACHE_TTL_MS)
        }
      }
    } catch (error) {
      console.warn('Failed to fetch Amazon PA-API data', error)
      for (const asin of group) {
        setCachedItem(asin, null, AMAZON_NULL_CACHE_TTL_MS)
      }
    }
  }

  return results
}

export const extractAmazonAsin = (url: string): string | null => {
  try {
    const asinMatch =
      url.match(/(?:dp|gp\/product|o\/ASIN|product)\/([A-Z0-9]{10})/i) ??
      url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/i)
    if (asinMatch?.[1]) {
      return asinMatch[1].toUpperCase()
    }
  } catch (error) {
    console.warn('Failed to extract ASIN from URL', error)
  }
  return null
}

export const resolveAmazonLink = async (
  url: string
): Promise<{ asin: string | null; finalUrl: string }> => {
  const directAsin = extractAmazonAsin(url)
  if (directAsin) {
    return { asin: directAsin, finalUrl: url }
  }

  try {
    const parsed = new URL(url)
    if (!parsed.hostname.toLowerCase().endsWith('amzn.to')) {
      return { asin: null, finalUrl: url }
    }
  } catch {
    return { asin: null, finalUrl: url }
  }

  const attemptResolve = async (options: RequestInit) => {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        cache: 'no-store',
        ...options
      })
      if (response.ok) {
        const finalUrl = response.url ?? url
        return {
          asin: extractAmazonAsin(finalUrl),
          finalUrl
        }
      }
    } catch (error) {
      console.warn('Failed to resolve Amazon short link', error)
    }
    return { asin: null, finalUrl: url }
  }

  const headResult = await attemptResolve({ method: 'HEAD' })
  if (headResult.asin) {
    return headResult
  }

  return attemptResolve({ method: 'GET' })
}
