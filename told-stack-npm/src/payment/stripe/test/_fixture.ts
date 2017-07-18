// import 'jest';
// const uuid = jest.mock('../../../core/utils/uuid', () => ({
//     uuid: {
//         v4: () => 'u1234'
//     }
// }));

import { createTester, mockHttp, GettersObject, Getter, mockQueue } from "../../../core/testing/testing";
import { ServerConfigType, StripeCheckoutRuntimeConfig, processQueueTrigger } from "../config/server-config";
import { runFunction as f1, deps as deps1 } from "../server/function-01-http-submit";
import { runFunction as f2, deps as deps2 } from "../server/function-02-process";
import { mockStripeConstructor } from "../config/stripe.mock";
import * as Stripe from "../config/stripe.types";

export function createFixture() {

    const mv_a = {
        email: 'email@test.com',
        emailHash: 'email1234',
        userId: 'userId1234',
        userToken: 'userToken1234',

        clientCheckoutId: 'clientCheckoutId1234',
        serverCheckoutId: 'serverCheckoutId1234',

        stripeCheckoutToken: 'stripeCheckoutToken1234',
        stripeCustomerId: 'stripeCustomerId1234',
    };

    const mv = {
        ...mv_a,
        stripeCustomer: {
            id: mv_a.stripeCustomerId
        } as Stripe.StripeCustomer
    };

    const serverConfig: GettersObject<ServerConfigType> = {
        getEmailHash: { getter: () => () => mv.emailHash },
        getStripeSecretKey: { getter: () => () => 'STRIPE_SECRET_KEY' },
        getStripeWebhookSigningSecret: { getter: () => () => 'STRIPE_SIGNING_SECRET' },
        runtime: {
            getter: () => ({
                executeRequest: async () => {
                    // Execute Request
                },
                lookupUserByUserToken: async (userToken: string) => ({ userId: userToken == mv.userToken ? mv.userId : null }),
                createUserId: async () => mv.userId,
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
            retrieve(id: Stripe.StripeCustomerId) {
                if (id == mv.stripeCustomerId) {
                    return mv.stripeCustomer;
                }
                return null;
            },
        }
    });

    deps1.getServerCheckoutId = () => mv.serverCheckoutId;
    deps2.Stripe = stripeConstructor;

    return {
        mockValues: mv,
        mocks: {
            serverConfig
        },
        s_01_http_submit: mockHttp(f1),
        s_02_process: mockQueue(f2),
    };
}