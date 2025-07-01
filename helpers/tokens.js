const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  if (user.isAdmin === undefined) {
    throw new Error("createToken passed user without isAdmin property");
  }

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
