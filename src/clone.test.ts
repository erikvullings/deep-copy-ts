/*
  the tests here cover testing of more complex data structure - objects within arrays within objects, etc.
  also: correct cloning of shared data (i.e. the clone has its own copy, but data is shared in the same place)
  also: correct cloning of cyclic data structures (a->b->a .. etc.)
  also: cloning of custom classes (by deferring the cloning to the class itself).
*/

// nb: as it stands, shared refs to objects lead to NEW object in each case, even if shared within a data structure in original. TBU.

import { deepCopy, CLONE_ME, DeepCopyable } from "./deepCopy";

//*** debug assistance.
const lg_debug = false;

//  utility.
const lg = (...args: unknown[]) => {
  if (lg_debug) console.log(...args);
};
const isFn = (fn: unknown): boolean => typeof fn === "function";

// json clone, compare, etc. only work on basic data structures - i.e. will not work with class created objects (with methods).
// used for checking or partial checking of results, where possible.
export const lgJson = (v: unknown, msg = "lgJson:\n") => {
  lg(msg, JSON.stringify(v, null, " "));
};

export const jsonClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const jsonEq = <T>(a: T, b: T): boolean =>
  a !== b && JSON.stringify(a) === JSON.stringify(b);

export const jsonWithFnsEq = (
  a: unknown,
  b: unknown,
  fnArr: string[]
): boolean => {
  let ret = jsonEq(a, b);

  // top level fns only - tested here.
  fnArr.forEach((fn ) => {
    if (isFn(a[fn])) {
      // if a has the fn, b should have same fn.
      ret = ret && isFn(b[fn]);
      ret = ret && a[fn].toString() === b[fn].toString();
    }
  });

  return ret;
};

// assertions for tests.
const ass = (b: boolean, m = "oops") => {
  if (!b) throw "assertion error: " + m;
};
const assJsonEq = (a: unknown, b: unknown) => {
  ass(jsonEq(a, b), "json mismatch (a,b)");
};

// methods in objects a, b passed explicitly to facilitate testing.
const assJsonWithFnsEq = (a: unknown, b: unknown, fnArr: string[]) =>
  ass(jsonWithFnsEq(a, b, fnArr), "error in assJsonWithFnsEq");

// *** test data - building structures to use in tests.
const ARR_SZ = 45; // arbitrary - can change - watch out for test timeouts tho.
const OBJ_DEPTH = 5; // arbitrary - can change - watch out for test timeouts tho - exponential 2**OBJ_DEPTH time dependency.

type LRTreeStruct<T> = { [key: string ]: LRTreeStruct<T> } | T;

const mkObject = <T>(leaf: T, depth: number, shared: boolean): LRTreeStruct<T> => {
  let rval = undefined;

  if (depth === 0) rval = leaf;
  else {
    const o = mkObject(leaf, depth - 1, shared);

    rval = { left: o, right: o };

    if (!shared) {
      const p = deepCopy(o);
      rval = { left: o, right: p };
    }
  }

  return rval;
};

const mkArray = <T>(n: number, o: T, shared: boolean): T[] => {
  const arr: T[] = [];

  for (let i = 0; i < n; i++) {
    arr[i] = o;
    if (!shared) arr[i] = deepCopy(arr[i]);
  }

  return arr;
};

type ArrLRTreeStruct = LRTreeStruct<string>[];
type NestedLRTreeStruct = LRTreeStruct<ArrLRTreeStruct>

const objWithArrWithObj = (shared: boolean): NestedLRTreeStruct => {
  const firstObj: LRTreeStruct<string> = mkObject("base", OBJ_DEPTH, false);
  const arr: ArrLRTreeStruct = mkArray(ARR_SZ, firstObj, true);
  const finalObj: NestedLRTreeStruct = mkObject(arr, OBJ_DEPTH, shared);

  return finalObj;
};

// Tests (part 1)
describe(`*** testing clone function - objects/arrays and combinations\nno cycles, no 'class objects with functions/methods'`, function () {
  it("** clone simple array - 1", function () {
    const a = mkArray(100, "hello", true);
    const aclone = deepCopy(a);

    assJsonEq(a, aclone);
  });

  it("** clone simple array - 2", function () {
    const a = mkArray(
      200,
      "doublespeakwise - there are no duplicates here",
      false
    );
    const aclone = deepCopy(a);
    assJsonEq(a, aclone);
  });

  it("** clone obj with arrays with objects", function () {
    const orig = objWithArrWithObj(false);
    const clone = deepCopy(orig);

    assJsonEq(orig, clone);
  });

  it("** force clone error (comparing) - ensure recognised (sanity check)", function () {
    const orig = objWithArrWithObj(false);
    const clone = deepCopy(orig);

    orig["left"] = null;    
    ass(!jsonEq(orig, clone));
  });
});


