var config = {};
config.http = {};

config.http.host_url = process.env.HTTP_HOST_URL || 'http://localhost';

// Prod vs. Dev config
if (process.env.NODE_ENV === "production") {
  config.indexPath = "static/index.prod.html";
  config.host = "nothingtoseehere.xyz";
  config.port = "3000";
  config.prod = true;
  config.dev = false;
}
else {
  config.indexPath = "static/index.html";
  config.host = "localhost:3000";
  config.port = "3001";
  config.assetsPort = "8090";
  config.prod = false;
  config.dev = true;
}

module.exports = config;
