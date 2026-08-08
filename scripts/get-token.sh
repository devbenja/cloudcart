#!/usr/bin/env bash
# Obtiene un token de Keycloak y lo copia al portapapeles.
# Uso: ./scripts/get-token.sh [admin|customer]
#
# Ejemplo:
#   ./scripts/get-token.sh admin      # token de admin-user (admin123)
#   ./scripts/get-token.sh customer   # token de customer-user (customer123)

set -euo pipefail

ROLE="${1:-admin}"

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8180}"
REALM="cloudcart"
CLIENT_ID="cloudcart-backend"
CLIENT_SECRET="backend-secret-change-in-production"

if [[ "$ROLE" == "admin" ]]; then
  USERNAME="admin-user"
  PASSWORD="admin123"
elif [[ "$ROLE" == "customer" ]]; then
  USERNAME="customer-user"
  PASSWORD="customer123"
else
  echo "Rol inválido. Usa 'admin' o 'customer'." >&2
  exit 1
fi

TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=${USERNAME}" \
  -d "password=${PASSWORD}" \
  -d "grant_type=password" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('access_token',''))")

if [[ -z "$TOKEN" ]]; then
  echo "❌ No se pudo obtener el token. Revisá las credenciales y que Keycloak esté arriba." >&2
  exit 1
fi

# Copia al portapapeles (macOS)
echo -n "$TOKEN" | pbcopy

echo "✅ Token de '${USERNAME}' (${ROLE}) obtenido y COPIADO al portapapeles."
echo "   Pegalo en Swagger como:  Bearer <token>"
echo ""
echo "   (ya está en tu portapapeles, solo hacé Cmd+V donde lo necesites)"