const inlineObjectWithFn = () => {
  const obj = {
    arr: [0, 1, 2, 3, 4, 5, 6, 7],
    num: 10,
    str: "hello world",

    // nb: this fn is enumerable (Object.keys) whereas the equivalent in a class created object seems not to be!
    [CLONE_ME]() 
    {
      const p = jsonClone(obj);

      assJsonEq(p, obj);
      p[CLONE_ME] = obj[CLONE_ME]; // this!

      return p;
    },
  };
  return obj;
};


// nb: using the 'fn = () => value' form of function means the 'fn' is an own-property of the object created new-ing a class.
const LEN = "lenFunction";

class BasicClass {
  private n: unknown[] = [];

  // clone approach used here:
  // [CLONE_ME] uses ctor to create new object and then clones
  // whatever other state is necessary to complete the class clone.

  constructor(n: number) {
    for (let i = 0; i < n; i++) {
      this.n.push({ value: i });
    }
  }

  [LEN] = () => this.n.length;

  // nb: this caused a typescript error when clone.ts declared export const CLONE_ME = 'xxxx' *** as string *** (as string was the issue)
  // in conjunction with using (arrow fn) "[CLONE_ME] = () =>" [directly below]. Hence now ordinary Fn.
  [CLONE_ME](): BasicClass {
    const clone = new BasicClass(this.n.length);
    return clone;
  }
}

const FN1 = "function1";
const FN2 = "function2";
const SET_STRING = "setString";

class ExtendBasicClass extends BasicClass {
  constructor(n: number, private s: string, private o: unknown) {
    super(n);
    this[SET_STRING](s);
  }

  [SET_STRING](sval: string) {
    this.s = sval;
  }

  [FN1] = () => {
    return "hello world - arrow fn style";
  };
  [FN2]() {
    return "another pretty uninteresting function - non arrow fn";
  }

  [CLONE_ME]() {
    const clone = new ExtendBasicClass(this[LEN](), this.s, deepCopy(this.o));
    return clone;
  }
}

function deepClass() {
  const o = {
    arr: [
      0,
      1,
      2,
      {
        blah: ["blah", "blah"],
        anotherarr: [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          new ExtendBasicClass(
            ARR_SZ * 3,
            "goodbye cruel world",
            objWithArrWithObj(false)
          ),
          8,
        ],
      },
      4,
      5,
    ],
    b: { asv: "a-string-value" },
  };
  // nb: class created object is at o.arr[3].anotherarr[7]

  return o;
}

// Tests (part 2)
describe(`*** testing clone function - objects with fns (methods), using variety of approaches to their creation`, function () {
  // add 'set usingCache.'

  it("** clone simple object with fn", function () {
    const orig = inlineObjectWithFn();
    const clone = deepCopy(orig);

      assJsonWithFnsEq(orig, clone, [CLONE_ME]);
  });

  it("** clone simple object with fn - force error (sanity check)", function () {
    const orig = inlineObjectWithFn();
    const clone = deepCopy(orig);

    clone.str = "world, hello! as Yoda would say"
    
    ass(!jsonWithFnsEq(orig, clone, [CLONE_ME]));
  });

  it("** 'new' class object with fn", function () {
    const orig = new BasicClass(ARR_SZ);
    const clone = deepCopy(orig) as BasicClass;

    lg("Orig: ", orig);
    lg("Clone: ", clone);

    assJsonWithFnsEq(orig, clone, [CLONE_ME, LEN]);
  });

  it("** 'new' further derived class object with fns and other complex nested properties", function () {
    const orig = new ExtendBasicClass(
      ARR_SZ * 2,
      "goodbye cruel world",
      objWithArrWithObj(false)
    );
    const clone = deepCopy(orig);

    assJsonWithFnsEq(orig, clone, [CLONE_ME, LEN, FN1, FN2, SET_STRING]);
  });

  it("** new class embedded deeply in data structure (arrays, objects)", function () {
    const orig = deepClass();
    const clone = deepCopy(orig);

    assJsonEq(orig, clone);
    ass(orig !== clone);

    // More TBD.
    assJsonWithFnsEq(orig.arr[3]["anotherarr"][7], clone.arr[3]["anotherarr"][7], [
      CLONE_ME,
      LEN,
      FN1,
      FN2,
      SET_STRING,
    ]);
  });

  it("** new class embedded deeply in data structure - force error (sanity check)", function () {
    const orig = deepClass();
    const clone = deepCopy(orig);

    clone.arr[3]["anotherarr"][7].setString("something-different");

    ass(orig !== clone);
    ass(!jsonEq(orig, clone));

    ass(
      !jsonWithFnsEq(orig.arr[3]["anotherarr"][7], clone.arr[3]["anotherarr"][7], [
        CLONE_ME,
        LEN,
        FN1,
        FN2,
        SET_STRING,
      ])
    );
  });
});

