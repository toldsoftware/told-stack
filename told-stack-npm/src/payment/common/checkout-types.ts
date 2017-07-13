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

    // // NOT SURE IF THESE CAN BE USED
    // // The user has submitted and the provider is verifying the information 
    // Verifing = 'Verifing',
    // // The payment failed (Try Again)
    // VerificationFailed = 'VerificationFailed',

    // The payment was sent to the server
    Submitting = 'Submitting',

    // The payment is being processed on the server
    ProcessingQueued = 'ProcessingQueued',

    // The payment has deqeued and the token is being sent to Stripe
    ProcessingPayment = 'ProcessingPayment',

    // The Customer was Created on Stripe
    ProcessingPaymentCustomerCreated = 'ProcessingPaymentCustomerCreated',
    // The Charge was Made on Stripe
    ProcessingPaymentSuceeded = 'ProcessingPaymentSuceeded',

    // The payment failed (Try Again)
    ProcessingPaymentFailed = 'ProcessingPaymentFailed',

    // The payment is being processed on the server
    ProcessingExecuting = 'ProcessingExecuting',
    // The payment was made successfully
    ProcessingSucceeded = 'ProcessingSucceeded',

    // The payment succeeded but the processing failed (Customer Support)
    ProcessingExecutionFailed = 'ProcessingExecutionFailed',

    // TODO: PaymentRefunded
    PaymentRefunded = 'PaymentRefunded',
}

export enum SubscriptionStatus {
    NotStarted = 'NotStarted',
    Subscribing = 'Subscribing',
    TrialPeriod = 'TrialPeriod',
    Subscribed = 'Subscribed',
    PaymentFailed = 'PaymentFailed',
    Cancelled = 'Cancelled',
}


export type CheckoutProcessOpen = (options: Partial<CheckoutOptions>) => void;

export interface CheckoutProcessPrepareResult {
    open: CheckoutProcessOpen;
    result: Observable<CheckoutResult>;
}

export interface CheckoutResult {
    serverCheckoutId: string;
    clientCheckoutId: string;
    status: CheckoutStatus;
    timeChanged: number;
    error?: string;
}

export interface CheckoutProcess {
    // Prepare must be called before user can Click Button (Button should be disabled until ready)
    prepare(): Promise<CheckoutProcessPrepareResult>;

    // User Clicks Button (direct call only)
    // open(options: CheckoutOptions): Observable<CheckoutResult>;

    // Check Results on a Previously Submitted Process
    getResult(checkoutId: string): Observable<CheckoutResult>;
}