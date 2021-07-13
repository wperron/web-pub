import { assert } from "https://deno.land/std@0.100.0/testing/asserts.ts";
import { parse, Args } from "./args.ts";

Deno.test({
  name: "no args",
  fn() {
    const target: Args = { _: [] };
    parse(target, []);
    assert(target._.length === 0);
    assert(target.b === undefined);
    assert(target.bucket === undefined);
    assert(target.h === undefined);
    assert(target.help === undefined);
    assert(target.v === undefined);
    assert(target.version === undefined);
  }
});

Deno.test({
  name: "known options",
  fn() {
    // use arrow function to get a fresh copy on every assert
    const target = (): Args => {
      return { _: [] }
    }
    let curr = target();

    parse(curr, [ "-h", "--help" ]);
    assert(curr._.length === 0);
    assert(curr.h === true);
    assert(curr.help === true);

    curr = target();
    parse(curr, [ "-v", "3.4.5" ]);
    assert(curr._.length === 0);
    assert(curr.v === "3.4.5");
  },
});

Deno.test({
  name: "unknown options",
  fn() {
    const target: Args = { _: [] };
    parse(target, [ "--foobar", "baz" ]);
    console.log(target);
    assert(target._.length === 0);
  }
});