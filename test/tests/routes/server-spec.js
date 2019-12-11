var chai, expect, app, chaiHttp, agent, Cookies, request;

request = require("supertest");
chai = require("chai");
expect = chai.expect;
app = require("../../../bin/server");

describe("Array", function() {
  after(() => {
    app.stop();
  });

  it("welcomes user to the api", done => {
    request(app)
      .get("/api/v1")
      .end((err, res) => {
        expect(res.status).to.eql(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals(
          "Velkommen til Sven Anders sitt API"
        );
        done();
      });
  });
  it("creates a user", done => {
    request(app)
      .post("/api/v1/user/create")
      .send({ username: "jens", password: "$a&bc12Pl3" })
      .end((err, res) => {
        expect(res.status).to.eql(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals("jens created");
        done();
      });
  });
  it("logs in a user", done => {
    request(app)
      .post("/api/v1/user/login")
      .send({ username: "jens", password: "$a&bc12Pl3" })
      .end((err, res) => {
        Cookies = res.header["set-cookie"];
        expect(res.status).to.eql(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals(`jens successfully logged in!`);
        Cookies = res.headers["set-cookie"].pop().split(";")[0];
        done();
      });
  });
  it("fetch user information for logged in user with session cookie", done => {
    const req = request(app).get("/api/v1/session");
    req.cookies = Cookies;
    req.set("Accept", "application/json");
    req.end(function(err, res) {
      expect(res.body.username).to.equals(`jens`);
      done();
    });
  });
  it("return unauthorized when missing session cookie", done => {
    const req = request(app).get("/api/v1/session");
    req.set("Accept", "application/json");
    req.end(function(err, res) {
      expect(res.body.message).to.equals(`Unauthorized!`);
      done();
    });
  });
  it("logs out user", done => {
    const req = request(app).delete("/api/v1/user/login");
    req.cookies = Cookies;
    req.set("Accept", "application/json");
    req.end(function(err, res) {
      expect(res.body.message).to.equals(`jens successfully logged out!`);
      done();
    });
  });
  it("return unauthorized when user is logged out but sends a session cookie", done => {
    const req = request(app).get("/api/v1/session");
    req.set("Accept", "application/json");
    req.cookies = Cookies;
    req.end(function(err, res) {
      expect(res.body.message).to.equals(`Unauthorized!`);
      done();
    });
  });

  xit("stores user information", done => {
    request(app)
      .post("/api/v1/user/data/1")
      .send({ name: "Jens", information: "" })

      .end((err, res) => {
        expect(res.status).to.eql(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals("jens created");
        done();
      });
  });
  xit("fetches user information for a logged in user", done => {
    request(app)
      .get("/api/v1/user/data/1")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals(`jens successfully logged in!`);
        done();
      });
  });
});
