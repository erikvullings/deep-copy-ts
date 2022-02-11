// /*
// 	Testing clone - basic approach - clone it, change the orginal, show the clone has not changed.

// 	type coverage: 
// 	- basics: number, string, boolean ... nulls ...
// 	- simple composites: flat object, flat array.
// 	- class (with cloneMeFn) - flat.

// 	then:
// 	- array - object - multiple sub-nesting.
// 	- class - derived (two levels) from base class with 'cloneMe' implemented.
// 	- class - hierarchy of class objects with refs - up and down (child, parent) with array/object as well.

// Consider:

// Map? Other classes?
// Enum?


// */

// // nb: as it stands, shared refs to objects lead to NEW object in each case, even if shared within a data structure in original. TBU.

// //***
import { deepCopy, CLONE_ME, DeepCopyable } from './deepCopy'

//*** debug assistance.
let lg_debug = false;

export const dbg = (v: boolean) => lg_debug = v;
export const lg 	= (...args: any[]) => { if (lg_debug) console.log(...args); }

// misc.
export const isFn 	= (fn: any): boolean => typeof fn === 'function'

export const isPrim = (v: any):  boolean => 
{
	let t = typeof v;
	return t in ['number', 'bigint', 'string', 'boolean', 'null', 'undefined', 'symbol']
}


// json clone, compare, etc. only work on basic data structures - i.e. will not work with class created objects (with methods).
// used for checking or partial checking of results, where possible.
export const lgJson= (v: any, msg: string = 'lgJson:\n') 	=> { lg(msg, JSON.stringify(v, null, ' ')); }
export const jsonClone = <T>(obj: T): T 					=> JSON.parse(JSON.stringify(obj));
export const jsonEq = (a: any, b:any) 						=>	(a !== b) && (JSON.stringify(a) === JSON.stringify(b));

export const jsonWithFnsEq = (a: any, b: any, fnArr: any[]) : boolean =>
{
	let ret = jsonEq(a,b);

	// top level fns only - tested here.
	fnArr.forEach( fn => 
	{
		if (isFn (a[fn]) ) 
		{
			// if a has the fn, b should have same fn.
			ret = ret && isFn(b[fn])
			ret = ret && (a[fn].toString() === b[fn].toString());
		}
	});

	return ret;
}

// assertions for tests.
const ass = (b:boolean, m='oops')	=>	{ if (!b) throw "assertion error: " + m; }
const assJsonEq =(a: any, b: any)	=>	{ ass( jsonEq(a,b), 'json mismatch (a,b)' ) };

// methods in objects a, b passed explicitly to facilitate testing.
const assJsonWithFnsEq = (a: any, b: any, fnArr: any[]) =>
	ass(jsonWithFnsEq(a,b,fnArr), 'error in assJsonWithFnsEq');


// *** test data - building structures to use in tests.
let ARR_SZ 		= 45;	// arbitrary - can change - watch out for test timeouts tho.
let OBJ_DEPTH 	= 5;	// arbitrary - can change - watch out for test timeouts tho - exponential 2**OBJ_DEPTH time dependency.

const mkObject = (leaf: any, depth: number, shared: boolean): any => 
{
	let rval = undefined;

	if (depth === 0) rval = leaf;
	else
	{
		let o = mkObject(leaf, depth-1, shared);

		rval = { left: o, right: o }
	
		if ( !shared )
		{
			let p = deepCopy(o);
			rval = { left: o, right: p }
		}
	}

	return rval;
}


const mkArray = (n: number, o: any, shared: boolean): any => 
{
	let arr: any[] = [];

	for (let i=0; i<n; i++)
	{
		arr[i] = o;
		if (! shared) arr[i] = deepCopy(arr[i]);
	}

	return arr;
}

const objWithArrWithObj = (shared: boolean): any =>
{
	let firstObj = mkObject('base', OBJ_DEPTH, false)
	
	// add random stuff to play - here!
	firstObj.xxx = 100 ;
	firstObj.zzz = null;
	// end

	let arr = mkArray(ARR_SZ, firstObj, true);
	let deeperArr = mkArray(ARR_SZ, arr, false);
	let finalObj = mkObject(arr, OBJ_DEPTH, shared);

	return finalObj;
}

