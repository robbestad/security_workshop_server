// Min 1 number
// Min 2 special
// Min 1 uppercase
function validPass(pass) {
  if (!pass || pass.length < 3) return false;
  if (
    !pass.match(
      /^(?=(?:.*[\d]){1,})(?=(?:.*[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]){2,})(?=(?:.*[A-Z]){1,})(?:[^\x00-\x1F\x7F]){8,255}$/
    )
  ) {
    return false;
  }

  return true;
}
module.exports = validPass;
