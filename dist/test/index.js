"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
__1.Serializer.blockSize = 20;
let TestClass1 = TestClass1_1 = class TestClass1 {
    constructor() { this.a = ++TestClass1_1.x; this.b = TestClass1_1.x; }
};
TestClass1.x = 0;
__decorate([
    __1.serialized('uint8')
], TestClass1.prototype, "b", void 0);
TestClass1 = TestClass1_1 = __decorate([
    __1.serializable()
], TestClass1);
let TestClass2 = TestClass2_1 = class TestClass2 {
    constructor() { this.a = [1, 2, 3, 4].map(() => ++TestClass2_1.x); }
};
TestClass2.x = 0;
__decorate([
    __1.serialized('int[]')
], TestClass2.prototype, "a", void 0);
TestClass2 = TestClass2_1 = __decorate([
    __1.serializable('t2')
], TestClass2);
console.log("TestClass1 serializes as: " + TestClass1['serializedType']);
console.log("TestClass2 serializes as: " + TestClass2['serializedType']);
var tests = [
    { x: 10 },
    { n: 5, b: true, s: "Hello" },
    new TestClass1(),
    { a: [1, 2, 3], b: false, c: null },
    new TestClass2(),
    { n: 5, b: true, s: "Hello", o: { x: 3, a: [9, 8, "7"], o: { c: true } } },
    [0, 9, 0, 0, 9, 4, 2],
    [new TestClass1(), new TestClass2()]
];
tests.forEach((obj) => {
    console.log(obj);
    var b = __1.Serializer.toBuffer(obj);
    //console.log(b);
    var o = __1.Serializer.fromBuffer(b);
    console.log(o);
});
var TestClass1_1, TestClass2_1;
//# sourceMappingURL=index.js.map