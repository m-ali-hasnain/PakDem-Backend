require('dotenv').config();
const {SECRET_KEY} = process.env
var jwt = require('jsonwebtoken')

const generateToken = (RoleId) => {
  return jwt.sign({ RoleId }, SECRET_KEY, {
    expiresIn: '1d',
  })
}

module.exports = generateToken
