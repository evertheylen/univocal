import { getObjectId } from "./object-id.js";

function _hash32_1a_fast_utf(str: string) {
  var c,i,l=str.length,t0=0,v0=0x9dc5,t1=0,v1=0x811c;

  for (i = 0; i < l; i++) {
    c = str.charCodeAt(i);
    if(c < 128){
      v0^=c;
    }else if(c < 2048){
      v0^=(c>>6)|192;
      t0=v0*403;t1=v1*403;
      t1+=v0<<8;
      v1=(t1+(t0>>>16))&65535;v0=t0&65535;
      v0^=(c&63)|128;
    }else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
      c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
      v0^=(c>>18)|240;
      t0=v0*403;t1=v1*403;
      t1+=v0<<8;
      v1=(t1+(t0>>>16))&65535;v0=t0&65535;
      v0^=((c>>12)&63)|128;
      t0=v0*403;t1=v1*403;
      t1+=v0<<8;
      v1=(t1+(t0>>>16))&65535;v0=t0&65535;
      v0^=((c>>6)&63)|128;
      t0=v0*403;t1=v1*403;
      t1+=v0<<8;
      v1=(t1+(t0>>>16))&65535;v0=t0&65535;
      v0^=(c&63)|128;
    }else{
      v0^=(c>>12)|224;
      t0=v0*403;t1=v1*403;
      t1+=v0<<8;
      v1=(t1+(t0>>>16))&65535;v0=t0&65535;
      v0^=((c>>6)&63)|128;
      t0=v0*403;t1=v1*403;
      t1+=v0<<8;
      v1=(t1+(t0>>>16))&65535;v0=t0&65535;
      v0^=(c&63)|128;
    }
    t0=v0*403;t1=v1*403;
    t1+=v0<<8;
    v1=(t1+(t0>>>16))&65535;v0=t0&65535;
  }

  return ((v1<<16)>>>0)+v0;
}


export function hash(obj: any, h: number = 0) {
  switch (typeof obj) {
    case 'boolean':
      h = (h + (obj ? 947 : 1657)) >>> 0;
      break;

    case 'number':
      if (Number.isInteger(obj) && obj < 4294967296) {
        h = (h + obj) >>> 0;
        break;
      }

    case 'bigint':  // or larger number
      h = (h + _hash32_1a_fast_utf(obj.toString(36))) >>> 0;
      break;
    
    case 'undefined':
      h = (h + 1877) >>> 0;
      break;

    case 'string':
      h = (h + _hash32_1a_fast_utf(obj)) >>> 0;
      break;

    case 'function':
    case 'symbol':
      h = (h + getObjectId(obj)) >>> 0;
      break;
    
    default:
      if (obj === null) {
        h = (h + 1949) >>> 0;
        break;
      }

      const proto = Object.getPrototypeOf(obj);
      // TODO: we don't support weird array hacks (a = []; a.foo = 'bar'; )
      if (proto === Array.prototype) {
        h = (h + 1237) >>> 0;
        for (const el of obj) {
          h = (hash(el, h) + 757) >>> 0;
        }
        h = (h + 1123) >>> 0;
        break;
      }

      h = (h + 1069) >>> 0;
      if (proto !== Object.prototype) {
        // assuming prototypes are not to be serialized per keys
        h = (h + getObjectId(proto) + 1549) >>> 0;
      }

      // string keys, then symbols
      for (const key of Object.getOwnPropertyNames(obj).toSorted()) {
        h = (h + _hash32_1a_fast_utf(key)) >>> 0;
        h = hash(obj[key], h);
        h = (h + 757) >>> 0;
      }

      // symbol keys
      for (const key of Object.getOwnPropertySymbols(obj).map(getObjectId).toSorted()) {
        h = (h + key) >>> 0;
        h = hash(obj[key], h);
        h = (h + 757) >>> 0;
      }

      h = (h + 457) >>> 0;
  }
  return h;
}
