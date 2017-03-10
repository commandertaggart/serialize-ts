"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SerializedBuffer_1 = require("./SerializedBuffer");
const Token_1 = require("./Token");
var l = (...args) => { };
class Serializer {
    static toBuffer(object) {
        var sb = new SerializedBuffer_1.SerializedBuffer(Serializer.blockSize);
        serializeObject(object, sb);
        return sb.toBuffer();
    }
    static fromBuffer(buffer) {
        var sb = new SerializedBuffer_1.SerializedBuffer(buffer);
        return deserializeObject(sb);
    }
}
Serializer.blockSize = 1024;
Serializer.constructors = {
    'object': Object
};
exports.Serializer = Serializer;
function serializeObject(object, b) {
    var data;
    if (object['serializerData']) {
        data = object['serializerData'];
    }
    else if (Array.isArray(object)) {
        serializeArray(object, "", b);
        return;
    }
    else if (object) {
        data = {
            type: 'object',
            properties: {}
        };
        Object.keys(object).forEach((prop) => {
            var t = typeof (object[prop]);
            if (t !== 'function' &&
                t !== 'undefined') {
                data.properties[prop] = "";
            }
        });
    }
    else {
        throw new Error("Don't know how to seralize object: " + object);
    }
    l("Serializing object: ", data);
    b.putToken(Token_1.Token.OBJECT_START);
    b.putIdentifier(data.type);
    Object.keys(data.properties).forEach((prop) => {
        let o = object[prop];
        let t = data.properties[prop] || typeof (o);
        serializeProperty(prop, o, t, b);
    });
    b.putToken(Token_1.Token.OBJECT_END);
}
function serializeArray(a, t, b) {
    b.putToken(Token_1.Token.ARRAY);
    b.putSize16(a.length);
    if (a.length > 0xFFFF) {
        throw new Error("Array size too large.");
    }
    a.forEach((item, index) => {
        var it = t || typeof (item);
        serializeProperty(index, item, it, b);
    });
}
function serializeProperty(id, o, t, b) {
    if (typeof (id) === 'string') {
        b.putToken(Token_1.Token.OBJECT_PROPERTY);
        b.putIdentifier(id);
    }
    else {
        b.putSize16(id);
    }
    if (t.endsWith("[]")) {
        serializeArray(o, t.substr(0, t.length - 2), b);
    }
    else if (t === 'object' && Array.isArray(o)) {
        serializeArray(o, "", b);
    }
    else if (t === 'object') {
        if (o) {
            serializeObject(o, b);
        }
        else {
            b.putToken(Token_1.Token.NULL);
        }
    }
    else {
        switch (t) {
            case 'string':
                b.putString(o);
                break;
            case 'boolean':
                b.putBoolean(o);
                break;
            case 'uint8':
                b.putUInt8(o);
                break;
            case 'int8':
                b.putInt8(o);
                break;
            case 'uint16':
                b.putUInt16(o);
                break;
            case 'int16':
                b.putInt16(o);
                break;
            case 'uint32':
            case 'uint':
                b.putUInt32(o);
                break;
            case 'int32':
            case 'int':
                b.putInt32(o);
                break;
            //			case 'uint64':
            //				b.putUInt64(<number>o);
            //				break;
            //			case 'int64':
            //				b.putInt64(<number>o);
            //				break;
            case 'float':
                b.putFloat(o);
                break;
            case 'double':
            case 'number':
                b.putDouble(o);
                break;
            case 'undefined':
                b.putToken(Token_1.Token.NULL);
                break;
            default:
                throw new Error("Unrecognized type: " + t);
        }
    }
}
function deserializeObject(b) {
    if (b.peekToken() == Token_1.Token.OBJECT_START) {
        var o;
        b.getToken();
        var t = b.getIdentifier();
        if (t in Serializer.constructors) {
            o = new (Serializer.constructors[t])();
            while (b.peekToken() === Token_1.Token.OBJECT_PROPERTY) {
                b.getToken();
                o[b.getIdentifier()] = deserializeProperty(b);
            }
        }
        else {
            throw new Error("Constructor for serialized object not found.");
        }
        if (b.getToken() !== Token_1.Token.OBJECT_END) {
            throw new Error("Expected end of object not found.");
        }
        return o;
    }
    else if (b.peekToken() == Token_1.Token.ARRAY) {
        return deserializeArray(b);
    }
    else {
        return undefined;
    }
}
function deserializeArray(b) {
    var a = [];
    if (b.getToken() == Token_1.Token.ARRAY) {
        var len = b.getSize16();
        for (var i = 0; i < len; ++i) {
            if (b.getSize16() == i) {
                a.push(deserializeProperty(b));
            }
            else {
                throw new Error("Expected next index not found");
            }
        }
    }
    else {
        throw new Error("Array not found");
    }
    return a;
}
function deserializeProperty(b) {
    var t = b.peekToken();
    switch (t) {
        case Token_1.Token.NULL:
            b.getToken();
            return null;
        case Token_1.Token.TRUE:
            b.getToken();
            return true;
        case Token_1.Token.FALSE:
            b.getToken();
            return false;
        case Token_1.Token.STRING: return b.getString();
        case Token_1.Token.UINT8: return b.getUInt8();
        case Token_1.Token.INT8: return b.getInt8();
        case Token_1.Token.UINT16: return b.getUInt16();
        case Token_1.Token.INT16: return b.getInt16();
        case Token_1.Token.UINT32: return b.getUInt32();
        case Token_1.Token.INT32: return b.getInt32();
        //		case Token.UINT64: return b.getUInt64();
        //		case Token.INT64: return b.getInt64();
        case Token_1.Token.FLOAT: return b.getFloat();
        case Token_1.Token.DOUBLE: return b.getDouble();
        case Token_1.Token.ARRAY: return deserializeArray(b);
        case Token_1.Token.OBJECT_START: return deserializeObject(b);
    }
}
//# sourceMappingURL=Serializer.js.map