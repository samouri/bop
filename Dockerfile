# Before running this run "npm run build"
FROM nginx
COPY ./build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
