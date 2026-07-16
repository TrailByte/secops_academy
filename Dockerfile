# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# connect-pg-simple resolves table.sql relative to __dirname which after bundling is dist/
RUN cp node_modules/connect-pg-simple/table.sql dist/table.sql


# Stage 2: Production
FROM node:20-slim AS production

# Python + pip for Piper TTS + wget for voice download
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 python3-pip wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install piper-tts
RUN pip3 install piper-tts --break-system-packages

# Download voice models at build time — baked into the image
# droidghost (android-security): hfc_male-medium
# quarantine_blob (malware-analysis): ryan-medium
RUN mkdir -p /voices && \
    wget -q -P /voices \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx" \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx.json" \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx" \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json"

ENV PIPER_VOICES_DIR=/voices

WORKDIR /app

# Install all deps (drizzle-kit + tsx are devDeps but needed at runtime for migrations/seeds)
COPY package*.json ./
RUN npm ci

# Copy built app + runtime files
COPY --from=builder /app/dist            ./dist
COPY --from=builder /app/client/public   ./client/public
COPY --from=builder /app/shared          ./shared
COPY --from=builder /app/server          ./server
COPY --from=builder /app/script          ./script
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json   ./

# Uploads persist via Docker volume
RUN mkdir -p /app/client/public/files/challenges

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["/docker-entrypoint.sh"]