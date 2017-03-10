"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token_1 = require("./Token");
var l = (...args) => { };
//var l:Function = console.log.bind(console);
let T = [];
T[Token_1.Token.UINT8] = { s: 1, b: 'UInt8' };
T[Token_1.Token.INT8] = { s: 1, b: 'Int8' };
T[Token_1.Token.UINT16] = { s: 2, b: 'UInt16BE' };
T[Token_1.Token.INT16] = { s: 2, b: 'Int16BE' };
T[Token_1.Token.UINT32] = { s: 4, b: 'UInt32BE' };
T[Token_1.Token.INT32] = { s: 4, b: 'Int32BE' };
//T[Token.UINT64]	= { s:8, b:'UIntBE' };
//T[Token.INT64]	= { s:8, b:'IntBE' };
T[Token_1.Token.FLOAT] = { s: 4, b: 'FloatBE' };
T[Token_1.Token.DOUBLE] = { s: 8, b: 'DoubleBE' };
class ModeError extends Error {
    constructor(readOnly) {
        super(readOnly ?
            "SerializedBuffer is in read mode, but a write was attempted." :
            "SerializedBuffer is in write mode, but a read was attempted.");
        this.readOnly = readOnly;
    }
}
exports.ModeError = ModeError;
class OverrunError extends Error {
    constructor(requestedBytes, availableBytes) {
        super("Wanted to read " + requestedBytes + " bytes, but only " +
            availableBytes + " bytes available.");
        this.requestedBytes = requestedBytes;
        this.availableBytes = availableBytes;
    }
}
exports.OverrunError = OverrunError;
class TokenError extends Error {
    constructor(requestedToken, foundToken) {
        super("Requested read of token type " + Token_1.Token[requestedToken] +
            " but found token type " + Token_1.Token[foundToken]);
        this.requestedToken = requestedToken;
        this.foundToken = foundToken;
    }
}
exports.TokenError = TokenError;
class OversizeError extends Error {
    constructor(token) {
        super("Token type " + Token_1.Token[token] + " is too big.");
        this.token = token;
    }
}
exports.OversizeError = OversizeError;
class SerializedBuffer {
    constructor(blockSizeOrBuffer) {
        if (blockSizeOrBuffer instanceof Buffer) {
            this._blockSize = 0;
            this._buff = blockSizeOrBuffer;
        }
        else {
            this._blockSize = blockSizeOrBuffer || 1024;
            this._buff = Buffer.allocUnsafe(this._blockSize);
        }
        this._pos = 0;
        l("Block size: " + this._blockSize);
    }
    toBuffer() {
        return Buffer.allocUnsafe(this._pos).fill(this._buff, 0, this._pos);
    }
    adjustSize(bytes) {
        if (this._blockSize === 0) {
            throw new ModeError(true);
        }
        if (this._buff.length < (this._pos + bytes)) {
            var adjust = this._blockSize * Math.ceil(bytes / this._blockSize);
            this._buff = Buffer.allocUnsafe(this._buff.length + adjust).fill(this._buff, 0, this._pos);
            l("adjustSize(" + bytes + " + " + this._pos + "): " + (this._buff.length - adjust) + " += " + adjust);
        }
    }
    checkSize(bytes) {
        if (this._blockSize > 0) {
            throw new ModeError(false);
        }
        if (this._buff.length < (this._pos + bytes)) {
            throw new OverrunError(bytes, this._buff.length - this._pos);
        }
    }
    peekToken() {
        if ((this._pos + 1) < this._buff.length) {
            return this._buff.readUInt8(this._pos);
        }
        else {
            return Token_1.Token.EOF;
        }
    }
    putNumber(t, v) {
        l("PUT number(" + Token_1.Token[t] + "):" + v);
        this.adjustSize(T[t].s + 1);
        this._buff.writeUInt8(t, this._pos++);
        this._buff["write" + T[t].b](v, this._pos);
        this._pos += T[t].s;
        //l(this._buff);
    }
    getNumber(t) {
        this.checkSize(T[t].s + 1);
        let pt = this.peekToken();
        if (pt === t) {
            ++this._pos;
        }
        else {
            throw new TokenError(t, pt);
        }
        var n = this._buff["read" + T[t].b](this._pos);
        this._pos += T[t].s;
        l("GET number(" + Token_1.Token[t] + "):" + n);
        return n;
    }
    putUInt8(v) { this.putNumber(Token_1.Token.UINT8, v); }
    getUInt8() { return this.getNumber(Token_1.Token.UINT8); }
    putInt8(v) { this.putNumber(Token_1.Token.INT8, v); }
    getInt8() { return this.getNumber(Token_1.Token.INT8); }
    putUInt16(v) { this.putNumber(Token_1.Token.UINT16, v); }
    getUInt16() { return this.getNumber(Token_1.Token.UINT16); }
    putInt16(v) { this.putNumber(Token_1.Token.INT16, v); }
    getInt16() { return this.getNumber(Token_1.Token.INT16); }
    putUInt32(v) { this.putNumber(Token_1.Token.UINT32, v); }
    getUInt32() { return this.getNumber(Token_1.Token.UINT32); }
    putInt32(v) { this.putNumber(Token_1.Token.UINT32, v); }
    getInt32() { return this.getNumber(Token_1.Token.UINT32); }
    //	public putUInt64(v:number)
    //	{ this.putNumber(Token.UINT64, v); }
    //	public getUInt64():number
    //	{ return this.getNumber(Token.UINT64); }
    //	public putInt64(v:number)
    //	{ this.putNumber(Token.INT64, v); }
    //	public getInt64():number
    //	{ return this.getNumber(Token.INT64); }
    putFloat(v) { this.putNumber(Token_1.Token.FLOAT, v); }
    getFloat() { return this.getNumber(Token_1.Token.FLOAT); }
    putDouble(v) { this.putNumber(Token_1.Token.DOUBLE, v); }
    getDouble() { return this.getNumber(Token_1.Token.DOUBLE); }
    putBoolean(b) { this.putToken(b ? Token_1.Token.TRUE : Token_1.Token.FALSE); }
    getBoolean() {
        var t = this.getToken();
        if (t == Token_1.Token.TRUE) {
            return true;
        }
        else if (t == Token_1.Token.FALSE) {
            return false;
        }
        else {
            throw new TokenError(Token_1.Token.TRUE, t);
        }
    }
    putString(s) {
        var length = Buffer.byteLength(s, 'utf8');
        if (length > 0xFFFF) {
            throw new OversizeError(Token_1.Token.STRING);
        }
        this.adjustSize(length + 3);
        this._buff.writeUInt8(Token_1.Token.STRING, this._pos++);
        this._buff.writeUInt16BE(length, this._pos);
        this._pos += 2;
        this._buff.write(s, this._pos, length, 'utf8');
        this._pos += length;
        l("PUT string:" + s); //l(this._buff);
    }
    getString() {
        this.checkSize(5);
        let s = this.peekToken();
        if (s === Token_1.Token.STRING) {
            ++this._pos;
        }
        else {
            throw new TokenError(Token_1.Token.STRING, s);
        }
        let len = this._buff.readUInt16BE(this._pos);
        this._pos += 2;
        this.checkSize(len);
        var v = this._buff.toString('utf8', this._pos, this._pos += len);
        l("GET string:" + v);
        return v;
    }
    putIdentifier(s) {
        var length = Buffer.byteLength(s, 'utf8');
        if (length > 0xFF) {
            throw new OversizeError(Token_1.Token.STRING);
        }
        this.adjustSize(length + 1);
        this._buff.writeUInt8(length, this._pos++);
        this._buff.write(s, this._pos, length, 'utf8');
        this._pos += length;
        l("PUT id(" + length + "):" + s); //l(this._buff);
    }
    getIdentifier() {
        this.checkSize(1);
        let len = this._buff.readUInt8(this._pos++);
        this.checkSize(len);
        var v = this._buff.toString('utf8', this._pos, this._pos += len);
        l("GET id(" + len + "):" + v);
        return v;
    }
    putToken(t) {
        this.adjustSize(1);
        this._buff.writeUInt8(t, this._pos++);
        l("PUT " + Token_1.Token[t]); //l(this._buff);
    }
    getToken() {
        this.checkSize(1);
        var t = this._buff.readUInt8(this._pos++);
        l("GET " + Token_1.Token[t]);
        return t;
    }
    ungetToken() {
        if (this._pos > 0) {
            --this._pos;
        }
    }
    putSize8(s) {
        this.adjustSize(1);
        this._buff.writeUInt8(s, this._pos++);
        l("PUT size8:" + s); //l(this._buff);
    }
    getSize8() {
        this.checkSize(1);
        var s = this._buff.readUInt8(this._pos++);
        l("GET size8:" + s);
        return s;
    }
    putSize16(s) {
        this.adjustSize(2);
        this._buff.writeUInt16BE(s, this._pos);
        this._pos += 2;
        l("PUT size16:" + s); //l(this._buff);
    }
    getSize16() {
        this.checkSize(2);
        var s = this._buff.readUInt16BE(this._pos);
        this._pos += 2;
        l("GET size16:" + s);
        return s;
    }
    putSize32(s) {
        this.adjustSize(4);
        this._buff.writeUInt32BE(s, this._pos);
        this._pos += 4;
        l("PUT size32:" + s); //l(this._buff);
    }
    getSize32() {
        this.checkSize(4);
        var s = this._buff.readUInt32BE(this._pos);
        this._pos += 4;
        l("GET size32:" + s);
        return s;
    }
}
exports.SerializedBuffer = SerializedBuffer;
//# sourceMappingURL=SerializedBuffer.js.map