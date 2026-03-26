const KEY = 'vip_events'

async function upstash(method, path, body) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('Upstash not configured')
  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'text/plain' } : {}),
    },
    ...(body !== undefined ? { body } : {}),
  })
  return res.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const data = await upstash('GET', `/get/${KEY}`)
      return res.json(data.result ? JSON.parse(data.result) : [])
    }

    if (req.method === 'POST') {
      const value = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      await upstash('POST', `/set/${KEY}`, value)
      return res.json({ ok: true })
    }

    res.status(405).end()
  } catch (err) {
    res.status(503).json({ error: err.message })
  }
}
