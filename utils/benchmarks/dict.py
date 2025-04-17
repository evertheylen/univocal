import time
import random
import string
from dataclasses import dataclass

@dataclass(frozen=True)
class NameObject:
    name: str

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
    strings = generate_random_strings(amount, 100)

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
        for i, s in enumerate(strings):
            m[NameObject(name=s)] = i

        for i in range(len(strings) - 1, 0, -1):
            assert m[NameObject(name=strings[i])] == i

    results.append(benchmark("dict objects", dict_objects_test))

    print("{:<25} {:<15}".format("Name", "Time (s)"))
    print("-" * 40)
    for result in results:
        print("{:<25} {:<15.6f}".format(result["name"], result["avg time"]))
    
    print(f"\n=> Using objects is {results[1]["avg time"] / results[0]["avg time"]:.3f} times slower")
    # On my PC, this is ~7 times slower

run_benchmarks()
