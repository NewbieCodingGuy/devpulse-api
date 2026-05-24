# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # install ALL dependencies including devDeps
COPY . .
RUN npm run build             # compile TypeScript to dist/

# Stage 2 — Production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev         # install ONLY production dependencies
COPY --from=builder /app/dist ./dist  
EXPOSE 3000
CMD ["node", "dist/server.js"]