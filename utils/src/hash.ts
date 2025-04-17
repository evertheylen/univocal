import { getObjectId } from "./object-id.js";

// Adapted from https://github.com/tjwebb/fnv-plus/blob/master/index.js
// fnv-plus, MIT license, written by https://github.com/desudesutalk

const hl: string[] = [];
for (let i=0; i < 256; i++) {
  hl[i] = ((i >> 4) & 15).toString(16) + (i & 15).toString(16);
}

function _hash64_1a_fast_utf(str: string){
  var c,i,l=str.length,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;

  for (i = 0; i < l; i++) {
    c = str.charCodeAt(i);
    if(c < 128){
      v0^=c;
    }else if(c < 2048){
      v0^=(c>>6)|192;
      t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
      t2+=v0<<8;t3+=v1<<8;
      t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
      v0^=(c&63)|128;
    }else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
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
    }else{
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

  return hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255];
}

function stableOwnKeys(obj: object) {
  return [
    ...Object.getOwnPropertyNames(obj).toSorted(),
    ...Object.getOwnPropertySymbols(obj).sort((a, b) => getObjectId(a).localeCompare(getObjectId(b)))
  ];
}


export function hash(obj: any): string {
  switch (typeof obj) {
    case 'boolean': return obj ? '[' : ']';
    case 'number':
    case 'bigint': return _hash64_1a_fast_utf(obj.toString(36));
    case 'undefined': return '#';
    case 'string': return _hash64_1a_fast_utf(obj);

    case 'function':
    case 'symbol':
      return getObjectId(obj);
    
    default:
      if (obj === null) return '@';
      let s = '{';
      const proto = Object.getPrototypeOf(obj);
      if (proto !== Object.prototype) {
        // assuming prototypes are not to be serialized per keys
        s += getObjectId(proto);
        s += '!';
      }

      const keys = Reflect.ownKeys(obj);
      const keysWithHashes = keys.map(k => [k, hash(k)] as const);
      keysWithHashes.sort(([a, aHash], [b, bHash]) => aHash.localeCompare(bHash));
      
      for (const [k, kHash] of keysWithHashes) {
        s += hash(k);
        s += hash(obj[k]);
        s += ',';
      }

      s += '}';
      return _hash64_1a_fast_utf(s);
  }
}
