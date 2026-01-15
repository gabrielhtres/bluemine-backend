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

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const options = args.constraints[0] as ExistsInDatabaseValidationOptions;
    const model = options.model;
    const column = options.column || 'id';

    try {
      const modelCtor = this.sequelize.model(model.name) as {
        findOne: (opts: { where: Record<string, unknown> }) => Promise<unknown>;
      };

      const where: Record<string, unknown> = { [column]: value };
      const record = await modelCtor.findOne({
        where,
      });
      return !!record;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const options = args.constraints[0] as ExistsInDatabaseValidationOptions;
    const modelName = options.model.name;
    return `O ${modelName} com o ID '${String(args.value)}' não foi encontrado.`;
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
