import * as Joi from 'joi';

export const validationSchema = Joi.object({
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_REFRESH_KEY: Joi.string().required(),
  JWT_IGNORE_EXPIRATION: Joi.boolean().default(false),
  JWT_EXPIRES_IN: Joi.string().default('1d').valid('60m', '1d', '7d', '30d'),

  HAS_GOOGLE_AUTH: Joi.boolean().default(false),
  GOOGLE_CLIENT_ID: Joi.alternatives().conditional('HAS_GOOGLE_AUTH', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
  GOOGLE_CLIENT_SECRET: Joi.alternatives().conditional('HAS_GOOGLE_AUTH', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
  GOOGLE_CALLBACK_URL: Joi.alternatives().conditional('HAS_GOOGLE_AUTH', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),

  HAS_FACEBOOK_AUTH: Joi.boolean().default(false),
  FACEBOOK_APP_ID: Joi.alternatives().conditional('HAS_FACEBOOK_AUTH', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
  FACEBOOK_APP_SECRET: Joi.alternatives().conditional('HAS_FACEBOOK_AUTH', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
  FACEBOOK_CALLBACK_URL: Joi.alternatives().conditional('HAS_FACEBOOK_AUTH', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),

  FRONTEND_URL: Joi.alternatives().conditional('HAS_GOOGLE_AUTH', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
});
