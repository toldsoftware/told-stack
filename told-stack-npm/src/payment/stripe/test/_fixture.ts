import 'jest';

const uuid = jest.mock('../../../core/utils/uuid', () => ({
    uuid: {
        v4: () => 'u1234'
    }
}));

import { createTester, mockHttp, GettersObject, Getter } from "../../../core/testing/testing";
import { runFunction as f1 } from "../server/function-01-http-submit";
import { ServerConfigType, StripeCheckoutRuntimeConfig } from "../config/server-config";

export function createFixture() {

    const serverConfig: GettersObject<ServerConfigType> = {
        getEmailHash: { getter: () => () => 'email1234' },
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
                lookupUserByUserToken: async () => ({ userId: 'user1234' })
            })
        } as Getter<StripeCheckoutRuntimeConfig>,
    };

    return {
        mocks: {
            serverConfig
        },
        s_01_http_submit: mockHttp(f1)
    };
}