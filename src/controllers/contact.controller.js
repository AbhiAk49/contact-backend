const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { contactService } = require('../services');

const createContact = catchAsync(async (req, res) => {
  const contact = await contactService.createContact({ ...req.body, created_by: req.user._id });
  res.status(httpStatus.CREATED).send(contact);
});

const getContacts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await contactService.queryContacts(filter, options);
  res.send(result);
});

const getAllContactsForUser = catchAsync(async (req, res) => {
  let { starred } = req.query;
  starred = starred === 'true';
  const contacts = await contactService.getAllContactsForUser(req.user.id, starred);
  res.send(contacts);
});

const getContact = catchAsync(async (req, res) => {
  const contact = await contactService.getContactById(req.params.contactId, req.user._id);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
  }
  res.send(contact);
});

const updateContact = catchAsync(async (req, res) => {
  const contact = await contactService.updateContactById(req.params.contactId, req.user._id, {
    ...req.body,
    created_by: req.user._id,
  });
  res.send(contact);
});

const deleteContact = catchAsync(async (req, res) => {
  const contact = await contactService.deleteContactById(req.params.contactId, req.user._id);
  res.send(contact);
});

const updateContactStar = catchAsync(async (req, res) => {
  const { starred } = req.body;
  const contact = await contactService.updateStarContactById(req.params.contactId, req.user._id, starred);
  res.send(contact);
});

module.exports = {
  createContact,
  getContacts,
  getAllContactsForUser,
  getContact,
  updateContact,
  deleteContact,
  updateContactStar,
};
