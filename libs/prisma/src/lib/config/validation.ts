import { EnvironmentEnum } from '@nx-nestjs-prisma-template/shared';
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  ENVIRONMENT: Joi.string()
    .valid(
      EnvironmentEnum.Development,
      EnvironmentEnum.Production,
      EnvironmentEnum.Test,
    )

    .default(EnvironmentEnum.Development),
  LOG_PRISMA: Joi.boolean().default(true),
});
