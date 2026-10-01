import express, { Request, Response } from "express";
import Joi, { Schema } from "joi";
import { deposit, withdrawal, TransactionError } from "../handlers/transactionHandler";

const router = express.Router();

const transactionSchema: Schema = Joi.object({
  amount: Joi.number().integer().positive().required().messages({
    "number.base": "Amount must be a number.",
    "number.integer": "Enter a whole-dollar amount.",
    "number.positive": "Amount must be greater than $0.",
    "any.required": "Amount is required.",
  }),
});

type TransactionFn = (accountID: string, amount: number) => Promise<unknown>;

const handleTransaction = (transaction: TransactionFn) =>
  async (request: Request, response: Response) => {
    const { error } = transactionSchema.validate(request.body);

    if (error) {
      return response.status(400).send({ error: error.details[0].message });
    }

    try {
      const updatedAccount = await transaction(request.params.accountID, request.body.amount);
      return response.status(200).send(updatedAccount);
    } catch (err) {
      if (err instanceof TransactionError) {
        return response.status(err.status).send({ error: err.message });
      }
      console.error(err);
      return response.status(500).send({ error: "Transaction failed. Please try again." });
    }
  };

router.put("/:accountID/withdraw", handleTransaction(withdrawal));
router.put("/:accountID/deposit", handleTransaction(deposit));

export default router;
