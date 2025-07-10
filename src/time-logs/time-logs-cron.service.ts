import { Injectable } from "@nestjs/common";
import { TimeLogsService } from "./time-logs.service";
import { Cron } from "@nestjs/schedule";
import { Repository } from "typeorm";
import { TimeLog } from "./entities/time-log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DateTime } from "luxon";


@Injectable()
export class TimeLogsCronService {
    constructor(
        @InjectRepository(TimeLog)
        private readonly timeLogsRepository: Repository<TimeLog>
    ) {}

   @Cron('0 0 * * *') 
   async handleAutoStopTimer(){
    
    const activeTimeLogs = await this.timeLogsRepository.find({
      where: {
        endTime: null,
      },
      relations: ['user']
    })

    for(const timer of activeTimeLogs) {
      const userTimeZone = timer.user.timeZone
      const nowInUserTz = DateTime.now().setZone(userTimeZone) ;
      const yesterday = nowInUserTz.minus({ days: 1 }).set({ hour: 23, minute: 59, second: 59 });
        
      if (nowInUserTz > yesterday && timer.startTime < yesterday.toJSDate()) {
        timer.endTime = yesterday.toJSDate()
        timer.autoStoppedAt = new Date() 
        await this.timeLogsRepository.save(timer)
      }
    }
    
   }
}