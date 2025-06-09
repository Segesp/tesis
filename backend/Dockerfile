# Dockerfile para el servicio backend

# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar dependencias de producción y desarrollo
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Copiar código fuente y compilar TypeScript
COPY src ./src
RUN npm run build

# Stage 2: runtime
FROM node:18-alpine AS runner
WORKDIR /app

# Ejecutar en modo producción
ENV NODE_ENV=production

# Crear usuario no-root y usarlo
RUN addgroup -S app && adduser -S app -G app app

# Copiar solo dependencias de producción
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Copiar código transpiled
COPY --from=builder /app/dist ./dist

# Cambiar a usuario no-root y exponer puerto
USER app
EXPOSE 4000

# Comando de arranque
CMD ["node", "dist/main.js"]
