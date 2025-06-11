import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function IsNotBeforeStartTime(
  startTimeField: string,
  validationOptions?: ValidationOptions,
) {
  return function (targetObject: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotBeforeStartTime',
      target: targetObject.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(endTime: Date, validationargs: ValidationArguments) {
          const startTime: Date = validationargs.object[startTimeField]
          if (!endTime || !startTime) return true
          return endTime > startTime
        },
        defaultMessage() {
          return `End time must be after start time`
        },
      },
    })
  }
}
