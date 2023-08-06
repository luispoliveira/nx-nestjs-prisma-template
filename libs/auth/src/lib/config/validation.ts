import * as Joi from 'joi';

export const validationSchema = Joi.object({
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_REFRESH_KEY: Joi.string().required(),
  JWT_IGNORE_EXPIRATION: Joi.boolean().default(false),
  JWT_EXPIRES_IN: Joi.string().default('1d').valid('60m', '1d', '7d', '30d'),
});
