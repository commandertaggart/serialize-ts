"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token;
(function (Token) {
    Token[Token["NULL"] = 0] = "NULL";
    Token[Token["STRING"] = 1] = "STRING";
    //	INT64,
    Token[Token["INT32"] = 2] = "INT32";
    Token[Token["INT16"] = 3] = "INT16";
    Token[Token["INT8"] = 4] = "INT8";
    //	UINT64,
    Token[Token["UINT32"] = 5] = "UINT32";
    Token[Token["UINT16"] = 6] = "UINT16";
    Token[Token["UINT8"] = 7] = "UINT8";
    Token[Token["FLOAT"] = 8] = "FLOAT";
    Token[Token["DOUBLE"] = 9] = "DOUBLE";
    Token[Token["TRUE"] = 10] = "TRUE";
    Token[Token["FALSE"] = 11] = "FALSE";
    Token[Token["ARRAY"] = 12] = "ARRAY";
    Token[Token["OBJECT_START"] = 13] = "OBJECT_START";
    Token[Token["OBJECT_PROPERTY"] = 14] = "OBJECT_PROPERTY";
    Token[Token["OBJECT_END"] = 15] = "OBJECT_END";
    Token[Token["EOF"] = 16] = "EOF";
})(Token = exports.Token || (exports.Token = {}));
//# sourceMappingURL=Token.js.map