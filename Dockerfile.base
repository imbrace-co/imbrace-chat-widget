FROM node:20-alpine As builder

ENV PORT=3000

ADD ./ /chat-widget

WORKDIR /chat-widget

RUN yarn install

RUN yarn build-release-base

FROM nginx:alpine

COPY ./.nginx/nginx.base.conf /etc/nginx/nginx.conf

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /chat-widget/build /usr/share/nginx/html

# Copy environment script
COPY generate-env-json.sh /

# Make the script executable
RUN chmod +x /generate-env-json.sh

EXPOSE 3000

# Use the script to generate env.json and start nginx
ENTRYPOINT ["/generate-env-json.sh"]