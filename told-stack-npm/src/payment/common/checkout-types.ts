import { Observable } from "../../core/utils/observable";

export interface CheckoutBusinessOptions {
    name: string;
    imageUrl: string;
    statementDescriptor: string;
}

export interface CheckoutProductOptions {
    productCode: string;

    amountCents: number;
    monthlyAmountCents: number;

    description: string;
    subscriptionPlanName: string;
    subscriptionPlanId_noPrice: string;

    statementDescriptor: string;
    statementDescriptor_subscription: string;
}

export interface CheckoutUserOptions {
    email?: string;
}

export interface CheckoutRequirementOptions {
    requireZipCode: boolean;
    requireBillingAddress: boolean;
}

export interface CheckoutExperienceOptions {
    allowRememberMe: boolean;
}

export interface CheckoutOptions {
    product: CheckoutProductOptions;
    user: CheckoutUserOptions;

    business: CheckoutBusinessOptions;
    requirements: CheckoutRequirementOptions;
    experience: CheckoutExperienceOptions;
}

export enum CheckoutStatus {
    // Nothing has happened yet
    NotStarted = 'NotStarted',
    // The user has clicked the open button and is opening
    Started = 'Started',
    // The form has called the opened callback
    Opened = 'Opened',
    // The form has called the closed callback (Cancelled, Failed Verification?)
    Closed = 'Closed',

    // // NOT SURE IF THESE CAN BE USED WITH STRIPE CHECKOUT
    // // The user has submitted and the provider is verifying the information 
    // Verifing = 'Verifing',
    // // The payment failed (Try Again)
    // VerificationFailed = 'VerificationFailed',

    // The payment was sent to the server
    Submitting = 'Submitting',

    // The payment was received by the server (and Queued)
    Submitted = 'Submitted',

    // The payment was rejected by the server (and not Queued)
    Submission_Failed = 'Submission_Failed',

    // The Submission Requires User Login with the Stripe Email
    Submission_Rejected_LoginAndResubmit = 'Submission_Rejected_LoginAndResubmit',
}

export enum PaymentStatus {
    NotStarted = 'NotStarted',
    Processing = 'Processing',
    Paused = 'Paused',
    PaymentSuceeded = 'PaymentSuceeded',
    PaymentFailed = 'PaymentFailed',

    // Payment Refunded or Disputed
    PaymentWithdrawn = 'PaymentWithdrawn',
}

export enum SubscriptionStatus {
    NotStarted = 'NotStarted',
    Processing = 'Processing',
    SubscriptionFailed = 'SubscriptionFailed',
    
    Subscribed_TrialPeriod = 'Subscribed_TrialPeriod',
    Subscribed_Normal = 'Subscribed',

    // Payment Failed but Still Doing Automated Re-Attempts
    Subscribed_PastDue = 'Subscribed_PastDue',
    // Failed to Process (No Further Automated Attempts will be Made)
    Unsubscribed_PastDue = 'Unsubscribed_PastDue',
    Unsubscribed_Cancelled = 'Unsubscribed_Cancelled',
}

export enum DeliverableStatus {
    NotStarted = 'NotStarted',
    Processing = 'Processing',
    Enabled = 'Enabled',
    Disabled = 'Disabled',
}

export enum DeliverableStatus_ExecutionResult {
    NotStarted = 'NotStarted',
    Processing = 'Processing',
    Enabled = 'Enabled',
    Disabled = 'Disabled',

    // For example, something that is disabled but has already been delivered (so there is nothing further to do)
    Disabled_Impossible = 'Disabled_Impossible',

    // Attempt to Activate Caused an Error in the Activation System
    Error = 'Error',
}


export type CheckoutProcessOpen = (options: Partial<CheckoutOptions>) => void;

export interface CheckoutProcessPrepareResult {
    open: CheckoutProcessOpen;
    result: Observable<CheckoutResult_Client>;
}

export interface CheckoutResult {
    serverCheckoutId: string;
    clientCheckoutId: string;

    checkoutStatus: CheckoutStatus;
    paymentStatus: PaymentStatus;
    subscriptionStatus: SubscriptionStatus;
    deliverableStatus: DeliverableStatus;
    deliverableStatus_executionResult: DeliverableStatus_ExecutionResult;

    error?: string;
}

export interface CheckoutResult_Client extends CheckoutResult {
    timeChanged: number;
}

export interface CheckoutProcess {
    // Prepare must be called before user can Click Button (Button should be disabled until ready)
    prepare(): Promise<CheckoutProcessPrepareResult>;

    // User Clicks Button (direct call only)
    // open(options: CheckoutOptions): Observable<CheckoutResult>;

    // Check Results on a Previously Submitted Process
    getResult(checkoutId: string): Observable<CheckoutResult_Client>;
}