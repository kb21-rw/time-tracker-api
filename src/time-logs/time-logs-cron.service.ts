import { Injectable } from "@nestjs/common";
import { TimeLogsService } from "./time-logs.service";
import { Cron } from "@nestjs/schedule";
import { Repository } from "typeorm";
import { TimeLog } from "./entities/time-log.entity";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class TimeLogsCronService {
    constructor(
        @InjectRepository(TimeLog)
        private readonly timeLogsRepository: Repository<TimeLog>
    ) {}

   @Cron('0 0 * * *') 
   async handleAutoStopTimer(){
    const now = new Date();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    
    const activeTimeLogs = await this.timeLogsRepository.find({
      where: {
        endTime: null,
      },
    })

    for(const timer of activeTimeLogs) {
        timer.endTime = new Date(yesterday);
        if(timer.startTime < yesterday){
          timer.autoStopped = true;
          await this.timeLogsRepository.save(timer);
        }
    }
    
   }
}