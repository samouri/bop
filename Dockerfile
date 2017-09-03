# Before running this run "npm run build"
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY ./build /usr/share/nginx/html
