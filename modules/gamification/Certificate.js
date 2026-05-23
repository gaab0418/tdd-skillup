const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const crypto = require('crypto');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  certificateCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'certificates',
  hooks: {
    beforeValidate: (certificate) => {
      if (!certificate.certificateCode) {
        certificate.certificateCode = `SKILL-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      }
    },
  },
});

module.exports = Certificate;

