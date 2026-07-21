const crypto = require('crypto');

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('Hex');
};

module.exports = {
  generateResetToken,
};
