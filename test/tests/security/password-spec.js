var JSCheck, hash, verify, chai, expect, jsc;

JSCheck = require("../../jscheck/jscheck");

hash = require("../../../lib/security/hashing/hashing").hash;
verify = require("../../../lib/security/hashing/hashing").verify;

chai = require("chai");
expect = chai.expect;

jsc = JSCheck();

describe("Testing passwords", () => {
  it("100 random passwords follows the password rules", function(done) {
    function on_done(log) {
      try {
        expect(log.pass).to.eql(100);
        done();
      } catch (e) {
        done(e);
      }
    }

    jsc.claim(
      "Login",
      function predicate(verdict, a) {
        var hashed = hash(a);
        if (!hashed) return verdict(false);
        var verified = verify(a, hashed[0], hashed[1]);
        return verdict(verified);
      },
      [
        jsc.string(
          2,
          jsc.character("A", "Z"),
          1,
          jsc.wun_of(["!", "@", "#", "$", "%"]),
          2,
          jsc.character("1", "9"),
          5,
          jsc.character("a", "z"),
          1,
          jsc.wun_of(["!", "@", "#", "$", "%"])
        )
      ]
    );
    jsc.check({
      detail: 3,
      on_result: on_done
    });
  });
});
