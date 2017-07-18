import { createTester, GettersObject } from "../../../core/testing/testing";
import { createFixture } from './_fixture';
import { ServerConfigType, ProcessQueue, StripeUserLookupTable, StripeCustomerLookupTable } from "../config/server-config";
import { CheckoutSubmitRequestBody } from "../config/client-config";

const runTest = (name: string, run: () => void) => {
    // console.log(`TEST ${name}`);
    run();
};

type ComparableObject = string | boolean | number | Object;

const assert = (name: string, getActual: () => ComparableObject, getExpected?: () => ComparableObject) => {
    const actual = getActual();
    const expected = getExpected && getExpected();
    // console.log(`ASSERT ${name}`, { aVal, bVal });
    console.log(`ASSERT ${name}`)

    if (!getExpected) {
        if (actual) {
            return;
        } else {
            console.error(`FAIL ${name}: Missing`, { actual });
            throw `FAIL`;
        }
    } else {
        if (actual === expected) {
            return;
        } else {
            console.error(`FAIL ${name}`, { expected, actual });
            throw `FAIL`;
        }
    }
}

const { describe, should } = createTester(runTest, createFixture);
const onLog = (message: string, ...args: any[]) => console.log(`   :: ${message}`, ...args);

describe('A New User', () => {
    should('Purchase a Product', (fixture) => {


        // Charge The Setup Price at Stripe
        // Start the Subscription
        // Execute the Deliverable

        const mv = fixture.mockValues;

        const reqBodyObj: CheckoutSubmitRequestBody = {
            token: {
                email: mv.email,
                id: mv.stripeCheckoutToken,
            },
            clientCheckoutId:mv.clientCheckoutId,
        } as any;

        let outProcessQueue: ProcessQueue = null;
        let outStripeUserLookupTable: StripeUserLookupTable = null;
        let outStripeCustomerLookupTable: StripeCustomerLookupTable = null;

        describe('Step 1: Put the Request in the Queue', () => {

            const reqBodyStr = JSON.stringify(reqBodyObj);

            let res: any = null;

            fixture.s_01_http_submit({
                onLog,
                config: fixture.mocks.serverConfig,
                req_body_query: {
                    body: { getter: () => reqBodyStr },
                },
                bindings: {
                    outProcessQueue: { setter: v => outProcessQueue = v, },
                },
                res: {
                    setter: (v) => {
                        res = v;
                    }
                }
            });

            assert('outProcessQueue should exist', () => outProcessQueue);
            assert('outProcessQueue should have the request', () => JSON.stringify(outProcessQueue.request), () => reqBodyStr);

            assert('outProcessQueue should have correct serverCheckoutId',
                () => outProcessQueue.serverCheckoutId,
                () => mv.serverCheckoutId);

            assert('outProcessQueue should have correct emailHash',
                () => outProcessQueue.emailHash,
                () => mv.emailHash);

            assert('outProcessQueue should have correct stripeCheckoutToken',
                () => outProcessQueue.request.token.id,
                () => mv.stripeCheckoutToken);

            assert('outProcessQueue should have correct emailHash',
                () => outProcessQueue.request.clientCheckoutId,
                () => mv.clientCheckoutId);
        });

        describe('Step 2: Process the Queue', () => {
            fixture.s_02_process({
                onLog,
                config: fixture.mocks.serverConfig,
                bindings: {
                    inProcessQueue: { getter: () => outProcessQueue },
                    inStripeCheckoutTable: { getter: () => null },
                    inStripeUserLookupTable: { getter: () => null },
                    inStripeCustomerLookupTable: { getter: () => null },
                    outStripeUserLookupTable: { setter: v => outStripeUserLookupTable = v },
                    outStripeCustomerLookupTable: { setter: v => outStripeCustomerLookupTable = v },
                }
            });

            // Verify Output Values
            assert('outStripeUserLookupTable should contain new user', () => outStripeUserLookupTable);
            assert('outStripeUserLookupTable should contain expeceted userId',
                () => outStripeUserLookupTable.userId,
                () => mv.userId,
            );

            assert('outStripeCustomerLookupTable should contain new customer', () => outStripeCustomerLookupTable);
            assert('outStripeCustomerLookupTable should contain expeceted customerId',
                () => outStripeCustomerLookupTable.customerId,
                () => mv.stripeCustomerId,
            );
            // Verify Lookups are expected values
            // assert('outStripeUserLookupTable should contain new userId',
            //     () => outStripeUserLookupTable.userId,
            //     () => fixture.mocks.serverConfig.getEmailHash.getter(reqBodyObj.token.email);

        });
    });
});