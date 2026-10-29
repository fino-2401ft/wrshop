/**
 * Đồng bộ tô màu Username (cột C) trên sheet Account thu theo trạng thái VPS.
 * - SOLD (đã bán)     → đỏ
 * - RESERVED (đang góp) → vàng
 * - Còn lại / không khớp → xóa nền
 *
 * CÀI ĐẶT:
 * 1. Mở Google Sheet → Extensions → Apps Script
 * 2. Dán toàn bộ file này, sửa CONFIG bên dưới
 * 3. Chạy setupTriggers() một lần (Run)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL Web App vào VPS .env: SHEET_APPS_SCRIPT_URL=...
 * 6. SHEET_SYNC_KEY trên VPS phải trùng CONFIG.SYNC_KEY
 */

var CONFIG = {
  // API shop (qua Cloudflare / domain public)
  API_BASE: 'https://furywr.com',
  // Phải trùng SHEET_SYNC_KEY trên VPS
  SYNC_KEY: '753e6b218c5fe809b8a4271092d64559baaccc26b0f277e5',
  // gid tab ĐANG BÁN (từ URL #gid=...)
  SHEET_GID: 183243105,
  // Cột Username (A=1, B=2, C=3)
  USERNAME_COL: 3,
  // Hàng bắt đầu dữ liệu (header "STT,Account ID,Username..." thường ở hàng 4)
  HEADER_ROW: 4,
  COLOR_SOLD: '#f4c7c3',
  COLOR_RESERVED: '#ffe599',
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Đối chiếu VPS')
    .addItem('Tô màu ngay', 'syncColorsFromVps')
    .addItem('Cài trigger 5 phút', 'setupTriggers')
    .addToUi();
}

function setupTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncColorsFromVps') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('syncColorsFromVps').timeBased().everyMinutes(5).create();
  SpreadsheetApp.getActive().toast('Đã cài trigger mỗi 5 phút', 'Sheet sync', 5);
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    if (CONFIG.SYNC_KEY && body.key && body.key !== CONFIG.SYNC_KEY) {
      return jsonOut({ ok: false, error: 'unauthorized' });
    }
    var result = syncColorsFromVps();
    return jsonOut({ ok: true, result: result, reason: body.reason || '' });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, service: 'wrshop-sheet-sync' });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function syncColorsFromVps() {
  var statusMap = fetchStatusMap_();
  var sheet = sheetByGid_(CONFIG.SHEET_GID);
  if (!sheet) throw new Error('Không tìm thấy sheet gid=' + CONFIG.SHEET_GID);

  var lastRow = sheet.getLastRow();
  if (lastRow <= CONFIG.HEADER_ROW) {
    return { updated: 0, sold: 0, reserved: 0, cleared: 0 };
  }

  var startRow = CONFIG.HEADER_ROW + 1;
  var numRows = lastRow - CONFIG.HEADER_ROW;
  var range = sheet.getRange(startRow, CONFIG.USERNAME_COL, numRows, 1);
  var values = range.getValues();
  var backgrounds = range.getBackgrounds();

  var sold = 0;
  var reserved = 0;
  var cleared = 0;
  var updated = 0;

  for (var i = 0; i < values.length; i++) {
    var username = String(values[i][0] || '').trim();
    if (!username) {
      if (backgrounds[i][0] !== '#ffffff' && backgrounds[i][0] !== 'white') {
        backgrounds[i][0] = null;
        cleared++;
        updated++;
      }
      continue;
    }
    var status = statusMap[username.toLowerCase()] || '';
    var next = null;
    if (status === 'SOLD') {
      next = CONFIG.COLOR_SOLD;
      sold++;
    } else if (status === 'RESERVED') {
      next = CONFIG.COLOR_RESERVED;
      reserved++;
    } else {
      next = null;
      cleared++;
    }
    var cur = String(backgrounds[i][0] || '').toLowerCase();
    var want = next ? next.toLowerCase() : '';
    var curEmpty = !cur || cur === '#ffffff' || cur === 'white' || cur === '#fff';
    if ((!want && !curEmpty) || (want && cur !== want)) {
      backgrounds[i][0] = next;
      updated++;
    } else if (want) {
      backgrounds[i][0] = next;
    }
  }

  range.setBackgrounds(backgrounds);
  try {
    SpreadsheetApp.getActive().toast(
      'Sold ' + sold + ' | Góp ' + reserved + ' | Xóa tô ' + cleared,
      'Sheet sync',
      5,
    );
  } catch (ignore) {}
  return { updated: updated, sold: sold, reserved: reserved, cleared: cleared };
}

function fetchStatusMap_() {
  var url = CONFIG.API_BASE.replace(/\/$/, '') + '/api/integrations/sheet-statuses';
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { 'X-Sheet-Sync-Key': CONFIG.SYNC_KEY },
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  var text = res.getContentText();
  if (code !== 200) {
    throw new Error('API HTTP ' + code + ': ' + text.slice(0, 300));
  }
  var data = JSON.parse(text);
  var map = {};
  var items = (data && data.items) || [];
  for (var i = 0; i < items.length; i++) {
    var u = String(items[i].username || '').trim();
    var s = String(items[i].status || '').trim().toUpperCase();
    if (!u) continue;
    if (s !== 'SOLD' && s !== 'RESERVED') continue;
    var key = u.toLowerCase();
    if (!map[key] || (map[key] === 'RESERVED' && s === 'SOLD')) {
      map[key] = s;
    }
  }
  return map;
}

function sheetByGid_(gid) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (String(sheets[i].getSheetId()) === String(gid)) return sheets[i];
  }
  // fallback: sheet đang active
  return ss.getActiveSheet();
}
