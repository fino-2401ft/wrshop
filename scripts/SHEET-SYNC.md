# Đồng bộ tô màu Google Sheet theo trạng thái VPS

## Ý nghĩa màu

| Màu | Trạng thái trên web |
|-----|---------------------|
| Đỏ (`#f4c7c3`) | Đã bán (`SOLD`) |
| Vàng (`#ffe599`) | Đang góp (`RESERVED`) |
| Không tô | Đang bán / không khớp username |

Chỉ tô cột **Username** (cột C) của tab `gid=183243105`.

## Key đã tạo sẵn

```text
SHEET_SYNC_KEY=753e6b218c5fe809b8a4271092d64559baaccc26b0f277e5
```

Dùng cùng giá trị trên VPS `.env` và trong `CONFIG.SYNC_KEY` của Apps Script.

## 1. Apply backend trên VPS

Từ máy có SSH vào VPS (sau khi merge / pull repo `wrshop`):

```bash
cd /home/dev/wrshop
git fetch origin
git checkout cursor/sheet-status-sync-38d3   # hoặc main sau khi merge PR
bash scripts/backend-sheet-sync/apply-on-vps.sh /home/dev/wrshop_BE
```

Script sẽ copy API + hook vào `wrshop_BE`, ghi `SHEET_SYNC_KEY`, build và restart `wrshop-be`.

Kiểm tra:

```bash
curl -s -H "X-Sheet-Sync-Key: 753e6b218c5fe809b8a4271092d64559baaccc26b0f277e5" \
  https://furywr.com/api/integrations/sheet-statuses | head
```

Phải thấy JSON `{ "items": [ { "username": "...", "status": "SOLD"|"RESERVED" }, ... ] }`.

## 2. Dán Apps Script vào Google Sheet

1. Mở sheet Account thu → **Extensions** → **Apps Script**
2. Dán nội dung [google-sheet-status-sync.gs](./google-sheet-status-sync.gs)
3. `CONFIG.SYNC_KEY` đã khớp key ở trên; `API_BASE` = `https://furywr.com`
4. Save → chạy `setupTriggers` (cho phép quyền)
5. Menu **Đối chiếu VPS → Tô màu ngay** để sync lần đầu

## 3. Deploy Web App (realtime khi web đổi status)

1. Apps Script → **Deploy** → **New deployment** → **Web app**
2. Execute as: **Me**
3. Who has access: **Anyone**
4. Copy URL → trên VPS:

```bash
# trong /home/dev/wrshop_BE/.env
SHEET_APPS_SCRIPT_URL=https://script.google.com/macros/s/..../exec
sudo systemctl restart wrshop-be
```

Khi acc chuyển **đã bán** / **đang góp** (thanh toán QR, admin đổi status, tất toán…), API gọi Web App → script tô lại màu. Trigger 5 phút là lớp dự phòng.
