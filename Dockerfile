# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose the port the app runs on
EXPOSE 4321

# Set environment variables for the server
ENV PORT=4321
ENV HOST=0.0.0.0

# Start the production server
CMD ["bun", "dist/server/entry.mjs"]