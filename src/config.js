var config = {
	musicbrainzBase: 'https://musicbrainz.org/ws/2/',
};

const prod = process.env.NODE_ENV === 'production';

if (prod) {
	// prod means in docker
	config.swaggerUrl = '/swagger.yaml';
	config.swaggerHost = window.location.hostname;
} else {
	config.swaggerUrl = 'http://' + window.location.hostname + ':3333';
	config.swaggerHost = window.location.hostname + ':3333';
}

console.log(process.env.NODE_ENV, 'config: ', config);

export default config;
