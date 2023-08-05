import * as Joi from 'joi';

export const validationSchema = Joi.object({
  ADMIN_USERNAME: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().required(),
  ADMIN_EMAIL: Joi.string().email().required(),
});
