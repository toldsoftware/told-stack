// import 'jest';
// const uuid = jest.mock('../../../core/utils/uuid', () => ({
//     uuid: {
//         v4: () => 'u1234'
//     }
// }));

import { createTester, mockHttp, GettersObject, Getter, mockQueue } from "../../../core/testing/testing";
import { ServerConfigType, StripeCheckoutRuntimeConfig } from "../config/server-config";
import { runFunction as f1 } from "../server/function-01-http-submit";
import { runFunction as f2 } from "../server/function-02-process";

export function createFixture() {

    const v = {
        email: 'email@test.com',
        emailHash: 'email1234',
        userId: 'userId1234',
        userToken: 'userToken1234',

        clientCheckoutId: 'clientCheckoutId1234',
        serverCheckoutId: 'serverCheckoutId1234',

        stripeCheckoutToken: 'stripeCheckoutToken1234',
        stripeCustomerId: 'stripeCustomerId1234',
    };

    const serverConfig: GettersObject<ServerConfigType> = {
        getEmailHash: { getter: () => () => v.emailHash },
        getStripeSecretKey: { getter: () => () => 'STRIPE_SECRET_KEY' },
        getStripeWebhookSigningSecret: { getter: () => () => 'STRIPE_SIGNING_SECRET' },
        stripeCheckoutTable_tableName: { getter: () => 'table-name' },
        getStripeCheckoutPartitionKey: { getter: () => () => 'partition-key' },
        getStripeCheckoutRowKey: { getter: () => () => 'row-key' },
        runtime: {
            getter: () => ({
                executeRequest: async () => {
                    // Execute Request
                },
                lookupUserByUserToken: async (userToken: string) => ({ userId: userToken == v.userToken ? v.userId : null }),
                createUserId: async () => v.userId,
            })
        } as Getter<StripeCheckoutRuntimeConfig>,

        createServerCheckoutId: { getter: () => () => v.serverCheckoutId },
    };

    return {
        mockValues: v,
        mocks: {
            serverConfig
        },
        s_01_http_submit: mockHttp(f1),
        s_02_process: mockQueue(f2),
    };
}