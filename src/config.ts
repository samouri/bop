import { Configuration } from './generated'

const prod = process.env.NODE_ENV === 'production'
const basePath = prod ? window.location.hostname + '/api/' : window.location.hostname + ':3333'

// const swaggerUrl = 'http://nothingtoseehere.xyz/swagger.yaml'
// const swaggerHost = 'http://nothingtoseehere.xyz/api'

const config: Configuration = new Configuration({ basePath })
console.log('node_env ', process.env.NODE_ENV, 'config: ', config)

export default config
