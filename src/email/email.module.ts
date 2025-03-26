import { Module } from '@nestjs/common'
import { EmailService } from './email.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          process.env.JWT_VERIFICATION_TOKEN_SECRET ||
          'verificationTokenSecret',
        signOptions: {
          expiresIn: `${configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME') || '900'}s`,
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
