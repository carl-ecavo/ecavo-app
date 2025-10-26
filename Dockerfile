# Stage 1: The Builder Stage - used to install dependencies
FROM node:20 as builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
# Use the full Node image's shell to run npm install
RUN npm install 

# Stage 2: The Final Stage - based on the secure, minimal Distroless image
FROM gcr.io/distroless/nodejs20
WORKDIR /app

# Copy necessary files from the builder stage
# Copy installed dependencies
COPY --from=builder /app/node_modules ./node_modules
# Copy application code
COPY server.js .

# The CMD instruction to run the app
# No shell is needed here, as 'node' is the entrypoint
CMD ["/app/server.js"]
