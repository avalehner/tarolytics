# Reading creation and retry tests

Run from `server/`:

- `npm test`: HTTP route tests with real authentication middleware and a stubbed database client. No database or Google account is required.
- `npm run test:integration`: HTTP route tests against PostgreSQL configured by `server/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). Requires existing `public.readings` and `public.cards` tables and permission to create a disposable schema.

The integration suite creates a randomly named `test_readings_*` schema containing copies of the table definitions, fixture users, and the actual request-ID migration. All test writes use that schema, which is dropped afterward. Four pooled connections exercise concurrent requests against a shared schema. The suite checks public reading/card counts are unchanged; avoid unrelated application writes during the run. Google services are not called. The application migration does not need to have been applied first.

Coverage includes authentication, request validation, complete saves, custom positions, rollback on reading/card failure, connection cleanup, waiting for commit, identical retries, changed-payload conflicts, JSON normalization, simultaneous requests, a response lost after commit, account isolation, intentionally new IDs, and retries after deletion or later edits.

From `client/`, run `npm test` for draft persistence and request-ID tests (Node 22.18+ or Node 24). These use Node's TypeScript stripping and require no browser or database. They cover reloads, immutable retry payloads, account changes, fresh IDs, legacy drafts, malformed pending IDs, unavailable storage, and manual/pulled/custom card payloads.

The actual Google sign-in round trip is not part of these tests.
