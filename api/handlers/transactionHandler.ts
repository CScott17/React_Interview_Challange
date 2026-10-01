import { withTransaction, DbClient } from "../utils/db";

const MAX_WITHDRAWAL_AMOUNT = 200;
const MAX_DAILY_WITHDRAWAL_AMOUNT = 400;
const MAX_DEPOSIT_AMOUNT = 1000;
const BILL_INCREMENT = 5;

export class TransactionError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const check = (condition: boolean, message: string) => {
  if (!condition) throw new TransactionError(message);
};

const checkWholeDollars = (amount: number) =>
  check(Number.isInteger(amount) && amount > 0, "Amount must be a whole dollar amount greater than $0.");

const getAccount = async (client: DbClient, accountID: string) => {
  const result = await client.query(
    `SELECT account_number, name, amount, type, credit_limit,
            CASE WHEN last_withdrawal_date = CURRENT_DATE
                 THEN total_withdrawn_today ELSE 0 END AS total_withdrawn_today
     FROM accounts
     WHERE account_number = $1
     FOR UPDATE`,
    [accountID],
  );

  if (result.rowCount === 0) throw new TransactionError("Account not found.", 404);
  return result.rows[0];
};

const updateAccount = async (client: DbClient, accountID: string, amount: number, totalWithdrawnToday: number) =>
  (
    await client.query(
      `UPDATE accounts
       SET amount = $1, total_withdrawn_today = $2, last_withdrawal_date = CURRENT_DATE
       WHERE account_number = $3
       RETURNING account_number, name, amount, type, credit_limit`,
      [amount, totalWithdrawnToday, accountID],
    )
  ).rows[0];

export const withdrawal = async (accountID: string, amount: number) => {
  checkWholeDollars(amount);
  check(amount <= MAX_WITHDRAWAL_AMOUNT, `Maximum withdrawal is $${MAX_WITHDRAWAL_AMOUNT}.`);
  check(amount % BILL_INCREMENT === 0, `Withdrawals must be in multiples of $${BILL_INCREMENT}.`);

  return withTransaction(async (client) => {
    const account = await getAccount(client, accountID);

    check(
      account.total_withdrawn_today + amount <= MAX_DAILY_WITHDRAWAL_AMOUNT,
      `Daily withdrawal limit is $${MAX_DAILY_WITHDRAWAL_AMOUNT}.`,
    );

    const isCredit = account.type === "credit";
    const available = isCredit ? account.amount + (account.credit_limit ?? 0) : account.amount;

    check(
      amount <= available,
      isCredit
        ? `Withdrawal exceeds credit limit. Available credit: $${available}.`
        : `Insufficient funds. Available balance: $${available}.`,
    );

    return updateAccount(client, accountID, account.amount - amount, account.total_withdrawn_today + amount);
  });
};

export const deposit = async (accountID: string, amount: number) => {
  checkWholeDollars(amount);
  check(amount <= MAX_DEPOSIT_AMOUNT, `Maximum deposit is $${MAX_DEPOSIT_AMOUNT}.`);

  return withTransaction(async (client) => {
    const account = await getAccount(client, accountID);

    check(
      account.type !== "credit" || account.amount + amount <= 0,
      `You can deposit up to $${Math.max(-account.amount, 0)}.`,
    );

    return updateAccount(client, accountID, account.amount + amount, account.total_withdrawn_today);
  });
};