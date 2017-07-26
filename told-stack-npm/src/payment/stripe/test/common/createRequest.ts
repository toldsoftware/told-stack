import { CheckoutSubmitRequestBody } from "../../config/client-config";
import { CheckoutOptions } from "../../../common/checkout-types";

// TODO: Use debug-config

export function createCheckoutOptions(testCode: string, userEmail: string, shouldUseNewProduct: boolean): CheckoutOptions {
    const prodSuffix = shouldUseNewProduct ? `_${Date.now()}` : '';

    return {
        business: {
            name: 'Told Software',
            imageUrl: '',
            statementDescriptor: 'Told',
        },
        experience: {
            allowRememberMe: true,
        },
        requirements: {
            requireZipCode: true,
            requireBillingAddress: true,
        },
        product: {
            statementDescriptor: `t_${testCode}`,
            statementDescriptor_subscription: `t_${testCode}_sub`,
            description: `Test Product${prodSuffix}`,
            productCode: `t_${testCode}_product${prodSuffix}`,
            amountCents: 10099,
            monthlyAmountCents: 1099,
            subscriptionPlanId_noPrice: `t_sub_${testCode}${prodSuffix}`,
            subscriptionPlanName: `T Sub ${testCode}${prodSuffix}`,
        },
        user: { email: userEmail },
    };
}

export function createCheckoutSubmitRequest(clientCheckoutId: string, testCode: string, userEmail: string, shouldUseNewProduct: boolean): { body: CheckoutSubmitRequestBody } {
    return {
        body: {
            clientCheckoutId,
            statementDescriptor: `t_${testCode}`,
            statementDescriptor_subscription: `t_${testCode}_sub`,
            sessionInfo: {
                sessionToken: `userToken1234_${Date.now()}`,
                userId_claimed: `userToken1234_${Date.now()}`,
                isAnonymous: true
            },

            // Stripe Token
            token: {
                email: userEmail,
                id: 'tok_visa'
            },
            args: {},
            metadata: {},

            checkoutOptions: createCheckoutOptions(testCode, userEmail, shouldUseNewProduct),
        }
    };
}

