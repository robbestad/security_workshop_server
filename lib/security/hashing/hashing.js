var crypto, SALT_LENGTH, iterations, validPass;

crypto = require("crypto");
validPass = require("../password/password_validation");
SALT_LENGTH = 256;
iterations = process.env.ENV == "test" ? 100 : 1e5;

function hash(pass) {
  if (!validPass(pass)) return void 0;
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto.pbkdf2Sync(
    pass.toString(),
    salt,
    iterations,
    64,
    "sha512"
  );
  return [salt, hash];
}
function verify(pass, salt, storedHashBuffer) {
  if (!storedHashBuffer) return void 0;
  if (!pass || pass.length < 3) return void 0;
  const retrievedHashBuffer = crypto.pbkdf2Sync(
    pass.toString(),
    salt,
    iterations,
    64,
    "sha512"
  );
  return crypto.timingSafeEqual(storedHashBuffer, retrievedHashBuffer);
}

module.exports = { hash, verify };
