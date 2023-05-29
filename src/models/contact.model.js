const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    starred: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contactSchema.plugin(toJSON);
contactSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The Contact's email
 * @param {ObjectId} [excludeContactId] - The id of the Contact to be excluded
 * @returns {Promise<boolean>}
 */
contactSchema.statics.isEmailTaken = async function (email, excludeContactId) {
  const contact = await this.findOne({ email, _id: { $ne: excludeContactId } });
  return !!contact;
};

contactSchema.index({ user: 1 });
contactSchema.index({ user: 1, starred: 1 });
contactSchema.index({ email: 1, unique: true });
contactSchema.index({ email: 1, _id: 1 });
/**
 * @typedef Contact
 */
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
