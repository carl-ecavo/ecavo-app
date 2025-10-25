FROM gcr.io/distroless/nodejs20
WORKDIR /app
COPY server.js .
CMD ["server.js"]
