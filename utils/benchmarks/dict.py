import time
import random
import string
from dataclasses import dataclass
from copy import deepcopy

@dataclass(frozen=True)
class SomeObject:
    a: str
    b: int
    c: list

def generate_random_strings(amount, length):
    strings = []
    for _ in range(amount):
        characters = string.ascii_letters + string.digits
        strings.append(''.join(random.choice(characters) for i in range(length)))
    return strings


def benchmark(name, func):
    elapsed_times = []
    for i in range(10):
        start_time = time.perf_counter()
        func()
        end_time = time.perf_counter()
        elapsed_times.append(end_time - start_time)
    return {"name": name, "avg time": sum(elapsed_times) / len(elapsed_times)}


def run_benchmarks():
    amount = 100_000
    strings = generate_random_strings(amount, 50)
    objects = []
    for s in strings:
        objects.append(SomeObject(
            a=s[:10],
            b=ord(s[11]),
            c=(s[11:20], (s[20:30],), s[30:])
        ))
    
    objects_copied = deepcopy(objects)

    results = []

    def dict_strings_test():
        m = {}
        for i, s in enumerate(strings):
            m[s] = i

        for i in range(len(strings) - 1, 0, -1):
            assert m[strings[i]] == i

    results.append(benchmark("dict strings", dict_strings_test))

    def dict_objects_test():
        m = {}
        for i, o in enumerate(objects):
            m[o] = i

        for i, o in reversed(list(enumerate(objects_copied))):
            assert m[o] == i

    results.append(benchmark("dict objects", dict_objects_test))

    print("{:<25} {:<15}".format("Name", "Time (s)"))
    print("-" * 40)
    for result in results:
        print("{:<25} {:<15.6f}".format(result["name"], result["avg time"]))
    
    print(f"\n=> Using objects is {results[1]["avg time"] / results[0]["avg time"]:.3f} times slower")
    # On my PC, this is ~7 times slower

run_benchmarks()
