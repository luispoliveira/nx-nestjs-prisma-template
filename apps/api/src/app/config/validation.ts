import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  HAS_SENTRY: Joi.boolean().default(false),
  SENTRY_DSN: Joi.alternatives().conditional('HAS_SENTRY', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
  SENTRY_AUTH_TOKEN: Joi.alternatives().conditional('HAS_SENTRY', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
});
