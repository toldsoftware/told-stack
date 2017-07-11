import { CheckoutResult } from "../../common/checkout-types";

interface StripePaymentInformation extends CheckoutResult {
    // product
    // user
    // business
}

interface StripeInformationClient {
    getResult(checkoutId: string): Promise<StripePaymentInformation>;
    getResults(checkoutIds: string[]): Promise<StripePaymentInformation[]>;
    searchResults(emails: string[]): Promise<StripePaymentInformation[]>;
}