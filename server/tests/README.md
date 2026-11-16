# Reading creation tests

Run from `server/`:

- `npm test`: HTTP route tests with real authentication middleware and a stubbed database client. No database or Google account is required.
- `npm run test:integration`: HTTP route tests against PostgreSQL configured by `server/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). Requires the existing `public.readings` and `public.cards` schema and permission to create temporary tables.

The integration suite copies the table definitions into connection-local temporary tables. All reading/card writes target those copies, and closing the connection removes them. It checks that public-table row counts are unchanged; run while other processes are not writing to the database so that check remains meaningful. Google services are not called.

Coverage includes authenticated ownership, complete saves, custom card positions, malformed card lists, rollback after the second card fails, and connection reuse after rollback. Route tests also cover commit failures, connection failures, rollback failures, and waiting for commit before returning success.

Duplicate retry protection and the Google login round trip are outside this stage.
