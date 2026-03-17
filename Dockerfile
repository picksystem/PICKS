# Build stage
FROM node:20.19.2-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.23.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20.19.2-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.23.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose ports
EXPOSE 3001 3002

# Run the application
CMD ["node", "dist/src/index.js"]
