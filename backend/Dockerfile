# -----------------------------
# Builder Stage
# -----------------------------
FROM node:22 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY server.js ./

# -----------------------------
# Runner Stage
# -----------------------------
FROM node:22 AS runner

# Set working directory
WORKDIR /app

# Create a non-root user
RUN adduser --system --uid 1001 expressjs

# Copy files from builder
COPY --from=builder /app/server.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set the user
USER expressjs

# Expose port
EXPOSE 3000

# Command to run the server
CMD ["node", "server.js"]
