import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { SheetSyncService } from './sheet-sync.service';

@Controller('api/integrations')
export class SheetSyncController {
  constructor(private readonly sheetSync: SheetSyncService) {}

  @Get('sheet-statuses')
  async sheetStatuses(@Headers('x-sheet-sync-key') key: string | undefined) {
    if (!this.sheetSync.keyMatches(key)) {
      throw new UnauthorizedException('Sheet sync key không hợp lệ');
    }
    return this.sheetSync.listStatuses();
  }
}
