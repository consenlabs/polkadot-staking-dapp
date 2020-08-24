FROM node:12.12.0-alpine as builder

RUN apk add git jq --no-cache --update && \
    rm -rf /var/cache/apk/*

RUN mkdir /app && npm i -g yarn
WORKDIR /app

COPY package.json /app/
RUN npm i -g yarn && yarn
COPY ./ /app/
RUN npm run build


FROM nginx
COPY nginx.conf /etc/nginx/

RUN mkdir -p /var/www/html/kusama

COPY --from=builder /app/build /var/www/html/kusama
COPY --from=builder /app/build /var/www/html
