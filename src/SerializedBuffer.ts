
import { Token } from './Token';

var l:Function = (...args) => {};
//var l:Function = console.log.bind(console);

let T = [];
T[Token.UINT8]	= { s:1, b:'UInt8' };
T[Token.INT8]	= { s:1, b:'Int8' };
T[Token.UINT16]	= { s:2, b:'UInt16BE' };
T[Token.INT16]	= { s:2, b:'Int16BE' };
T[Token.UINT32]	= { s:4, b:'UInt32BE' };
T[Token.INT32]	= { s:4, b:'Int32BE' };
//T[Token.UINT64]	= { s:8, b:'UIntBE' };
//T[Token.INT64]	= { s:8, b:'IntBE' };
T[Token.FLOAT]	= { s:4, b:'FloatBE' };
T[Token.DOUBLE]	= { s:8, b:'DoubleBE' };

export class ModeError extends Error
{
	constructor(public readOnly:boolean)
	{
		super(readOnly?
			"SerializedBuffer is in read mode, but a write was attempted.":
			"SerializedBuffer is in write mode, but a read was attempted.");
	}
}

export class OverrunError extends Error
{
	constructor(public requestedBytes:number,
				public availableBytes:number)
	{
		super("Wanted to read " + requestedBytes + " bytes, but only " +
				availableBytes + " bytes available.");
	}
}

export class TokenError extends Error
{
	constructor(public requestedToken:Token,
				public foundToken:Token)
	{
		super("Requested read of token type " + Token[requestedToken] +
			" but found token type " + Token[foundToken]);
	}
}

export class OversizeError extends Error
{
	constructor(public token:Token)
	{
		super("Token type " + Token[token] + " is too big.");
	}
}

export class SerializedBuffer
{
	private _buff:Buffer;
	private _blockSize:number;
	private _pos:number;

	constructor(blockSizeOrBuffer?:number|Buffer)
	{
		if (blockSizeOrBuffer instanceof Buffer)
		{
			this._blockSize = 0;
			this._buff = blockSizeOrBuffer;
		}
		else
		{
			this._blockSize = blockSizeOrBuffer || 1024;
			this._buff = Buffer.allocUnsafe(this._blockSize);
		}
		this._pos = 0;
		l("Block size: " + this._blockSize);
	}

	public toBuffer():Buffer
	{
		return Buffer.allocUnsafe(this._pos).fill(this._buff, 0, this._pos);
	}

	private adjustSize(bytes:number)
	{
		if (this._blockSize === 0)
		{ throw new ModeError(true); }

		if (this._buff.length < (this._pos + bytes))
		{
			var adjust:number = this._blockSize * Math.ceil(bytes / this._blockSize);
			this._buff = Buffer.allocUnsafe(this._buff.length + adjust).fill(this._buff, 0, this._pos);
			l("adjustSize(" + bytes + " + " + this._pos + "): " + (this._buff.length-adjust) + " += " + adjust);
		}
	}

	private checkSize(bytes:number)
	{
		if (this._blockSize > 0)
		{ throw new ModeError(false); }

		if (this._buff.length < (this._pos + bytes))
		{
			throw new OverrunError(bytes, this._buff.length - this._pos);
		}
	}

	public peekToken():Token
	{
		if ((this._pos+1) < this._buff.length)
		{
			return <Token>this._buff.readUInt8(this._pos);
		}
		else
		{ return Token.EOF; }
	}

	private putNumber(t:Token, v:number)
	{
		l("PUT number(" + Token[t] + "):" + v);
		this.adjustSize(T[t].s+1);
		this._buff.writeUInt8(t, this._pos++);
		this._buff["write" + T[t].b](v, this._pos);
		this._pos += T[t].s;
		//l(this._buff);
	}
	private getNumber(t:Token):number
	{
		this.checkSize(T[t].s+1);
		let pt:Token = this.peekToken();
		if (pt === t) { ++this._pos; }
		else { throw new TokenError(t, pt); }
		var n:number = this._buff["read" + T[t].b](this._pos);
		this._pos += T[t].s;
		l("GET number(" + Token[t] + "):" + n);
		return n;
	}

	public putUInt8(v:number)
	{ this.putNumber(Token.UINT8, v); }
	public getUInt8():number
	{ return this.getNumber(Token.UINT8); }

	public putInt8(v:number)
	{ this.putNumber(Token.INT8, v); }
	public getInt8():number
	{ return this.getNumber(Token.INT8); }

	public putUInt16(v:number)
	{ this.putNumber(Token.UINT16, v); }
	public getUInt16():number
	{ return this.getNumber(Token.UINT16); }

	public putInt16(v:number)
	{ this.putNumber(Token.INT16, v); }
	public getInt16():number
	{ return this.getNumber(Token.INT16); }

