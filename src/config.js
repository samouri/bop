var config = {};

const prod = process.env.NODE_ENV === 'production';
console.log(process.env.NODE_ENV);

if (prod) {
	// prod means in docker
	config.swaggerUrl = '/swagger.yaml';
} else {
	config.swaggerUrl = 'http://nothingtoseehere.xyz/swagger.yaml';
}

// either docker instance and localhost (hooking up local dockers ) OR
// specified with url params (npm start)
if (
	(prod && window.location.hostname === 'localhost') ||
	new URLSearchParams(window.location.search).has('swaggerHost')
) {
	config.swaggerHost = 'localhost://3333';
}

export default config;
