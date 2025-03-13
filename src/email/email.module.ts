import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ 
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET || 'verificationTokenSecret',
      signOptions: { 
        expiresIn: '15m' 
      },
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
