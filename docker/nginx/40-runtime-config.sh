#!/bin/sh
set -eu

json_escape() {
  printf '%s' "${1:-}" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

write_entry() {
  key="$1"
  value="$2"
  printf '  %s: "%s",\n' "$key" "$(json_escape "$value")"
}

CONFIG_PATH="/usr/share/nginx/html/config.js"

{
  echo 'window.__APP_CONFIG__ = {'
  write_entry 'VITE_API_BASE_URL' "${VITE_API_BASE_URL:-/api/v1}"
  write_entry 'VITE_API_URL' "${VITE_API_URL:-/api/v1}"
  write_entry 'VITE_API_TIMEOUT_MS' "${VITE_API_TIMEOUT_MS:-30000}"
  write_entry 'VITE_AI_CHATBOT_ENABLED' "${VITE_AI_CHATBOT_ENABLED:-true}"
  write_entry 'VITE_BACKEND_HOST' "${VITE_BACKEND_HOST:-backend}"
  write_entry 'VITE_BACKEND_PORT' "${VITE_BACKEND_PORT:-8080}"
  write_entry 'VITE_CLOUDINARY_CLOUD_NAME' "${VITE_CLOUDINARY_CLOUD_NAME:-}"
  write_entry 'VITE_CLOUDINARY_UPLOAD_PRESET' "${VITE_CLOUDINARY_UPLOAD_PRESET:-}"
  write_entry 'VITE_DATA_SOURCE' "${VITE_DATA_SOURCE:-api}"
  write_entry 'VITE_GOOGLE_CLIENT_ID' "${VITE_GOOGLE_CLIENT_ID:-}"
  write_entry 'VITE_GOONG_API_KEY' "${VITE_GOONG_API_KEY:-}"
  write_entry 'VITE_GOONG_MAPTILES_KEY' "${VITE_GOONG_MAPTILES_KEY:-}"
  write_entry 'VITE_ORDERS_API' "${VITE_ORDERS_API:-false}"
  write_entry 'VITE_WS_URL' "${VITE_WS_URL:-}"
  echo '};'
} > "$CONFIG_PATH"
