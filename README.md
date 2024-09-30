
<h1 align="center"><strong>🌐 Univocal</strong></h1>
<p align="center"><strong><em>Make your frontend, backend and database understand eachother.</em></strong></p>
<br></br>


## Work in progress

- [ ] JSON (de-)serializer
- [ ] Automatic Typescript analysis
- [ ] Operator and HTTP API
- [ ] ORM functionality
- [ ] (Better) frontend features (e.g. caching, Solid.js support)
- [ ] More!

A previous unreleased version of Univocal is currently running in production, but I plan to clean up and redo some parts before I release it. All parts mentioned above (except automatic Typescript analysis) do already exist—uglier than I would like, but functional.


## Key Features

  - **Serialization**:
    - Serialize all data into understandable JSON
    - Deserialize back into an *identical* copy
    - Very little limits on how your data looks like
  - **Remote procedure calls**:
    - Send complex operations between backend/frontend with *perfect typing*
    - Simple HTTP API (you could implement it without Univocal if needed)
    - Error forwarding, simple authorization system
  - **ORM/query builder**:
    - Write queries like you would in SQL, but with perfect typing
    - Useful extra semantics to manage tables and their relations
    - Use Row-Level Security and send queries from the frontend!

All of the above features, while useful in their own right, provide the necessary glue that makes all parts of your app work together. Here are some examples:

  - Save time, don't write boring CRUD endpoints.
  - Write your business logic once, run it everywhere.
  - Simplify your security policy in one centralized, declarative place.
  - Make your app super responsive by running more in the client.
  - Automatically handle problems across your entire stack (eg. N+1 queries, caching)


## Code examples

```ts
// Coming soon!

```


## But what is Univocal really?

Many people would call it an ORM, and indeed much of work on Univocal deals with typical ORM features. But the serialization and RPC functionality are still crucial. No single feature of Univocal is unique, but it will give you a uniquely strong foundation to build upon.

Above all, Univocal is a set of tools to support a simple goal:

> *Provide a **strong** abstraction layer, shared by **all** parts of your app, while keeping things as **simple as possible**.*

  - **Strong**: support complex data types (nested objects, sets, maps, ...) and provide powerful ways to query and mutate that data. Allow extending functionality at every level.

    <!-- <details>
    <summary>Examples</summary>
    - Serialize something crazy like a `Set<string[] | {foo: Bar} | Date>`
    - *Store* all kinds of data, including polymorphic objects, nested data, large maps, ...
    - Express complex queries with JOINs, subqueries, arbitrary expressions, polymorphic data, ...
    - Add your own operations to run transactions, proprietary algorithms, and more.
    </details> -->

  - **Shared**: If any part of your stack lacks support for a certain thing, it means you can't reliably use it at all. The abstraction layer is only as strong as its weakest link.

    <!-- <details>
    <summary>Examples</summary>
    - Operations can be ran on the frontend, sent to a backend, maybe even both! (And of course, a query is just very fancy operation)
    - Reuse the (de)serialization functionality to store stuff in `window.localStorage`.
    - N+1 queries can be solved, from frontend all the way to your database!
    </details> -->

  - **Simple**: No magic. Every part of your stack should be understandable and debuggable using standard tools.

<!-- Some examples:

  - Our queries are semantically identical to SQL. You won't need to learn *another* query language, it's basically syntax sugar that makes SQL typesafe. They support complex joins, expressions, subqueries and more. You can send them from frontend to backend to, with Row-Level Security.
  - No new declaration language for your types, Univocal will just analyze your Typescript types. And we won't replace `tsc` either.
  - Our serialized JSON is easy to inspect, and the HTTP API is easy to follow along. In fact, it's easy enough to implement without importing any Univocal library at all (in a microservice maybe). -->
