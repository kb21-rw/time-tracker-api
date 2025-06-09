import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function IsNotBeforeStartTime(
  startTimeField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isNotBeforeStartTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(endTime: unknown, args: ValidationArguments) {
          const startTime = (args.object as any)[startTimeField]
          if (!endTime || !startTime) return true 
            return (endTime as Date) > (startTime as Date)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be after start time`
        },
      },
    })
  }
}
