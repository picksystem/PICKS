FROM node:20.19.2-alpine

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --config=gateways/prisma/prisma.config.ts

# Expose port
EXPOSE 3001

# Use tsx (esbuild-powered) instead of ts-node — ~10x faster startup, no recompilation overhead
# Handles tsconfig path aliases natively
ENV NODE_OPTIONS="--max-old-space-size=512 --dns-result-order=ipv4first"
CMD ["npx", "tsx", "--tsconfig", "tsconfig.app.json", "gateways/src/index.ts"]
