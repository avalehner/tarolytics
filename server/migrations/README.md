# Reading save request migration

From `server/`, run `npm run migrate` using that environment's database configuration in `.env`. Apply the migration before starting/deploying the updated backend, then deploy the matching frontend. This command is safe to rerun and wraps the migration in a transaction.

The migration role needs permission to create a table and reference `users(id)` and `readings(id)`. If the application's role lacks those permissions, run the migration as the existing table owner (for example, `DB_USER=<owner> npm run migrate`, supplying that role's credentials through the environment). Then grant the runtime role access to the new table from an owner connection:

```sql
GRANT SELECT, INSERT, UPDATE ON reading_save_requests TO your_application_role;
```

Use the actual database role name in place of `your_application_role`. This keeps schema-management privileges separate from the application's normal access.

`001_reading_save_requests.sql` adds a table with:

- `(user_id, request_id)` as the primary key: one saved result per account/request UUID, even across simultaneous requests or server restarts.
- `payload_hash`: the SHA-256 fingerprint of the original normalized request. Reusing an ID for changed content returns HTTP 409.
- `reading_id`: the saved reading. Deleting that reading sets this reference to NULL, retaining a tombstone so an old request returns HTTP 410 instead of recreating it.
- `created_at`: when the request was recorded.

The request row, reading, and cards commit together. A rolled-back save leaves no request row, so the same request can be retried. Existing readings are unchanged and do not need backfilling. Do not periodically delete completed request rows: doing so would remove duplicate protection for old retries. Account deletion cascades to its request records.

The frontend persists the request UUID, account ID and original payload in the existing `sessionStorage` draft **before** sending. An unconfirmed save is retried with that exact snapshot; the form remains read-only until resolved. A different logged-in account cannot resubmit that pending save. No authentication tokens are stored in the draft. Session storage survives reloads and the same-tab Google login redirect; this is not cross-device or closed-tab draft recovery.

A new submission returns HTTP 201; a matching retry returns HTTP 200 and the saved reading. HTTP 400 validation failures happen before writes and let the frontend unlock the form. Network/500 failures keep the snapshot. HTTP 401 prompts login without dropping the ID. Successful confirmation removes the pending draft, and an intentional new reading receives a new UUID.
