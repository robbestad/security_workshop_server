var chai, expect, app, chaiHttp, agent;

chai = require("chai");
expect = chai.expect;
chaiHttp = require("chai-http");
app = require("../../../bin/server");
chai.use(chaiHttp);

describe("Array", function() {
  before(() => {
    agent = chai.request.agent(app);
  });
  after(() => {
    agent.close();
    app.stop();
  });

  it("welcomes user to the api", done => {
    agent.get("/").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.status).to.equals("success");
      expect(res.body.message).to.equals("Velkommen til Sven Anders sitt API");
      done();
    });
  });
  it("creates a user", done => {
    agent
      .post("/user/create")
      .send({ username: "jens", password: "$a&bc12Pl3" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals("jens created");
        done();
      });
  });
  it("logs in a user", done => {
    agent
      .post("/user/login")
      .send({ username: "jens", password: "$a&bc12Pl3" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals(`jens successfully logged in!`);
        done();
      });
  });
  xit("stores user information", done => {
    agent
      .post("/user/data/1")
      .send({ name: "Jens", information: "" })

      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        expect(res.body.message).to.equals("jens created");
        done();
      });
  });
  xit("fetches user information for a logged in user", done => {
    agent.get("/user/data/1").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.status).to.equals("success");
      expect(res.body.message).to.equals(`jens successfully logged in!`);
      done();
    });
  });
});
