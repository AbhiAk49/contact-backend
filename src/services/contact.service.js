const httpStatus = require('http-status');
const { Contact } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a contact
 * @param {Object} contactBody
 * @returns {Promise<Contact>}
 */
const createContact = async (contactBody) => {
  if (await Contact.isEmailTaken(contactBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Contact.create(contactBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryContacts = async (filter, options) => {
  const contacts = await Contact.paginate(filter, options);
  return contacts;
};

/**
 * Get contact by id
 * @param {ObjectId} contactId
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const getContactById = async (contactId, userId) => {
  return Contact.findOne({ _id: contactId, created_by: userId });
};

const getAllContactsForUser = async (userId, starredOnly = false) => {
  const $match = { created_by: userId };
  if (starredOnly) {
    $match['starred'] = true;
  }
  const contacts = await Contact.find($match).sort({ starred: -1 });
  return contacts;
};

/**
 * Update contact by id
 * @param {ObjectId} contactId
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Contact>}
 */
const updateContactById = async (contactId, userId, updateBody) => {
  const contact = await getContactById(contactId, userId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
  }
  if (updateBody.email && (await Contact.isEmailTaken(updateBody.email, contactId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(contact, updateBody);
  await contact.save();
  return contact;
};

/**
 * Delete contact by id
 * @param {ObjectId} contactId
 * @param {ObjectId} userId
 * @returns {Promise<Contact>}
 */
const deleteContactById = async (contactId, userId) => {
  const contact = await getContactById(contactId, userId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await contact.remove();
  return contact;
};

/**
 * Update Star contact by id
 * @param {ObjectId} contactId
 * @param {ObjectId} userId
 * @param {Boolean} starred
 * @returns {Promise<Contact>}
 */
const updateStarContactById = async (contactId, userId, starred = false) => {
  const contact = await getContactById(contactId, userId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  contact.starred = starred;
  await contact.save();
  return contact;
};

module.exports = {
  createContact,
  queryContacts,
  getContactById,
  getAllContactsForUser,
  updateContactById,
  deleteContactById,
  updateStarContactById,
};
