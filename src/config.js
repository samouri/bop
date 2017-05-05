var config = {
	musicbrainzBase: 'https://musicbrainz.org/ws/2/',
};

const prod = process.env.NODE_ENV === 'production';
console.log(process.env.NODE_ENV);

if (prod) {
	// prod means in docker
	config.swaggerUrl = '/swagger.yaml';
} else {
	config.swaggerUrl = 'http://' + window.location.hostname + ':3333';
	config.swaggerHost = window.location.hostname + ':3333';
	console.error(config.swaggerUrl);
}

// // either docker instance and localhost (hooking up local dockers ) OR
// // specified with url params (npm start)
// if (
// 	(prod && window.location.hostname === 'localhost') ||
// 	new URLSearchParams(window.location.search).has('swaggerHost')
// ) {
// 	config.swaggerHost = 'localhost:3333';
// }

export default config;
