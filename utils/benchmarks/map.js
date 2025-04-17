import { Bench } from 'tinybench'
import { UvMap } from '../dist/map.js';

const bench = new Bench({ name: 'Compare Map with UvMap' });
const amount = 100_000;

const strings = [];
for (let i=0; i<amount; i++) {
  strings.push(Math.random().toString(36) + Math.random().toString(36) + Math.random().toString(36) + Math.random().toString(36) + Math.random().toString(36) + Math.random().toString(36));
}

bench.add('native Map', () => {
  const m = new Map();
  for (let i=0; i<strings.length; i++) {
    m.set(strings[i], i);
  }

  for (let i=strings.length-1; i>0; i--) {
    if (m.get(strings[i]) !== i) {
      throw new Error("Wrong!");
    }
  }
});

bench.add('UvMap with strings', async () => {
  const m = new UvMap();
  for (let i=0; i<strings.length; i++) {
    m.set(strings[i], i);
  }

  for (let i=strings.length-1; i>0; i--) {
    if (m.get(strings[i]) !== i) {
      throw new Error("Wrong!");
    }
  }
});

bench.add('UvMap with objects', async () => {
  const m = new UvMap();
  for (let i=0; i<strings.length; i++) {
    m.set({name: strings[i]}, i);
  }

  for (let i=strings.length-1; i>0; i--) {
    if (m.get({name: strings[i]}) !== i) {
      throw new Error("Wrong!");
    }
  }
});

await bench.run()

console.log(bench.name)
console.table(bench.table())

