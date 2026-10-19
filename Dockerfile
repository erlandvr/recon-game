FROM nginxinc/nginx-unprivileged:stable-bookworm

WORKDIR /usr/share/nginx/html

COPY build/ .
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 8080
ENTRYPOINT [ "nginx", "-g", "daemon off;"]
