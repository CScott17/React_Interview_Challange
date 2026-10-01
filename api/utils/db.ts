import pg from "pg";

export type DbClient = pg.Client;

export const query = async (
  query: string,
  values: any[] = [],
): Promise<pg.QueryResult<any>> => {
  const { Client } = pg;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    return await client.query(query, values);
  } finally {
    await client.end();
  }
};

/**
 * Runs `work` inside a single DB transaction on one connection.
 * Commits on success, rolls back on any thrown error.
 */
export const withTransaction = async <T>(
  work: (client: DbClient) => Promise<T>,
): Promise<T> => {
  const { Client } = pg;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
};
