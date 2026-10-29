# Chạy trên laptop (có Tailscale) — ghi Apps Script URL vào VPS .env rồi restart API.
$ErrorActionPreference = 'Stop'
$key = '753e6b218c5fe809b8a4271092d64559baaccc26b0f277e5'
$url = 'https://script.google.com/macros/s/AKfycbzlekWyWUDzW5zuUBVdLp13lyNZ4iitm6p4IR6JRase0XZN07LbzId8UCPYRcgAZue8Bg/exec'

$remote = @"
set -euo pipefail
cd /home/dev/wrshop_BE
KEY='$key'
URL='$url'
if grep -q '^SHEET_SYNC_KEY=' .env; then sed -i "s|^SHEET_SYNC_KEY=.*|SHEET_SYNC_KEY=`$KEY|" .env; else printf '\nSHEET_SYNC_KEY=%s\n' "`$KEY" >> .env; fi
if grep -q '^SHEET_APPS_SCRIPT_URL=' .env; then sed -i "s|^SHEET_APPS_SCRIPT_URL=.*|SHEET_APPS_SCRIPT_URL=`$URL|" .env; else printf 'SHEET_APPS_SCRIPT_URL=%s\n' "`$URL" >> .env; fi
sudo -n /usr/bin/systemctl restart wrshop-be || { MAIN=`$(systemctl show -p MainPID --value wrshop-be); kill -TERM "`$MAIN"; sleep 2; }
sleep 2
systemctl is-active wrshop-be
grep -E '^(SHEET_SYNC_KEY|SHEET_APPS_SCRIPT_URL)=' .env | sed 's/=.*/=***/'
curl -s -o /dev/null -w 'api:%{http_code}\n' -H "X-Sheet-Sync-Key: `$KEY" http://127.0.0.1:3000/api/integrations/sheet-statuses
echo DONE
"@

ssh -o BatchMode=yes -o ConnectTimeout=20 "dev@100.103.147.75" $remote
