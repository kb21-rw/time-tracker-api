# Time Tracker API

A NestJS-based API for tracking time spent on projects. This API provides endpoints for user management, authentication, and time tracking functionality.

## Description

This project is built with NestJS, a progressive Node.js framework for building efficient and scalable server-side applications. It implements a RESTful API with proper validation, authentication, and documentation.

## Project setup

```bash
$ npm install
```

## Environment Setup

1. Create a `.env` file in the root directory based on the example below:

```
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=time_tracker
DB_SSL_MODE=disable

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

2. Make sure you have PostgreSQL installed and running with the appropriate credentials.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

## Key Packages

- **NestJS (@nestjs/\*)**: Core framework and modules for building the application.
- **TypeORM**: Object-Relational Mapping library for database interactions.
- **Passport & JWT**: Authentication middleware supporting various strategies.
- **class-validator & class-transformer**: Data validation and transformation.
- **bcrypt**: Password hashing for secure storage.
- **Swagger**: API documentation through OpenAPI specification.
- **nodemailer**: Email functionality for notifications and verification.

## Project Structure

- **auth/**: Authentication related components (login, JWT, strategies)
- **users/**: User management and profile operations

## Development

- The project uses TypeScript for type safety.
- Validation is handled through NestJS Pipes and class-validator.
- API documentation is auto-generated with Swagger.
