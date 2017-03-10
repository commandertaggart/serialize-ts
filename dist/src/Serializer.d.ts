/// <reference types="node" />
export interface SerializerData {
    properties: {
        [key: string]: string;
    };
    type: string;
}
export interface Serializable {
    serializerData: SerializerData;
    serializedSize(): number;
}
export interface SimpleConstructorClass {
    new (): Object;
}
export declare class Serializer {
    static blockSize: number;
    static toBuffer(object: Object): Buffer;
    static fromBuffer(buffer: Buffer): Object;
    static constructors: {
        [key: string]: SimpleConstructorClass;
    };
}
