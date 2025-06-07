import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function IsNotBeforeStartTime(
  startTimeField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNotBeforeStartTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(endTime: any, args: ValidationArguments) {
          const startTime = (args.object as any)[startTimeField]
          if (!endTime || !startTime) return true 
          return new Date(endTime) > new Date(startTime)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be after start time`
        },
      },
    })
  }
}
