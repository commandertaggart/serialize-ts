
import { Serializer, serializable, serialized } from '..';

Serializer.blockSize = 20;

@serializable() class TestClass1
{
	static x:number = 0;
	public a:number;
	@serialized('uint8') b:number;

	constructor()
	{ this.a = ++TestClass1.x; this.b = TestClass1.x; }
}

@serializable('t2') class TestClass2
{
	static x:number = 0;
	@serialized('int[]') a:number[];

	constructor()
	{ this.a = [1,2,3,4].map(() => ++TestClass2.x); }
}

console.log("TestClass1 serializes as: " + TestClass1['serializedType']);
console.log("TestClass2 serializes as: " + TestClass2['serializedType']);

var tests:Object[] =[
	{ x: 10 },
	{ n: 5, b:true, s:"Hello" },
	new TestClass1(),
	{ a: [1, 2, 3], b: false, c:null },
	new TestClass2(),
	{ n: 5, b:true, s:"Hello", o: { x: 3, a: [9,8,"7"], o: { c: true } } },
	[ 0,9,0,0,9,4,2 ],
	[ new TestClass1(), new TestClass2() ]
];

tests.forEach((obj:Object) => {
	console.log(obj);
	var b:Buffer = Serializer.toBuffer(obj);
	//console.log(b);
	var o:Object = Serializer.fromBuffer(b);
	console.log(o);
});
