var chai, expect, hash, verify;

chai = require("chai");
expect = chai.expect;
hash = require("../../../lib/security/hashing/hashing").hash;
verify = require("../../../lib/security/hashing/hashing").verify;

describe("Hash & Verify", function() {
  it("disallows hash input less than three chars", done => {
    expect(hash("a")).to.equals(undefined);
    expect(hash("ab")).to.equals(undefined);
    done();
  });
  it("allows hash input three chars", done => {
    expect(hash("o65!8al3@WzB0")).to.be.instanceOf(Array);
    done();
  });
  it("disallows verify input less than three chars", done => {
    var output = hash("o65!8al3@WzB0");
    expect(verify("a", output[0], output[1])).to.be.undefined;
    expect(verify("ab", output[0], output[1])).to.be.undefined;
    done();
  });
  it("verifies input three chars", done => {
    var output = hash("o65!8al3@WzB0");
    expect(verify("o65!8al3@WzB0", output[0], output[1])).to.be.true;
    done();
  });
});
