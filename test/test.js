var assert = require("assert");
import todo from "../dist/smoothstep";

describe("Package", function () {
  it("works", ()=>{
    assert.equal(todo(), 42);
  });
});