// Tests (part 1)
describe(`*** testing clone function - objects/arrays and combinations\nno cycles, no 'class objects with functions/methods'`, function()
{
	it('** clone simple array - 1', function()
	{
		let a = mkArray(100, 'hello', true);
		let aclone = deepCopy(a)

		assJsonEq(a, aclone);
	});

	it('** clone simple array - 2', function()
	{
		let a = mkArray(200, 'doublespeakwise - there are no duplicates here', false);
		let aclone = deepCopy(a);
		assJsonEq(a, aclone);
	});

	it("** clone obj with arrays with objects", function()
	{
		let orig = objWithArrWithObj(false);
		let clone = deepCopy(orig)
		assJsonEq(orig, clone);
	});

	it("** force clone error (comparing) - ensure recognised (sanity check)", function()
	{
		let orig = objWithArrWithObj(false);
		let clone = deepCopy(orig)

		clone.sageAdvice = 'a herb in the hand is worth two in the acme food store (names changed to hide identity)';
		
		ass( !jsonEq(orig, clone) );
	});
});

const inlineObjectWithFn = () =>
{
	let obj =
	{
		arr: [ 0, 1, 2, 3, 4, 5, 6, 7 ],
		num: 10,
		str: 'hello world',

		// nb: this fn is enumerable (Object.keys) whereas the equivalent in a class created object seems not to be!
		[CLONE_ME]()
		{
			let p = <typeof obj>{};
			
			// this will only work is the non-fn props of obj are Json clonable.
			p = jsonClone(obj);

			// let's check.
			assJsonEq(p, obj);
			p[CLONE_ME] = obj[CLONE_ME]; // this!
			
			return p;
		}
	}
	return obj;
}

// nb: using the 'fn = () => value' form of function means the 'fn' is an own-property of the object created new-ing a class.

const LEN = 'lenFunction';

class BasicClass
{
	private n: any[] = [];

	// clone approach used here:
	// [CLONE_ME] uses ctor to create new object and then clones
	// whatever other state is necessary to complete the class clone.

	constructor(n: number)
	{
		for (let i=0; i<n; i++)
		{
			this.n.push({value: i});
		}
	}

	[LEN] = () => this.n.length;

	// nb: this caused a typescript error when clone.ts declared export const CLONE_ME = 'xxxx' *** as string *** (as string was the issue)
	// in conjunction with using (arrow fn) "[CLONE_ME] = () =>" [directly below]. Hence now ordinary Fn.
	[CLONE_ME](): BasicClass
	{
		let clone = new BasicClass(this.n.length);
		return clone;
	}
}

const FN1 = 'function1'
const FN2 = 'function2'
const SET_STRING = 'setString';

class ExtendBasicClass extends BasicClass
{
	private s: string = "";
	private o: any;

	constructor(n: number, s: string, o: any)
	{
		super(n);
		this[SET_STRING](s);
	}

	[SET_STRING](sval: string) { this.s = sval; }
	
	[FN1] = () => { return 'hello world - arrow fn style'; }
	[FN2]() { return 'another pretty uninteresting function - non arrow fn'; }

	[CLONE_ME]()
	{
		let clone = new ExtendBasicClass( this[LEN](), this.s, deepCopy(this.o) )
		return clone;
	}
}

function deepClass() : any
{
	let o =
	{
		arr: 
		[ 
			0, 1, 2,
			{ 
				blah: [ 'blah', 'blah'],
				anotherarr: 
				[ 
					0, 1, 2, 3, 4, 5, 6,
					new ExtendBasicClass( ARR_SZ*3, 'goodbye cruel world', objWithArrWithObj(false) ),
					8 
				],
			},
			4, 5
		],
		b: { asv: 'a-string-value' }
	}
	// nb: class created object is at o.arr[3].anotherarr[7]

	return o;
}

