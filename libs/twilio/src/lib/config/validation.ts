import * as Joi from 'joi';

export const validationSchema = Joi.object({
  HAS_TWILIO: Joi.boolean().required(),
  TWILIO_ACCOUNT_SID: Joi.alternatives().conditional('HAS_TWILIO', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
  TWILIO_AUTH_TOKEN: Joi.alternatives().conditional('HAS_TWILIO', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
  TWILIO_PHONE_NUMBER: Joi.alternatives().conditional('HAS_TWILIO', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''),
  }),
});
