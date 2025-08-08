import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function IsDateNotInfFuture(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDateNotInfFuture',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Date) {
          if (!value) return true // skip if empty, let @IsNotEmpty will handle it to avoid redundant checks
          const date = value instanceof Date ? value : new Date(value)
          return date <= new Date()
        },
        defaultMessage() {
          return `Start time cannot be in the future`
        },
      },
    })
  }
}