// Tests (part 2)
describe(`*** testing clone function - objects with fns (methods), using variety of approaches to their creation`, function()
{
	// add 'set usingCache.'

	it("** clone simple object with fn", function()
	{
		let orig = inlineObjectWithFn();
		let clone = deepCopy(orig);

		assJsonWithFnsEq(orig, clone, [CLONE_ME] );
	});

	// TBD: recheck, not entirely happy with <any>function ...
	it("** clone simple object with fn - force error (sanity check)", function()
	{
		let orig = inlineObjectWithFn();
		let clone = deepCopy(orig);
		clone[CLONE_ME] = <any>function() {};

		ass( ! jsonWithFnsEq(orig, clone, [CLONE_ME]) );
	});

	it("** 'new' class object with fn", function()
	{
		let orig = new BasicClass(ARR_SZ);
		let clone = deepCopy(orig);

		lg("Orig: ",orig)
		lg("Clone: ",clone)

		assJsonWithFnsEq(orig, clone, [CLONE_ME, LEN])
	});

	it("** 'new' further derived class object with fns and other complex nested properties", function()
	{
		let orig = new ExtendBasicClass(ARR_SZ*2, 'goodbye cruel world', objWithArrWithObj(false) );
		let clone = deepCopy(orig);

		assJsonWithFnsEq(orig, clone, [CLONE_ME, LEN, FN1, FN2, SET_STRING])
	});

	it("** new class embedded deeply in data structure (arrays, objects)", function()
	{
		let orig = deepClass()
		let clone = deepCopy(orig);

		assJsonEq(orig, clone);
		ass( orig !== clone );
		
		// More TBD.
		assJsonWithFnsEq(orig.arr[3].anotherarr[7], clone.arr[3].anotherarr[7], [CLONE_ME, LEN, FN1, FN2, SET_STRING])
	});

	it("** new class embedded deeply in data structure - force error (sanity check)", function()
	{
		let orig = deepClass()
		let clone = deepCopy(orig);

		clone.arr[3].anotherarr[7].setString('something-different'); 

		ass(orig !== clone);
		ass( !jsonEq( orig, clone) );
				
		ass( !jsonWithFnsEq(orig.arr[3].anotherarr[7], clone.arr[3].anotherarr[7], [CLONE_ME, LEN, FN1, FN2, SET_STRING]) );
	});

});


const MAX_SELVES = 5;

class CustomClass implements DeepCopyable<CustomClass>
{
	private value: number;
	private myselves: CustomClass[] = [];

	constructor(value: number)
	{
		// self referential.
		for (let i=0; i<MAX_SELVES; i++) this.myselves[i] = this;
		this.value = value;
	}

	get = (n: number) => this.myselves[n];
	nSelves = () => this.myselves.length;

	val = () => this.value;

	[CLONE_ME]()
	{
		return new CustomClass(this.value);
	}
}

const VAL = 1;
const BIG_VAL = 99999;

// Tests (Part 3)
describe(`*** testing clone function - dealing with cycles in data structures, shared references, etc.`, function()
{
	it("** simple object with cycle", function()
	{
		let orig = { a: VAL, b: 2, self: 0 as any } 
		
		// self ref. cycle.
		orig.self = orig; 

		ass( orig === orig.self );

		let clone = deepCopy(orig);

		ass ( clone !== orig );
		ass( clone === clone.self );

		orig.a = BIG_VAL;
		ass (orig.self.a === BIG_VAL)

		ass ( clone.a === VAL ) // unchanged.
		ass ( clone.self.self.a === VAL );
	});

	it("** simple object with shared refs - not cycles", function()
	{
		let shared = { a: VAL, b: 2 }
		let orig = { a: shared, b: shared }
		
		ass( orig.a === orig.b );

		let clone = deepCopy(orig);

		ass ( clone !== orig );
		ass( clone.a === clone.b );

		orig.a.a = BIG_VAL;
		ass (orig.b.a === BIG_VAL)

		ass ( clone.a.a === VAL ) // unchanged.
	});

	it("** self ref array (cycle)", function()
	{
		let orig: any[] = []
		orig.push(orig);

		ass( orig[0] === orig, "1" )

		let clone = deepCopy(orig);
		ass( clone !== orig, "2" )

		// console.log('orig: ',orig);
		// console.log('clone: ', clone)

		ass( clone[0] === clone, "3" )

	});

	it("** array of object with shared refs and intra-array cycle", function()
	{
		let shared = { a: VAL, b: 2, c: 'blah' }
		let orig: any[] = [ shared, shared, shared ]
		orig.push(orig);

		ass( orig[0] === orig[1] && orig[1] === orig[2], "1" )
		ass( orig === orig[3], "2" )

		let clone = deepCopy(orig);
		ass( clone !== orig, "3" )
		ass( clone[0] === clone[1] && clone[1] === clone[2], "4" )

		// lg(clone);
		// lg(clone[3])
		ass( clone === clone[3], "5" )

		orig[0].a = BIG_VAL;
		ass (clone[0].a === VAL, "6");

	});

	it("** Custom self referential class", function()
	{
		let v1 = 999;
		
		let orig = new CustomClass(v1);
		for (let i=0; i<orig.nSelves(); i++) ass(orig.get(i) === orig, "1");

		let clone = deepCopy(orig);
		ass(clone !== orig, "2");

		for (let i=0; i<clone.nSelves(); i++) ass(clone.get(i) === clone, "3");
	}) ;

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
// 3. Anything to do with object prototypes. These are basicaly ignored at present. What could the desired behaviour be?
