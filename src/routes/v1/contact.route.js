const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const contactValidation = require('../../validations/contact.validation');
const contactController = require('../../controllers/contact.controller');

const router = express.Router();

router
  .route('/')
  .get(auth(), validate(contactValidation.getContacts), contactController.getAllContactsForUser)
  .post(auth(), validate(contactValidation.createContact), contactController.createContact);

router
  .route('/:contactId')
  .get(auth(), validate(contactValidation.getContact), contactController.getContact)
  .patch(auth(), validate(contactValidation.updateContact), contactController.updateContact)
  .delete(auth(), validate(contactValidation.deleteContact), contactController.deleteContact);

router
  .route('/:contactId/star')
  .patch(auth(), validate(contactValidation.updateContactStar), contactController.updateContactStar);

module.exports = router;
