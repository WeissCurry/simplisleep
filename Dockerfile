FROM node:24-slim

WORKDIR /app

# Enable corepack for pnpm support
RUN corepack enable

# Copy repository files (excluding paths defined in .dockerignore)
COPY . .

# Install dependencies for api and its dependencies (shared)
RUN pnpm install --frozen-lockfile --filter api...

# Build shared package first, then api
RUN pnpm --filter shared build && pnpm --filter api build

# Ensure persistent volume mount directory exists
RUN mkdir -p /data

# Default production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3100
ENV DB_PATH=/data/simplisleep.db

EXPOSE 3100

CMD ["node", "apps/api/dist/index.js"]
