FROM node:20.19.2-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --config=gateways/prisma/prisma.config.ts

# Expose port
EXPOSE 3001

# Start backend using ts-node with path alias support
ENV NODE_OPTIONS="--max-old-space-size=400"
CMD ["npx", "ts-node", "--transpile-only", "-r", "tsconfig-paths/register", "--project=tsconfig.app.json", "gateways/src/index.ts"]
