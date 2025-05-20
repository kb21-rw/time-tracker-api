import { Module } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';
import { TimeLogsController } from './time-logs.controller';

@Module({
  controllers: [TimeLogsController],
  providers: [TimeLogsService],
})
export class TimeLogsModule {}
