import { Configuration } from './generated'

const basePath = ''
const config: Configuration = new Configuration({
  basePath,
  fetchApi: (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    let proxiedInit: Object | undefined = undefined
    if (init?.method !== 'GET') {
      proxiedInit = { method: init?.method, body: JSON.stringify({ init }) }
    }

    return fetch(`/api/postgrest?url=${encodeURIComponent(input.toString())}`, proxiedInit)
  },
})

console.log('node_env ', process.env.NODE_ENV, 'config: ', config)

export default config
