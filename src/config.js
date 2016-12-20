var config = {};

const prod = process.env.NODE_ENV === 'production';
console.log( process.env.NODE_ENV )

if ( prod ) {
  // prod means in docker
  config.swaggerUrl = "/swagger.yaml";
} else {
  config.swaggerUrl = 'http://nothingtoseehere.xyz/swagger.yaml';
}

if ( prod && window.location.hostname === 'localhost' ) {
  config.swaggerHost = 'localhost:5000';
}

export default config;
