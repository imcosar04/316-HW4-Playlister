require('dotenv').config();

const vendor = (process.env.DB_VENDOR || 'mongo').toLowerCase();
let impl;

if (['postgres', 'postgresql', 'pg'].includes(vendor)) {
  impl = require('./postgresql');   // exports a ready instance
} else {
  impl = require('./mongodb');      // default
}

module.exports = impl;
