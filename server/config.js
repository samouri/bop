var config = {};
config.mongodb = {};
config.http = {};

config.http.cookie_secret = process.env.HTTP_COOKIE_SECRET || 'YeukhPqijei86QWt3TBwhfjNe';
config.http.enforce_ssl = process.env.HTTP_ENFORCE_SSL;
config.http.host_url = process.env.HTTP_HOST_URL || 'http://localhost';

config.pathToMongoDb = 'mongodb://localhost/test';
config.mongodb.host = process.env.MONGODB_HOST || '127.0.0.1';
config.mongodb.port = process.env.MONGODB_PORT || 27017;
config.mongodb.user = process.env.MONGODB_USERNAME || '';
config.mongodb.password = process.env.MONGODB_PASSWORD || '';
config.mongodb.database = process.env.MONGODB_DATABASE || 'test';


// Prod vs. Dev config
if (process.env.NODE_ENV === "production") {
  config.indexPath = "index.prod.html";
  config.host = "nothingtoseehere.xyz";
  config.port = "3000";
  config.assetsPort = "8091"
  config.prod = true;
  config.dev = false;
}
else {
  config.indexPath = "index.html";
  config.host = "192.168.0.2:3001";
  config.port = "3001";
  config.assetsPort = "8090";
  config.prod = false;
  config.dev = true;
}

module.exports = config;
