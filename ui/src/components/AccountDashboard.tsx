import React, { useState } from "react";
import { account } from "../Types/Account";
import Paper from "@mui/material/Paper/Paper";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";

type AccountDashboardProps = {
  account: account;
  signOut: () => Promise<void>;
};

type Message = {
  severity: "success" | "error";
  text: string;
};

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [account, setAccount] = useState(props.account);
  const [message, setMessage] = useState<Message | undefined>(undefined);

  const { signOut } = props;

  const submitTransaction = async (
    transaction: "deposit" | "withdraw",
    amount: number,
  ) => {
    setMessage(undefined);
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    };
    try {
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/${transaction}`,
        requestOptions,
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage({
          severity: "error",
          text: data.error ?? "Transaction failed.",
        });
        return;
      }

      setAccount({
        accountNumber: data.account_number,
        name: data.name,
        amount: data.amount,
        type: data.type,
        creditLimit: data.credit_limit,
      });
      setMessage({
        severity: "success",
        text:
          transaction === "deposit"
            ? `Deposited $${amount}.`
            : `Withdrew $${amount}.`,
      });
    } catch {
      setMessage({
        severity: "error",
        text: "Unable to reach the server. Please try again.",
      });
    }
  };

  const depositFunds = () => submitTransaction("deposit", depositAmount);
  const withdrawFunds = () => submitTransaction("withdraw", withdrawAmount);

  return (
    <Paper className="account-dashboard">
      <div className="dashboard-header">
        <h1>Hello, {account.name}!</h1>
        <Button variant="contained" onClick={signOut}>Sign Out</Button>
      </div>
      <h2>Balance: ${account.amount}</h2>
      {account.type === "credit" && (
        <p className="credit-info">
          Credit limit: ${account.creditLimit} · Available credit: ${account.creditLimit + account.amount}
        </p>
      )}
      {message && (
        <Alert
          severity={message.severity}
          onClose={() => setMessage(undefined)}
        >
          {message.text}
        </Alert>
      )}
      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Card className="deposit-card">
            <CardContent>
              <h3>Deposit</h3>
              <TextField
                label="Deposit Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                onChange={(e) => setDepositAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={depositFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className="withdraw-card">
            <CardContent>
              <h3>Withdraw</h3>
              <TextField
                label="Withdraw Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                onChange={(e) => setWithdrawAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={withdrawFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};
