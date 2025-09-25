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

# Expose the port the app runs on
EXPOSE 4321

# Start the development server with host binding for container access
CMD ["bun", "--bun", "astro", "dev", "--port", "4321", "--host", "0.0.0.0"]