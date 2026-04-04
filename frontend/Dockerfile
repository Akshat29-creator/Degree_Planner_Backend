# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time args for NEXT_PUBLIC_* variables (baked in during npm run build)
ARG NEXT_PUBLIC_VAPI_WEB_TOKEN
ARG NEXT_PUBLIC_VAPI_WORKFLOW_ID
ARG NEXT_PUBLIC_API_URL=/api/backend
ENV NEXT_PUBLIC_VAPI_WEB_TOKEN=$NEXT_PUBLIC_VAPI_WEB_TOKEN
ENV NEXT_PUBLIC_VAPI_WORKFLOW_ID=$NEXT_PUBLIC_VAPI_WORKFLOW_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
