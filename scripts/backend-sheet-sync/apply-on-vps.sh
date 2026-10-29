#!/bin/bash
set -euo pipefail
# Chạy trên VPS từ thư mục chứa các file patch (hoặc sau khi git pull wrshop).
ROOT="${1:-/home/dev/wrshop_BE}"
PATCH_DIR="$(cd "$(dirname "$0")" && pwd)"
KEY='753e6b218c5fe809b8a4271092d64559baaccc26b0f277e5'
APPS_URL='https://script.google.com/macros/s/AKfycbzlekWyWUDzW5zuUBVdLp13lyNZ4iitm6p4IR6JRase0XZN07LbzId8UCPYRcgAZue8Bg/exec'

mkdir -p "$ROOT/src/integrations"
cp "$PATCH_DIR/integrations/"*.ts "$ROOT/src/integrations/"
cp "$PATCH_DIR/app.module.ts" "$ROOT/src/app.module.ts"
cp "$PATCH_DIR/accounts.module.ts" "$ROOT/src/accounts/accounts.module.ts"
cp "$PATCH_DIR/accounts.service.ts" "$ROOT/src/accounts/accounts.service.ts"
cp "$PATCH_DIR/payments.module.ts" "$ROOT/src/payments/payments.module.ts"
cp "$PATCH_DIR/payments.service.ts" "$ROOT/src/payments/payments.service.ts"
cp "$PATCH_DIR/orders.module.ts" "$ROOT/src/orders/orders.module.ts"
cp "$PATCH_DIR/admin-orders.controller.ts" "$ROOT/src/orders/admin-orders.controller.ts"

cd "$ROOT"
if ! grep -q '^SHEET_SYNC_KEY=' .env 2>/dev/null; then
  printf '\nSHEET_SYNC_KEY=%s\nSHEET_APPS_SCRIPT_URL=%s\n' "$KEY" "$APPS_URL" >> .env
else
  sed -i "s|^SHEET_SYNC_KEY=.*|SHEET_SYNC_KEY=$KEY|" .env
  if grep -q '^SHEET_APPS_SCRIPT_URL=' .env; then
    sed -i "s|^SHEET_APPS_SCRIPT_URL=.*|SHEET_APPS_SCRIPT_URL=$APPS_URL|" .env
  else
    echo "SHEET_APPS_SCRIPT_URL=$APPS_URL" >> .env
  fi
fi

npm ci
npm run build
sudo -n /usr/bin/systemctl restart wrshop-be || {
  MAIN=$(systemctl show -p MainPID --value wrshop-be)
  kill -TERM "$MAIN" || true
  sleep 2
}
systemctl is-active wrshop-be
curl -s -o /dev/null -w 'api:%{http_code}\n' -H "X-Sheet-Sync-Key: $KEY" http://127.0.0.1:3000/api/integrations/sheet-statuses
echo APPLY_OK
