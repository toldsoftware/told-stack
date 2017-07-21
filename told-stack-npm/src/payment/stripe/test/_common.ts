import { CheckoutSubmitRequestBody } from "../config/client-config";
import { CheckoutOptions } from "../../common/checkout-types";

export function createCheckoutOptions(testCode: string, userEmail: string): CheckoutOptions {
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
            description: 'Test Product',
            productCode: `t_${testCode}_product`,
            amountCents: 10099,
            monthlyAmountCents: 1099,
            subscriptionPlanId_noPrice: `t_sub_${testCode}_${Date.now()}`,
            subscriptionPlanName: `T Sub ${testCode} ${Date.now()}`,
        },
        user: { email: userEmail },
    };
}

export function createCheckoutSubmitRequestBody(clientCheckoutId: string, testCode: string, userEmail: string): { body: CheckoutSubmitRequestBody } {
    return {
        body: {
            clientCheckoutId,
            statementDescriptor: `t_${testCode}`,
            statementDescriptor_subscription: `t_${testCode}_sub`,
            userToken: 'userToken1234',

            // Stripe Token
            token: {
                email: userEmail,
                id: 'tok_visa'
            },
            args: {},
            metadata: {},

            checkoutOptions: createCheckoutOptions(testCode, userEmail),
        }
    };
}



// const assert = (name: string, getActual: () => ComparableObject, getExpected?: () => ComparableObject) => {
//     const actual = getActual();
//     const expected = getExpected && getExpected();
//     // log(`ASSERT ${name}`, { aVal, bVal });
//     log(` ASSERT ${name}`)

//     if (!getExpected) {
//         if (actual) {
//             return;
//         } else {
//             logItems.forEach(x => console.log('* ' + x.message, ...x.args));
//             console.error(`  FAIL ${name}: Missing`, { actual });
//             debugger;
//             throw `FAIL`;
//         }
//     } else {
//         if (actual === expected) {
//             return;
//         } else {
//             logItems.forEach(x => console.log('* ' + x.message, ...x.args));
//             console.error(`  FAIL ${name}`, { expected, actual });
//             debugger;
//             throw `FAIL`;
//         }
//     }
// }