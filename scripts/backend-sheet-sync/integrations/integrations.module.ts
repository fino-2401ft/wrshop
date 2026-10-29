import { Module } from '@nestjs/common';
import { SheetSyncController } from './sheet-sync.controller';
import { SheetSyncService } from './sheet-sync.service';

@Module({
  controllers: [SheetSyncController],
  providers: [SheetSyncService],
  exports: [SheetSyncService],
})
export class IntegrationsModule {}
