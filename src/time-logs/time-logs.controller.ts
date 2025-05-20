import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';

@Controller('time-logs')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}
}
