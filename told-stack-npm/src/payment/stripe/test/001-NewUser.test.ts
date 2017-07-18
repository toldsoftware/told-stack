import { createTester, GettersObject } from "../../../core/testing/testing";
import { createFixture } from './_fixture';
import { ServerConfigType, ProcessQueue } from "../config/server-config";
import { CheckoutSubmitRequestBody } from "../config/client-config";

const { it, should } = createTester(test, createFixture);



it('A New User', () => {
    should('Purchase a Product', (fixture) => {

        // Charge The Setup Price at Stripe
        // Start the Subscription
        // Execute the Deliverable

        // Step 1: Put the Request in the Queue
        const reqBody: CheckoutSubmitRequestBody = {
            token: {
                email: 'email@test.com',
                id: '1234',
            },
        } as any;

        let ourProcessQueue: ProcessQueue = null;
        let outStripeCheckoutTable: any = null;

        fixture.s_01_http_submit({
            onLog: console.log.bind(console),
            config: fixture.mocks.serverConfig,
            req_body_query: {
                body: { getter: () => reqBody },
            },
            bindings: {
                outProcessQueue: {
                    setter: v => ourProcessQueue = v,
                },
                outStripeCheckoutTable: {
                    setter: v => outStripeCheckoutTable = v,
                },
            }
        });

        expect(ourProcessQueue).toBeTruthy();
        expect(ourProcessQueue.request).toBe(reqBody);
    });
});