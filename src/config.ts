type Config = {
  swaggerUrl: string;
  swaggerHost: string;
};

// const prod = process.env.NODE_ENV === 'production';
// const swaggerUrl = prod ? '/swagger.yaml' : 'http://' + window.location.hostname + ':3333';
// const swaggerHost = prod ? window.location.hostname + '/api/' : window.location.hostname + ':3333';

const swaggerUrl = "http://nothingtoseehere.xyz/swagger.yaml";
const swaggerHost = "http://nothingtoseehere.xyz/api";

const config: Config = {
  swaggerHost,
  swaggerUrl,
};
console.log("node_env ", process.env.NODE_ENV, "config: ", config);

export default config;
