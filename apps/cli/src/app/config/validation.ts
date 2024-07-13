import { EnvironmentEnum } from '@nx-nestjs-prisma-template/shared';
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  ENVIRONMENT: Joi.string()
    .valid(
      EnvironmentEnum.Development,
      EnvironmentEnum.Production,
      EnvironmentEnum.Test,
    )
    .default(EnvironmentEnum.Development),
});
