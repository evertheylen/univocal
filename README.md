
<center>
<h1>Univocal</h1>
<b>Make your frontend, backend and database understand eachother.</b>
<br></br>
</center>


## Features

Univocal glues all the pieces of your full-stack Typescript app together.

  - **Serialization**: Serialize all data into understandable JSON, and deserialize back into a **perfect** copy. Very little limits on how your data looks like.
  - **Remote procedure calls** _(Coming soon!)_: Send complex operations between backend/frontend with perfect typing, error forwarding, and more. An understandable HTTP API comes free.
  - **ORM** _(Coming soon!)_: A smart ORM gets out of your way and lets you write queries extremely close to SQL but with perfect typing and useful extra semantics. Includes RLS, views, triggers and more.

All of the above features, while useful in their own right, work together to create an environment in which you can be very productive. Here are some examples:

  - Write your business logic once, run it everywhere. Make your app super responsive by running more in the client.
  - Put your backend on a crash diet. Basic CRUD operations and complex queries are already included in Univocal so you can focus on what matters.
  - Write powerful queries directly in the frontend, supported by a centralized security policy with row-level security.
  - Univocal can automatically solve N+1 problems and provides easy caching (and cache invalidation).


<!-- ## Show me code

```ts
// TODO
``` -->


## But what is Univocal really?

Many people would call it an ORM, and indeed much of work on Univocal deals with typical ORM features. But the serialization and RPC functionality are still crucial. Above all, Univocal is a set of tools to support a simple goal:

> *Provide a **strong** abstraction layer, shared by **all** parts of your app, while keeping things as **simple as possible**.*

  - **Strong**: support complex data types (nested objects, sets, maps, ...) and provide powerful ways to query and mutate that data. Allow extending functionality at every level.
  - **Shared**: If any part of your stack lacks support for a certain thing, it means you can't reliably use it at all and have to write custom code. The abstraction layer is only as strong as its weakest link.
  - **Simple**: No magic. Every part of your stack should be understandable and debuggable using standard tools.

Some examples:

  - Our queries are semantically identical to SQL. You won't need to learn *another* query language, it's basically syntax sugar that makes SQL typesafe. They support complex joins, expressions, subqueries and more. You can send them from frontend to backend to, with Row-Level Security.
  - No new declaration language for your types, Univocal will just analyze your Typescript types. And we won't replace `tsc` either.
  - Our serialized JSON is easy to inspect, and the HTTP API is easy to follow along. In fact, it's easy enough to implement without importing any Univocal library at all (in a microservice maybe).

No single feature of Univocal is unique, but it will give you a uniquely strong foundation to build upon.


## Progress

- [ ] JSON (de-)serializer
- [ ] Automatic Typescript analysis
- [ ] Operator and HTTP API
- [ ] ORM functionality
- [ ] (Better) frontend features (e.g. caching)
- [ ] More!

This is a work in progress. A previous unreleased version of Univocal is currently running in production, but I plan to clean up and redo some parts before I release it. All parts mentioned above (except automatic Typescript analysis) are in fact functioning right now.


