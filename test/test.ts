const assert = require("assert");
import smoothstep from "../src/index";

describe("smoothstep", function () {
  it("works", () => {
    assert.equal(smoothstep(1), 1);
    assert.equal(smoothstep(0), 0);
    assert.ok(smoothstep(0.5));
  });
});
