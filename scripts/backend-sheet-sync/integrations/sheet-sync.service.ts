import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export type SheetAccountStatus = 'SOLD' | 'RESERVED';

@Injectable()
export class SheetSyncService {
  private readonly logger = new Logger(SheetSyncService.name);
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  syncKey() {
    return this.config.get<string>('SHEET_SYNC_KEY')?.trim() || '';
  }

  appsScriptUrl() {
    return this.config.get<string>('SHEET_APPS_SCRIPT_URL')?.trim() || '';
  }

  keyMatches(raw: string | undefined) {
    const expected = this.syncKey();
    if (!expected || !raw) return false;
    return expected === raw.trim();
  }

  async listStatuses() {
    const rows = await this.prisma.account.findMany({
      where: {
        status: { in: ['SOLD', 'RESERVED'] },
        gameUser: { not: '' },
      },
      select: { gameUser: true, status: true },
      orderBy: { updatedAt: 'desc' },
    });

    const byUser = new Map<string, { username: string; status: SheetAccountStatus }>();
    for (const row of rows) {
      const username = row.gameUser.trim();
      if (!username) continue;
      const key = username.toLowerCase();
      const status = row.status as SheetAccountStatus;
      const prev = byUser.get(key);
      if (!prev || (prev.status === 'RESERVED' && status === 'SOLD')) {
        byUser.set(key, { username, status });
      }
    }

    return { items: [...byUser.values()] };
  }

  /** Debounced notify so burst updates only hit Apps Script once. */
  scheduleNotify(reason: string) {
    if (!this.appsScriptUrl()) {
      this.logger.debug(`Bỏ qua sheet sync (${reason}): chưa cấu hình SHEET_APPS_SCRIPT_URL`);
      return;
    }
    if (this.notifyTimer) clearTimeout(this.notifyTimer);
    this.notifyTimer = setTimeout(() => {
      this.notifyTimer = null;
      void this.notifyAppsScript(reason);
    }, 1500);
  }

  async notifyAppsScript(reason: string) {
    const url = this.appsScriptUrl();
    if (!url) return;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          key: this.syncKey(),
          reason,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        this.logger.warn(`Sheet sync thất bại (${reason}): HTTP ${res.status} ${text.slice(0, 200)}`);
        return;
      }
      this.logger.log(`Đã gọi sheet sync (${reason})`);
    } catch (error) {
      this.logger.warn(
        `Sheet sync lỗi mạng (${reason}): ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }
}
