import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';

import { SettingService } from './shared/services/setting.service';
import { LoggerService } from './shared/services/logger.service';

const providers = [SettingService, LoggerService];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}
