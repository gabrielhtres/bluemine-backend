import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Model } from 'sequelize-typescript';

export type ExistsInDatabaseValidationOptions = {
  model: typeof Model<any, any>;
  column?: string;
};

@ValidatorConstraint({ name: 'existsInDatabase', async: true })
@Injectable()
export class ExistsInDatabaseConstraint implements ValidatorConstraintInterface {
  constructor(private readonly sequelize: Sequelize) {}

  async validate(value: any, args: ValidationArguments) {
    if (!value) {
      return false;
    }

    const options = args.constraints[0] as ExistsInDatabaseValidationOptions;
    const model = options.model;
    const column = options.column || 'id';

    try {
      const record = await this.sequelize.model(model.name).findOne({
        where: { [column]: value },
      });
      return !!record;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const options = args.constraints[0] as ExistsInDatabaseValidationOptions;
    const modelName = options.model.name;
    const value = args.value;
    return `O ${modelName} com o ID '${value}' não foi encontrado.`;
  }
}

export function ExistsInDatabase(
  options: ExistsInDatabaseValidationOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: ExistsInDatabaseConstraint,
    });
  };
}
