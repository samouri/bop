import { NowRequest, NowResponse } from '@now/node'
import fetch from 'portable-fetch'

const GCP_IP = String(process.env.GCP_IP)
function getRealUrl(path: string) {
  return `http://${GCP_IP}:3000${path}`
}

export default async (req: NowRequest, res: NowResponse) => {
  let resp: Response
  const url = getRealUrl(req.query.url as string)

  if (req.method === 'GET') {
    console.error('sending GET to: ', url)
    resp = fetch(url)
  } else {
    const { body, headers } = JSON.parse(req.body)
    console.error(`sending ${req.method} to: ${url} with body: ${JSON.stringify(body)}`)
    resp = fetch(url, { method: req.method, headers, body })
  }

  const text = await (await resp).text()
  // console.log(text)
  res.send(text)
}
