import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function IsNotInFuture(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotInFuture',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true // skip if empty, let @IsNotEmpty will handle it to avoid redundant checks
          const date = value instanceof Date ? value : new Date(value)
          return date <= new Date()
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} cannot be in the future`
        },
      },
    })
  }
}
