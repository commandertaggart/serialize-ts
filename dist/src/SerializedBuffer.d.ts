/// <reference types="node" />
import { Token } from './Token';
export declare class ModeError extends Error {
    readOnly: boolean;
    constructor(readOnly: boolean);
}
export declare class OverrunError extends Error {
    requestedBytes: number;
    availableBytes: number;
    constructor(requestedBytes: number, availableBytes: number);
}
export declare class TokenError extends Error {
    requestedToken: Token;
    foundToken: Token;
    constructor(requestedToken: Token, foundToken: Token);
}
export declare class OversizeError extends Error {
    token: Token;
    constructor(token: Token);
}
export declare class SerializedBuffer {
    private _buff;
    private _blockSize;
    private _pos;
    constructor(blockSizeOrBuffer?: number | Buffer);
    toBuffer(): Buffer;
    private adjustSize(bytes);
    private checkSize(bytes);
    peekToken(): Token;
    private putNumber(t, v);
    private getNumber(t);
    putUInt8(v: number): void;
    getUInt8(): number;
    putInt8(v: number): void;
    getInt8(): number;
    putUInt16(v: number): void;
    getUInt16(): number;
    putInt16(v: number): void;
    getInt16(): number;
    putUInt32(v: number): void;
    getUInt32(): number;
    putInt32(v: number): void;
    getInt32(): number;
    putFloat(v: number): void;
    getFloat(): number;
    putDouble(v: number): void;
    getDouble(): number;
    putBoolean(b: boolean): void;
    getBoolean(): boolean;
    putString(s: string): void;
    getString(): string;
    putIdentifier(s: string): void;
    getIdentifier(): string;
    putToken(t: Token): void;
    getToken(): Token;
    ungetToken(): void;
    putSize8(s: number): void;
    getSize8(): number;
    putSize16(s: number): void;
    getSize16(): number;
    putSize32(s: number): void;
    getSize32(): number;
}
