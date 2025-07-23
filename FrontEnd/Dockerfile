FROM nginx:alpine

RUN mkdir -p /usr/share/nginx/html/static

COPY index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
COPY static/* /usr/share/nginx/html/static/

RUN chown -R nginx:nginx /usr/share/nginx/html