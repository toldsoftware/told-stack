
## Users & Customers

What if customer already exists?

### YES: Option 1: 1 User = 1 Customer = 1 PaymentEmail = 1 PaymentMethod = 1 Subscription

- Each User Has a Single Stripe Customer Account
- A User has a specific Stripe Email
- A User has one payment method
- Updating the payment method anywhere will update it for all payments and subscriptions
- In order to have multiple payment methods, it would require multiple accounts

- The PaymentEmail can be updated and will change local and stripe (for Receipts)
- A different ContactEmail can be used for account information
- During Checkout, if an existing user is allowed to change the stripe email, it will change their PaymentEmail for all subscriptions

#### PROBLEM

- What if is someone targets an email:
    - Claim an email on an account that actually belongs to someone else? 
        - Then try to get someone else to use their email with the stripe card in order to get that customer added to the previously existing account
    - Try to checkout with an email with an invalid number to currupt the valid payment source?
        - Then this will replace the current customers payment method with an invalid source and causing future transactions to fail
- SOLUTION: 
    - If an email already belongs to an account
    - REJECT: 
        - Requier the user to login before using the payment 
        - Possibly ask for password or something when entering email
        - This should be checked as soon as email is entered
        - But during Status Polling, it might be possible to get this problem
        - This would require a user login feedback system (A way to assign a user to a checkout after the checkout has begun)

### NO: Option 2: 1 User = Many Customers (Many Customer = 1 Email, Many Customers = 1 PaymentMethod, Many Customers = 1 Subscription)

- Allow multiple stripe customers that correspond to the same user
- Each Checkout creates a new customer
- Changing the payment for a subscription could require moving between customers
- A customer becomes hard to manage because there is no way to update payment method

### NO: Option 3: 1 User = Many Stripe Customers (1 Customer = 1 Email = 1 PaymentMethod = 1 Subscription)

- A User can have multiple Customers, but Each Customer Email = 1 Payment Method = 1 Subscription
- When paying, lookup the customer object by email
    - Paying with the same email will update the payment method associated with that email
- It may be required to move subscriptions