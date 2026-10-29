import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AccountsController } from './accounts.controller';
import { AdminAccountsController } from './admin-accounts.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [IntegrationsModule],
  controllers: [AccountsController, AdminAccountsController, AdminCategoriesController],
  providers: [AccountsService],
})
export class AccountsModule {}