	public putUInt32(v:number)
	{ this.putNumber(Token.UINT32, v); }
	public getUInt32():number
	{ return this.getNumber(Token.UINT32); }

	public putInt32(v:number)
	{ this.putNumber(Token.UINT32, v); }
	public getInt32():number
	{ return this.getNumber(Token.UINT32); }

//	public putUInt64(v:number)
//	{ this.putNumber(Token.UINT64, v); }
//	public getUInt64():number
//	{ return this.getNumber(Token.UINT64); }

//	public putInt64(v:number)
//	{ this.putNumber(Token.INT64, v); }
//	public getInt64():number
//	{ return this.getNumber(Token.INT64); }

	public putFloat(v:number)
	{ this.putNumber(Token.FLOAT, v); }
	public getFloat():number
	{ return this.getNumber(Token.FLOAT); }

	public putDouble(v:number)
	{ this.putNumber(Token.DOUBLE, v); }
	public getDouble():number
	{ return this.getNumber(Token.DOUBLE); }

	public putBoolean(b:boolean)
	{ this.putToken(b?Token.TRUE:Token.FALSE); }
	public getBoolean():boolean
	{
		var t:Token = this.getToken();
		if (t == Token.TRUE)
		{ return true; }
		else if (t == Token.FALSE)
		{ return false; }
		else
		{ throw new TokenError(Token.TRUE, t); }
	}

	public putString(s:string)
	{
		var length:number = Buffer.byteLength(s, 'utf8');
		if (length > 0xFFFF)
		{ throw new OversizeError(Token.STRING); }

		this.adjustSize(length + 3);
		this._buff.writeUInt8(Token.STRING, this._pos++);
		this._buff.writeUInt16BE(length, this._pos);
		this._pos += 2;
		this._buff.write(s, this._pos, length, 'utf8');
		this._pos += length;
		l("PUT string:" + s); //l(this._buff);
	}

	public getString():string
	{
		this.checkSize(5);
		let s:Token = this.peekToken();
		if (s === Token.STRING) { ++this._pos; }
		else { throw new TokenError(Token.STRING, s); }
		let len:number = this._buff.readUInt16BE(this._pos);
		this._pos += 2;

		this.checkSize(len);
		var v:string = this._buff.toString('utf8', this._pos, this._pos += len);
		l("GET string:" + v);
		return v;
	}

	public putIdentifier(s:string)
	{
		var length:number = Buffer.byteLength(s, 'utf8');
		if (length > 0xFF)
		{ throw new OversizeError(Token.STRING); }

		this.adjustSize(length + 1);
		this._buff.writeUInt8(length, this._pos++);
		this._buff.write(s, this._pos, length, 'utf8');
		this._pos += length;
		l("PUT id(" + length + "):" + s); //l(this._buff);
	}

	public getIdentifier():string
	{
		this.checkSize(1);
		let len:number = this._buff.readUInt8(this._pos++);

		this.checkSize(len);
		var v:string = this._buff.toString('utf8', this._pos, this._pos += len);
		l("GET id(" + len + "):" + v);
		return v;
	}

	public putToken(t:Token)
	{
		this.adjustSize(1);
		this._buff.writeUInt8(t, this._pos++);
		l("PUT " + Token[t]); //l(this._buff);
	}

	public getToken():Token
	{
		this.checkSize(1);
		var t:Token = <Token>this._buff.readUInt8(this._pos++);
		l("GET " + Token[t]);
		return t;
	}

	public ungetToken()
	{
		if (this._pos > 0)
		{ --this._pos; }
	}

	public putSize8(s:number)
	{
		this.adjustSize(1);
		this._buff.writeUInt8(s, this._pos++);
		l("PUT size8:" + s); //l(this._buff);
	}

	public getSize8():number
	{
		this.checkSize(1);
		var s:number = this._buff.readUInt8(this._pos++);
		l("GET size8:" + s);
		return s;
	}

	public putSize16(s:number)
	{
		this.adjustSize(2);
		this._buff.writeUInt16BE(s, this._pos);
		this._pos += 2;
		l("PUT size16:" + s); //l(this._buff);
	}

	public getSize16():number
	{
		this.checkSize(2);
		var s:number = this._buff.readUInt16BE(this._pos);
		this._pos += 2;
		l("GET size16:" + s);
		return s;
	}

	public putSize32(s:number)
	{
		this.adjustSize(4);
		this._buff.writeUInt32BE(s, this._pos);
		this._pos += 4;
		l("PUT size32:" + s); //l(this._buff);
	}

	public getSize32():number
	{
		this.checkSize(4);
		var s:number = this._buff.readUInt32BE(this._pos);
		this._pos += 4;
		l("GET size32:" + s);
		return s;
	}
}
