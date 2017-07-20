import { createTester, GettersObject, createRecorderCallback } from "../../../core/testing/testing";
import { createFixture } from './_fixture';
import { ServerConfigType, ProcessQueue, StripeUserLookupTable, StripeCustomerLookupTable, StripeCheckoutTable } from "../config/server-config";
import { CheckoutSubmitRequestBody } from "../config/client-config";
import { CheckoutStatus, PaymentStatus, DeliverableStatus, DeliverableStatus_ExecutionResult } from "../../common/checkout-types";

const runTest = async (name: string, run: () => Promise<void>) => {
    // console.log(`TEST ${name}`);
    await run();
};

type ComparableObject = string | boolean | number | Object;

const assert = (name: string, getActual: () => ComparableObject, getExpected?: () => ComparableObject) => {
    const actual = getActual();
    const expected = getExpected && getExpected();
    // console.log(`ASSERT ${name}`, { aVal, bVal });
    console.log(` ASSERT ${name}`)

    if (!getExpected) {
        if (actual) {
            return;
        } else {
            console.error(`  FAIL ${name}: Missing`, { actual });
            debugger;
            throw `FAIL`;
        }
    } else {
        if (actual === expected) {
            return;
        } else {
            console.error(`  FAIL ${name}`, { expected, actual });
            debugger;
            throw `FAIL`;
        }
    }
}

const { describe, should } = createTester(runTest, createFixture);
const onLog = (message: string, ...args: any[]) => console.log(`   :: ${message}`, ...args);

describe('A New User', async () => {
    await should('Purchase a Product', async (fixture) => {

        // Charge The Setup Price at Stripe
        // Start the Subscription
        // Execute the Deliverable

        const mv = fixture.mockValues;
        const reqBodyObj = mv.checkout_request;

        let outProcessQueue: ProcessQueue = null;
        let outStripeUserLookupTable: StripeUserLookupTable = null;
        let outStripeCustomerLookupTable: StripeCustomerLookupTable = null;

        const callbacks = fixture.callbacks;

        await describe('Step 1: Put the Request in the Queue', async () => {

            const reqBodyStr = JSON.stringify(reqBodyObj);

            let res: any = null;

            await fixture.s_01_http_submit({
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

        await describe('Step 2: Process the Queue', async () => {
            let lastCheckoutTable: StripeCheckoutTable = {} as any;
            const checkoutTableBinding = fixture.mocks.serverConfig.getBinding_stripeCheckoutTable_fromTrigger.getter()(mv);
            const results = {
                process_executeRequest: createRecorderCallback(callbacks.process_executeRequest, cb => callbacks.process_executeRequest = cb),

                stripe_createCustomer: createRecorderCallback(callbacks.stripe_createCustomer, cb => callbacks.stripe_createCustomer = cb),
                stripe_createCharge: createRecorderCallback(callbacks.stripe_createCharge, cb => callbacks.stripe_createCharge = cb),

                storage_saveEntity: createRecorderCallback(callbacks.storage_saveEntity, cb => callbacks.storage_saveEntity = (args) => {
                    cb(args);

                    if (args.tableName === checkoutTableBinding.tableName
                        && args.partitionKey === checkoutTableBinding.partitionKey
                        && args.rowKey === checkoutTableBinding.rowKey
                    ) {
                        lastCheckoutTable = { ...lastCheckoutTable, ...args.values };
                    }
                })
            };

            await fixture.s_02_process({
                onLog,
                config: fixture.mocks.serverConfig,
                bindings: {
                    inProcessQueueTrigger: { getter: () => outProcessQueue },
                    inStripeCheckoutTable: { getter: () => null },
                    inStripeUserLookupTable: { getter: () => null },
                    inStripeCustomerLookupTable: { getter: () => null },
                    outStripeUserLookupTable: { setter: v => outStripeUserLookupTable = v },
                    outStripeCustomerLookupTable: { setter: v => outStripeCustomerLookupTable = v },
                }
            });

            // Verify Stripe Checkout
            assert('stripe customer should be created',
                () => results.stripe_createCustomer.wasCalled,
            );
            assert('stripe customer should be created with correct email',
                () => results.stripe_createCustomer.args.email,
                () => mv.email,
            );

            assert('stripe charge should be created with correct amount',
                () => results.stripe_createCharge.args.amount,
                () => mv.chargeAmount,
            );

            // Verify Output Table Values
            assert('outStripeUserLookupTable should contain new user', () => outStripeUserLookupTable);
            assert('outStripeUserLookupTable should contain expected userId',
                () => outStripeUserLookupTable.userId,
                () => mv.userId,
            );

            assert('outStripeCustomerLookupTable should contain new customer', () => outStripeCustomerLookupTable);
            assert('outStripeCustomerLookupTable should contain expected customerId',
                () => outStripeCustomerLookupTable.customerId,
                () => mv.stripeCustomerId,
            );



            // Verify Execution
            assert('the request should be executed',
                () => results.process_executeRequest.wasCalled,
            );

            // Verify Final Status
            assert('the final checkout status should be submitted',
                () => lastCheckoutTable.checkoutStatus,
                () => CheckoutStatus.Submitted
            );

            assert('the final payment status should be submitted',
                () => lastCheckoutTable.paymentStatus,
                () => PaymentStatus.PaymentSuceeded
            );

            assert('the final deliverable status should be enabled',
                () => lastCheckoutTable.deliverableStatus,
                () => DeliverableStatus.Enabled
            );

            assert('the final deliverable execution result should be enabled',
                () => lastCheckoutTable.deliverableStatus_executionResult,
                () => DeliverableStatus_ExecutionResult.Enabled
            );

        });
    });
});