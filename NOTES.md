# Eurocamp Engineering Test Notes

## Task 1: Database review

After looking through the models and seed setup, my first impression is that the database is intentionally simple for the purpose of the exercise, but it is also the area with the clearest room for improvement if this were moving toward a real production system.

The biggest issue is that `bookings` is not really modelled as a relational table, even though it behaves like one conceptually. The `user` and `parc` fields are stored as plain strings rather than foreign keys, so there is nothing at the database level stopping a booking from referencing records that do not exist. That also makes joins, integrity checks, and cleanup more fragile than they need to be. If I were improving the schema properly, I would introduce `user_id` and `parc_id` as real foreign keys and model those relationships explicitly both in the database and in TypeORM.

I also noticed a few data modelling choices that are fine for a quick prototype but would not be my preference long term. `bookingdate` is stored as a string rather than a timestamp, which makes validation and date-based querying weaker. `users.email` has no uniqueness constraint, so duplicate identities are easy to create. The code also suggests that `comments` is optional, while the database column is not declared nullable, so the application model and persistence model are not perfectly aligned. None of these are dramatic in a small test project, but together they add up to a schema that would be hard to trust at scale.

Another thing I would change is the way IDs and schema changes are managed. All entities use manually assigned primary keys, whereas I would normally lean toward generated UUIDs for consistency and safety. I also noticed that the app relies on `synchronize: true`, which is convenient in development but not something I would want to depend on in a production workflow. I would switch to explicit migrations so schema changes are reviewable, reproducible, and safer across environments.

The seed data is also a good example of where relational discipline is missing. The booking factory generates random UUIDs for `user` and `parc`, but those values are not guaranteed to match real seeded users or parcs. That means the data may look populated while still being logically inconsistent. I also noticed the parc factory creates a numeric ID even though the model expects a string, which is another sign that the schema and seed setup are drifting apart.

If I were asked to improve this database in practice, my shortlist would be:

- add proper foreign keys and TypeORM relations for bookings
- change `bookingdate` to a real date/time type
- add a unique constraint on `users.email`
- make nullability explicit and consistent with the TypeScript model
- move from manual IDs to generated UUIDs
- replace `synchronize: true` with migrations
- make seed data reference real related records

Overall, I think the current database is completely understandable for a technical test, but if this were a real application I would want stronger referential integrity, better constraints, and a more realistic seed strategy before feeling comfortable with it.

## Task 2: Current backend practices I value

The main backend habit I value today is being explicit at the boundaries of the system. In practice, that means strong typing, clear request and response contracts, and validation as early as possible. I try not to rely on "well-formed input" as an assumption, especially once a service starts talking to other services or external clients.

I also think resilience matters much earlier than teams sometimes expect. If a system depends on another service, I want timeouts, sensible retries, and predictable error handling from the start. In this specific exercise, that is especially relevant because the API is intentionally flaky. For me, good backend code is not just code that works when everything is healthy; it is code that fails in a controlled and understandable way when dependencies misbehave.

Testing has also become much more valuable to me when it is tied to behavior rather than coverage for its own sake. I would rather have a few tests that prove the important things, such as retry behavior, cache invalidation, or error mapping, than a large suite of shallow tests that mostly mirror the implementation line by line. That tends to produce code that is easier to change with confidence.

Another practice I care about is observability. Even relatively small services become much easier to support when logs are structured, error messages are intentional, and there is a clear sense of what happened during a failed request. I do not think every exercise needs full tracing and metrics, but I do think the mindset matters: if something fails in production, the system should help you understand why.

Finally, I generally prefer simple architecture over impressive architecture. I like small abstractions that earn their place, and I try to avoid adding infrastructure or patterns just because they are fashionable. Caching is a good example of that. It can be extremely useful, but I prefer to add it where it solves a clear problem rather than treating it as a default requirement everywhere.

So, if I had to summarize my current backend approach in one sentence, it would be this: I try to build services that are typed, testable, resilient, and easy to reason about, without making them more complicated than the problem actually requires.
