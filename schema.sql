-- This script contains the SQL command to create the 'faucet_claims' table.
-- To execute, copy this command and run it in the "Query" tab of your
-- Vercel Postgres database dashboard.

CREATE TABLE faucet_claims (
    id SERIAL PRIMARY KEY,
    fid INTEGER NOT NULL UNIQUE,
    last_claimed_at TIMESTAMP NOT NULL
);

-- This command creates a table with three columns:
-- 1. 'id': A unique number for each entry.
-- 2. 'fid': The Farcaster User ID. It's marked as UNIQUE to ensure one user can't have multiple entries.
-- 3. 'last_claimed_at': A timestamp recording when the user last claimed from the faucet.
