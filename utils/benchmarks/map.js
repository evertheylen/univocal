import { Bench } from 'tinybench'
import { UvMap } from '../dist/map.js';

const bench = new Bench({ name: 'Compare Map with UvMap', iterations: 10 });
const amount = 100_000;

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const strings = [];
for (let i=0; i<amount; i++) {
  strings.push(generateRandomString(100));
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
console.table(bench.table((task) => ({
  name: task.name,
  // dividing throughput as it is unclear which unit others use
  'Time (s)': 1/task.result.throughput.mean
})))

/*
  Results:
    1. node, Map with strings:     ~0.014s
    2. python, dict strings:        ~0.016s
    3. node, UvMap with strings:  ~0.029s
    4. python, dict with objects:  ~0.10s
    5. node, UvMap with objects:  ~0.33s

Node = v23.9.0
Python = 3.13.2
Ran on Arch in Podman on Fedora, 6.13.10-200.fc41.x86_64
*/