const MAX_SELVES = 5;

class CustomClass implements DeepCopyable<CustomClass> {
  private value: number;
  private myselves: CustomClass[] = [];

  constructor(value: number) {
    // self referential.
    for (let i = 0; i < MAX_SELVES; i++) this.myselves[i] = this;
    this.value = value;
  }

  get = (n: number) => this.myselves[n];
  nSelves = () => this.myselves.length;

  val = () => this.value;

  [CLONE_ME]() {
    return new CustomClass(this.value);
  }
}

const VAL = 1;
const BIG_VAL = 99999;

type MISC_UNDEF<T> = T | undefined;
type MISC = { a: number, b: number, self: MISC_UNDEF<MISC> }

// Tests (Part 3)
describe(`*** testing clone function - dealing with cycles in data structures, shared references, etc.`, function () {
  it("** simple object with cycle", function () {
    
    const orig: MISC = {
      a: VAL,
      b: 2,
      self: undefined
    };

    orig.self = orig;
    ass(orig === orig.self);

    const clone = deepCopy(orig);

    ass(clone !== orig);
    ass(clone === clone.self);

    orig.a = BIG_VAL;
    ass(orig.self.a === BIG_VAL);

    ass(clone.a === VAL); // unchanged.
    ass(clone.self.self.a === VAL);
  });

  it("** simple object with shared refs - not cycles", function () {
    const shared = { a: VAL, b: 2 };
    const orig = { a: shared, b: shared };

    ass(orig.a === orig.b);

    const clone = deepCopy(orig);

    ass(clone !== orig);
    ass(clone.a === clone.b);

    orig.a.a = BIG_VAL;
    ass(orig.b.a === BIG_VAL);

    ass(clone.a.a === VAL); // unchanged.
  });

  it("** self ref array (cycle)", function () {
    const orig: unknown[] = [];
    orig.push(orig);

    ass(orig[0] === orig, "1");

    const clone = deepCopy(orig);
    ass(clone !== orig, "2");

    // console.log('orig: ',orig);
    // console.log('clone: ', clone)

    ass(clone[0] === clone, "3");
  });

  it("** array of object with shared refs and intra-array cycle", function () {
    const shared = { a: VAL, b: 2, c: "blah" };
    const orig: unknown[] = [shared, shared, shared];
    orig.push(orig);

    ass(orig[0] === orig[1] && orig[1] === orig[2], "1");
    ass(orig === orig[3], "2");

    const clone = deepCopy(orig);
    ass(clone !== orig, "3");
    ass(clone[0] === clone[1] && clone[1] === clone[2], "4");

    ass(clone === clone[3], "5");

    orig[0]["a"] = BIG_VAL;
    ass(clone[0]["a"] === VAL, "6");
  });

  it("** Custom self referential class", function () {
    const v1 = 999;

    const orig = new CustomClass(v1);
    for (let i = 0; i < orig.nSelves(); i++) ass(orig.get(i) === orig, "1");

    const clone = deepCopy(orig);
    ass(clone !== orig, "2");

    for (let i = 0; i < clone.nSelves(); i++) ass(clone.get(i) === clone, "3");
  });

  /* TESTS TO DO:
		-	Arrays of objects of array
		-	Custom Class - couple of levels, cloneMe ...
		- 	Map,
		-	Function object?
	*/
});

// Possible extensions... (though there's no real reason to think these won't work).
// 1. Closure style 'object with fns' - tho is not really different inlineObjectWithFn.
// 2. JS Style function class - tho is not really different to class { ... }, and you wouldn't use in TS.

// Currently unaddressed:
// 1. Complex data structures with reference values shared - reproducing these in clone objects will not work
// - e.g. obj.parent ... obj.children ... is cyclic (won't work using clone fn as it stands) and will have shared ref values.
// - question also arises - what is the desired behaviour?
// 2. Cycles in refs.. as per (1).
// 3. unknownthing to do with object prototypes. These are basicaly ignored at present. What could the desired behaviour be?
