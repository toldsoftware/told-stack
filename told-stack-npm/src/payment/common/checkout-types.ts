import { Observable } from "../../core/utils/observable";

export interface CheckoutBusinessOptions {
    name: string;
    imageUrl: string;
}

export interface CheckoutProductOptions {
    amountCents: number;
    description: string;
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
    NotStarted,
    // The user has clicked the open button and is opening
    Started,
    // The form has called the opened callback
    Opened,
    // The form has called the closed callback (Caneelled)
    Closed,
    // The user has submitted and the provider is verifying the information 
    Verifing,
    // The payment was sent to the server
    Submitting,
    // The payment is being processed on the server
    Processing,
    // The payment was made successfully
    Success,
    // The payment failed (Try Again)
    PaymentFailed,
    // The payment succeeded but the processing failed (Customer Support)
    ProcessingFailed,
    // The payment process was not found
    NotFound,
}

export type CheckoutProcessOpen = (options: Partial<CheckoutOptions>) => void;

export interface CheckoutProcessPrepareResult {
    open: CheckoutProcessOpen;
    result: Observable<CheckoutResult>;
}

export interface CheckoutResult {
    checkoutId: string;
    status: CheckoutStatus;
    timeChanged: number;
}

export interface CheckoutProcess {
    // Prepare must be called before user can Click Button (Button should be disabled until ready)
    prepare(): Promise<CheckoutProcessPrepareResult>;

    // User Clicks Button (direct call only)
    // open(options: CheckoutOptions): Observable<CheckoutResult>;

    // Check Results on a Previously Submitted Process
    getResult(checkoutId: string): Observable<CheckoutResult>;
}