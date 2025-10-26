# New Dockerfile (AFTER)
FROM gcr.io/distroless/nodejs20
WORKDIR /app

# NEW: Copy package.json and install dependencies
COPY package*.json ./
RUN npm install 

COPY server.js .
CMD ["server.js"]
