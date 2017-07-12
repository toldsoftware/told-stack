import { StripeCheckoutProcess } from '@told/stack/src/payment/stripe/client/checkout-process';
import { clientConfig_stripe as clientConfig } from '../../config';
import { logger } from "./logger";

export const stripeCheckoutProcess = new StripeCheckoutProcess(clientConfig, {
    logCheckoutEvent: (event, data) => {
        logger.major('Stripe', event, data);
    }
});