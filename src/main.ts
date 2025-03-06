import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true, //Rejects requests that have extra properties
      transform: true, //Automatically converts request data into the correct type (DTO class instance)
      whitelist: true, //Removes properties that do not have decorators
    }),
  )
  const options = new DocumentBuilder()
    .setTitle('Time Tracking API')
    .setDescription('This is a simple API for tracking time spent on projects.')
    .addBearerAuth()
    .setBasePath('api/v1')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(3000)
}
bootstrap()
