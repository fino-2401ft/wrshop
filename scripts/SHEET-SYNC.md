# Đồng bộ tô màu Google Sheet theo trạng thái VPS

## Ý nghĩa màu

| Màu | Trạng thái trên web |
|-----|---------------------|
| Đỏ (`#f4c7c3`) | Đã bán (`SOLD`) |
| Vàng (`#ffe599`) | Đang góp (`RESERVED`) |
| Không tô | Đang bán / không khớp username |

Chỉ tô cột **Username** (cột C) của tab `gid=183243105`.

## 1. Cấu hình VPS (backend)

Trong `/home/dev/wrshop_BE/.env`:

```env
SHEET_SYNC_KEY=doi-chuoi-bi-mat-dai
SHEET_APPS_SCRIPT_URL=
```

(URL Apps Script điền ở bước 3.)

Restart API sau khi sửa `.env`.

## 2. Dán Apps Script vào Google Sheet

1. Mở sheet Account thu → **Extensions** → **Apps Script**
2. Dán nội dung [google-sheet-status-sync.gs](./google-sheet-status-sync.gs)
3. Sửa `CONFIG`:
   - `API_BASE`: `https://furywr.com`
   - `SYNC_KEY`: trùng `SHEET_SYNC_KEY` trên VPS
   - `SHEET_GID`: `183243105` (nếu đúng tab ĐANG BÁN)
4. Save → chạy hàm `setupTriggers` (cho phép quyền khi Google hỏi)
5. Menu sheet **Đối chiếu VPS → Tô màu ngay** để sync lần đầu

## 3. Deploy Web App (để web gọi realtime)

1. Apps Script → **Deploy** → **New deployment** → type **Web app**
2. Execute as: **Me**
3. Who has access: **Anyone**
4. Copy Web App URL → ghi vào VPS:

```env
SHEET_APPS_SCRIPT_URL=https://script.google.com/macros/s/..../exec
```

5. `sudo systemctl restart wrshop-be`

Khi acc chuyển **đã bán** / **đang góp** trên web, API gọi Web App → script kéo status và tô lại màu. Trigger 5 phút là lớp dự phòng.
