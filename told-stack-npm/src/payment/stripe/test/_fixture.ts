// import 'jest';
// const uuid = jest.mock('../../../core/utils/uuid', () => ({
//     uuid: {
//         v4: () => 'u1234'
//     }
// }));

import { mockHttp, GettersObject, Getter, mockQueue, createRecorderCallback } from "../../../core/testing/testing";
import { ServerConfigType, StripeCheckoutRuntimeConfig, processQueueTrigger, CheckoutSubmitRequestBody } from "../config/server-config";
import { runFunction as f1, deps as deps1 } from "../server/function-01-http-submit";
import { runFunction as f2, deps as deps2 } from "../server/function-02-process";
import { mockStripeConstructor } from "../config/stripe.mock";
import * as Stripe from "../config/stripe.types";

let nextFid = 0;

export function createFixture() {
    const fid = nextFid++;

    const mv_a = {
        email: 'email@test.com',
        emailHash: 'email1234',
        userId: 'userId1234',
        userToken: 'userToken1234',

        clientCheckoutId: 'clientCheckoutId1234',
        serverCheckoutId: 'serverCheckoutId1234',

        stripeCheckoutToken: 'stripeCheckoutToken1234',
        stripeCustomerId: 'stripeCustomerId1234',
        stripeChargeId: 'stripeChargeId1234',

        chargeAmount: 10099,
        monthlyAmount: 1099,
        productCode: 'productCode1234',
    };

    const mv = {
        ...mv_a,
        stripeCustomer: {
            id: mv_a.stripeCustomerId
        } as Stripe.StripeCustomer,
        stripeCharge: {
            id: mv_a.stripeChargeId,
        } as Stripe.StripeCharge,

        saveEntity_result: {},

        checkout_request: {
            token: {
                email: mv_a.email,
                id: mv_a.stripeCheckoutToken,
            },
            clientCheckoutId: mv_a.clientCheckoutId,
            checkoutOptions: {
                product: {
                    amountCents: mv_a.chargeAmount,
                    monthlyAmountCents: mv_a.monthlyAmount,
                    productCode: mv_a.productCode
                }
            }
        } as CheckoutSubmitRequestBody
    };

    const callbacks = {
        name: `MAIN F${fid}`,
        process_executeRequest: () => { },

        stripe_createCustomer: (args: { email: string; source: string; }) => { },
        stripe_createCharge: (args: { customer: string; amount: number; }) => { },

        storage_saveEntity: (args: { tableName: string, partitionKey: string, rowKey: string, values: { [key: string]: string | boolean | number | Date } }) => { },
    };

    const serverConfig: GettersObject<ServerConfigType> = {
        getEmailHash: { getter: () => () => mv.emailHash },
        getStripeSecretKey: { getter: () => () => 'STRIPE_SECRET_KEY' },
        getStripeWebhookSigningSecret: { getter: () => () => 'STRIPE_SIGNING_SECRET' },
        runtime: {
            getter: () => ({
                executeRequest: async () => {
                    callbacks.process_executeRequest();
                },
                lookupUserByUserToken: async (userToken: string) => ({ userId: userToken == mv.userToken ? mv.userId : null }),
                getOrCreateCurrentUserId: async (email) => ({ userId: email == mv.email ? mv.userId : null }),
            })
        } as Getter<StripeCheckoutRuntimeConfig>,

        getBinding_stripeCheckoutTable_fromTrigger: {
            getter: () => (trigger: typeof processQueueTrigger) => ({
                tableName: 'stripe',
                partitionKey: `${trigger.emailHash}`,
                rowKey: `${trigger.serverCheckoutId}`,
                connection: 'STORAGE_SETTING'
            })
        },
        // createServerCheckoutId: { getter: () => () => v.serverCheckoutId },
    };

    const stripeConstructor = mockStripeConstructor({
        customers: {
            create(args) {
                callbacks.stripe_createCustomer(args);
                return mv.stripeCustomer;
            },
            retrieve(id) {
                if (id == mv.stripeCustomerId) {
                    return mv.stripeCustomer;
                }
                return null;
            },
        },
        charges: {
            create(args) {
                callbacks.stripe_createCharge(args);

                if (args.customer == mv.stripeCustomerId
                    && args.amount == mv.chargeAmount) {
                    return mv.stripeCharge;
                }
                return null;
            }
        }
    });

    deps1.getServerCheckoutId = () => mv.serverCheckoutId;
    deps2.Stripe = stripeConstructor;
    deps2.saveEntity = async (tableName, partitionKey, rowKey, values) => {
        callbacks.storage_saveEntity({ tableName, partitionKey, rowKey, values });
        return mv.saveEntity_result as any;
    }

    return {
        mockValues: mv,
        callbacks,
        mocks: {
            serverConfig
        },
        s_01_http_submit: mockHttp(f1),
        s_02_process: mockQueue(f2),
    };
}