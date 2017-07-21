// Checkout:

// USUAL Cases:
export * from './001-new-user.test';
export * from './002-existing-user.test';

// Existing User (Logged In) & Existing Customer & Same Payment Method
// Existing User (Logged In) & Existing Customer & New Payment Method
// Existing User & New Email (New Customer)

// RARE Cases:
// Non Logged In User (Existing Email)

// FAIL Cases (Customer Support => Manual Repair):
// Logged In User (Email Belonging to Different Account)
// Missing User & Existing Customer
// Existing User & Missing Customer


// Events:

// Subscription Payment Succeeds
// Subscription Payment PastDue (Re-attempting)
// Subscription Payment Failed

// Processing:

// Processing Succeeds
// Processing Error