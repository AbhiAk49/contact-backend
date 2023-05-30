const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createContact = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    name: Joi.string().required(),
    starred: Joi.bool().default(false),
  }),
};

const getContacts = {
  query: Joi.object().keys({
    starred: Joi.string(),
  }),
};

const getContact = {
  params: Joi.object().keys({
    contactId: Joi.string().custom(objectId),
  }),
};

const updateContact = {
  params: Joi.object().keys({
    contactId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().required(),
      name: Joi.string().required(),
      starred: Joi.bool().default(false),
    })
    .min(1),
};

const updateContactStar = {
  params: Joi.object().keys({
    contactId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      starred: Joi.bool().default(false),
    })
    .min(1),
};

const deleteContact = {
  params: Joi.object().keys({
    contactId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  updateContactStar,
};
