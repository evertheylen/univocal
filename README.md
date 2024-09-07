
<center>
<h1>Univocal</h1>
<b>Make your frontend, backend and database speak the same language.</b>
<br></br>
</center>


## Features

Univocal glues all the pieces of your full-stack Typescript app together.

  - **Serialization**: Serialize all data into understandable JSON, and deserialize back into a **perfect** copy. Very little limits on how your data looks like.
  - **Remote procedure calls**: Send complex operations between backend/frontend with perfect typing, error forwarding, automatic retries, and more. An understandable HTTP API comes free.
  - **ORM**: A smart ORM gets out of your way and lets you write queries extremely close to SQL but with perfect typing and useful extra semantics. Includes RLS, views, triggers and more.

All of the above features, while useful in their own right, work together to create an environment in which programmers can be considerably more productive. Here are some examples:

  - Write your business logic once, run it everywhere. Make your app super responsive by running more in the client.
  - Put your backend on a crash diet. Basic CRUD operations are already included in Univocal so you can focus on what matters.
  - Write powerful queries directly in the frontend, supported by a centralized security policy with row-level security.
  - Univocal can automatically solve N+1 problems and provides easy caching (and cache invalidation).


## Show me code

```ts

```


## But what is Univocal really?

Most people would call it an ORM, and indeed most of the work on Univocal deals with typical ORM features. But the serialization and RPC functionality are still crucial. Above all, Univocal is a set of tools to support a simple goal: *provide a **strong** abstraction layer, shared by **all** parts of your app*.

  - **Strong**: support complex data types (nested objects, sets, maps, ...) and provide powerful ways to query and mutate that data. We strive to support everything that can be expressed in both Javascript and SQL.
  - **Shared**: If any part of your stack lacks support for a certain thing, it means you can't reliably use it at all and have to write custom code. The abstraction layer is only as strong as its weakest link.

On top of that, Univocal does not try to reinvent the wheel:

  - No new declaration language. Typescript types work just fine.
  - No new query language/API. Univocal essentially uses SQL queries with Typescript syntax.
  - No hard-to-debug trickery. Our JSON is easy to inspect, without swapping your Typescript compiler or Babel weirdness.

No single feature of Univocal is unique, but it will give you a uniquely strong foundation to build upon.


