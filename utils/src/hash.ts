import { getObjectId } from "./object-id.js";

// Adapted from https://github.com/tjwebb/fnv-plus/blob/master/index.js
// fnv-plus, MIT license, written by https://github.com/desudesutalk

const hl: string[] = [];
for (let i=0; i < 256; i++) {
  hl[i] = ((i >> 4) & 15).toString(16) + (i & 15).toString(16);
}

function makeFnv1aHasher () {
  var t0=0, v0=0x2325, t1=0, v1=0x8422, t2=0, v2=0x9ce4, t3=0, v3=0xcbf2;
  var i: number, c, l;

  const ingest11Bits = (c: number) => {
    // small part of below
    if (c < 128) {
      v0^=c;
    } else {
      v0^=(c>>6)|192;
      t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
      t2+=v0<<8;t3+=v1<<8;
      t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
      v0^=(c&63)|128;
    }
  }

  const ingestStr = (str: string) => {
    l = str.length;
    for (i = 0; i < l; i++) {
      c = str.charCodeAt(i);
      if (c < 128) {
        v0^=c;
      } else if (c < 2048) {
        v0^=(c>>6)|192;
        t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
        t2+=v0<<8;t3+=v1<<8;
        t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
        v0^=(c&63)|128;
      } else if (((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)) {
        c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
        v0^=(c>>18)|240;
        t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
        t2+=v0<<8;t3+=v1<<8;
        t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
        v0^=((c>>12)&63)|128;
        t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
        t2+=v0<<8;t3+=v1<<8;
        t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
        v0^=((c>>6)&63)|128;
        t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
        t2+=v0<<8;t3+=v1<<8;
        t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
        v0^=(c&63)|128;
      } else {
        v0^=(c>>12)|224;
        t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
        t2+=v0<<8;t3+=v1<<8;
        t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
        v0^=((c>>6)&63)|128;
        t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
        t2+=v0<<8;t3+=v1<<8;
        t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
        v0^=(c&63)|128;
      }
      t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
      t2+=v0<<8;t3+=v1<<8;
      t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
    }
  }

  const getHash = () => {
    return hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255];
  }

  return { ingest11Bits, ingestStr, getHash };
}


const PRIMES = {
  true: 947,
  false: 1657,
  undefined: 1877,
  null: 1949,
  startObj: 1069,
  endObj: 457,
  protoObj: 1549,
  nextProp: 757,
  startArray: 1237,
  endArray: 1123,
};


function _hash(obj: any, hasher: ReturnType<typeof makeFnv1aHasher>) {
  switch (typeof obj) {
    case 'boolean':
      hasher.ingest11Bits(obj ? 947 : 1657);
      break;

    case 'number':
      if (obj < 2048) {
        hasher.ingest11Bits(obj);
        break
      }

    case 'bigint':  // or larger number
      hasher.ingestStr(obj.toString(36));
      break;
    
    case 'undefined':
      hasher.ingest11Bits(1877);
      break;

    case 'string':
      hasher.ingestStr(obj);
      break;

    case 'function':
    case 'symbol':
      hasher.ingestStr(getObjectId(obj));
      break;
    
    default:
      if (obj === null) {
        hasher.ingest11Bits(1949);
        break;
      }

      const proto = Object.getPrototypeOf(obj);
      // TODO: we don't support weird array hacks (a = []; a.foo = 'bar'; )
      if (proto === Array.prototype) {
        hasher.ingest11Bits(1237);
        for (const el of obj) {
          _hash(el, hasher);
          hasher.ingest11Bits(757);
        }
        hasher.ingest11Bits(1123);
        break;
      }

      hasher.ingest11Bits(1069);
      if (proto !== Object.prototype) {
        // assuming prototypes are not to be serialized per keys
        hasher.ingestStr(getObjectId(proto));
        hasher.ingest11Bits(1549);
      }

      // string keys, then symbols
      for (const key of Object.getOwnPropertyNames(obj).toSorted()) {
        hasher.ingestStr(key);
        _hash(obj[key], hasher);
        hasher.ingest11Bits(757);
      }

      // symbol keys
      for (const key of Object.getOwnPropertySymbols(obj).map(getObjectId).toSorted()) {
        hasher.ingestStr(key);
        _hash(obj[key], hasher);
        hasher.ingest11Bits(757);
      }

      hasher.ingest11Bits(457);
  }
}

export function hash(obj: any) {
  const hasher = makeFnv1aHasher();
  _hash(obj, hasher);
  return hasher.getHash();
}
