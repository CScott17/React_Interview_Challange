## Questions

### What issues, if any, did you find with the existing code?
- The initial project allowed users to deposit and withdraw any amount they wanted in their accounts including withdrawing more than they had in their account balance. Needed to implement all the business rules to ensure any deposit or withdrawal that is made follows all the rules and is valid every time.
- I also wanted to include an alert message to notify the user if there was an issue with the transaction and what the issue was as well as providing a success message when a valid transaction was made.

### What issues, if any, did you find with the request to add functionality?
- Needed to include additional fields to the account database table to track the total amount that was withdrawn in the given day as well as the last date a withdraw was made to follow the rule to prevent withdrawing more than $400 in a single day.

### Would you modify the structure of this project if you were to start it over? If so, how?
- I would move all of the transaction business rules into their own file to separate it from the database code. This allows the rules to be defined clearer and makes it easier to implement any new rules in the future.

### Were there any pieces of this project that you were not able to complete that you'd like to mention?
- I was able to implement all of the rules that both deposits and withdraws must follow to be valid transactions.

### If you were to continue building this out, what would you like to add next?
- I would implement a user authentication feature to require a traditional username and passord sign in as we would be working with personal information.
- Including a transaction history feature could be helpful as well to track the day and amounts a given user updated the balance in their account.

### If you have any other comments or info you'd like the reviewers to know, please add them below.