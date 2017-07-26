import { Observable, Observer } from "../../../core/utils/observable";
import { CheckoutProcess, CheckoutOptions, CheckoutProcessPrepareResult, CheckoutStatus, DeliverableStatus_ExecutionResult, PaymentStatus, DeliverableStatus, CheckoutResult_Client, SubscriptionStatus, CheckoutPausedReason } from '../../common/checkout-types';
import { ClientRuntimeConfig, ClientConfig, CheckoutSubmitResult, CheckoutStatusResult, CheckoutSubmitRequestBody } from "../config/client-config";
import { StripeCheckoutAccess, StripeToken, StripeTokenArgs } from "./stripe-checkout-access";
import { assignPartial } from "../../../core/utils/objects";
import { uuid } from "../../../core/utils/uuid";
import { setInterval_exponentialBackoff, clearInterval_exponentialBackoff } from "../../../core/utils/time";

export class StripeCheckoutProcess implements CheckoutProcess {

    private _access: StripeCheckoutAccess;

    constructor(private config: ClientConfig, private runtime: ClientRuntimeConfig) {

    }

    prepare = async (): Promise<CheckoutProcessPrepareResult> => {
        console.log('StripeCheckoutProcess START');

        if (!this._access) {
            this._access = new StripeCheckoutAccess(this.config.stripePublishableKey);
        }

        console.log('StripeCheckoutProcess Prepare Stripe Access');
        await this._access.prepare();

        console.log('StripeCheckoutProcess Setup Result Observer');
        const clientCheckoutId = uuid.v4();
        const sessionInfo = await this.config.getSessionInfo();

        let observer: Observer<CheckoutResult_Client>;
        let lastResult: CheckoutResult_Client = {
            serverCheckoutId: null,
            clientCheckoutId,
            checkoutStatus: CheckoutStatus.NotStarted,
            checkoutPausedReason: CheckoutPausedReason.None,
            paymentStatus: PaymentStatus.NotStarted,
            subscriptionStatus: SubscriptionStatus.NotStarted,
            deliverableStatus: DeliverableStatus.NotStarted,
            deliverableStatus_executionResult: DeliverableStatus_ExecutionResult.NotStarted,
            timeChanged: Date.now(),
        };

        let actualCheckoutOptions: CheckoutOptions;

        const updateResult = (result: Partial<CheckoutResult_Client>) => {
            console.log('StripeCheckoutProcess updateResult', { result });

            if (result.clientCheckoutId && result.clientCheckoutId !== lastResult.clientCheckoutId) {
                throw 'StripeCheckoutProcess: Cannot change clientCheckoutId';
            }

            if (result.serverCheckoutId && result.serverCheckoutId !== lastResult.serverCheckoutId) {
                throw 'StripeCheckoutProcess: Cannot change serverCheckoutId';
            }

            assignPartial(lastResult, result);
            lastResult.clientCheckoutId = clientCheckoutId;
            lastResult.timeChanged = Date.now();
            observer.next(lastResult);

            this.runtime.logCheckoutEvent('ResultChange', lastResult);
        }

        const result = new Observable<CheckoutResult_Client>(o => {
            console.log('StripeCheckoutProcess Observable START');
            observer = o;
        });

        const tokenCallback = async (token: StripeToken, args: StripeTokenArgs) => {

            updateResult({ checkoutStatus: CheckoutStatus.Submitting });

            const url = this.config.getServerUrl_submit();
            const data: CheckoutSubmitRequestBody = {
                sessionInfo,
                clientCheckoutId,
                token,
                args,
                checkoutOptions: actualCheckoutOptions,
                metadata: this.config.getStripeChargeMetadata(actualCheckoutOptions),
                statementDescriptor: this.config.getStripeChargeStatementDescriptor(actualCheckoutOptions),
                statementDescriptor_subscription: this.config.getStripeChargeStatementDescriptor_subscription(actualCheckoutOptions),
            };

            const rSubmit = await fetch(url, { method: 'POST', body: JSON.stringify(data) });
            const submitResult = await rSubmit.json() as CheckoutSubmitResult;

            updateResult(submitResult);

            // Poll for Deliverable Status
            if (submitResult.checkoutStatus === CheckoutStatus.Submitted) {

                const updateUrl = this.config.getServerUrl_status(data.token.email, submitResult.serverCheckoutId);

                const updateIntervalId = setInterval_exponentialBackoff(async () => {
                    const rStatus = await fetch(updateUrl);
                    const submitResult = await rSubmit.json() as CheckoutStatusResult;

                    updateResult(submitResult);

                    if (submitResult.checkoutStatus === CheckoutStatus.Submission_Paused) {
                        clearInterval_exponentialBackoff(updateIntervalId);
                        // TODO: Require Login and then resubmit with same payment token
                        throw 'Require Login - Not Implemented';

                        // return;
                    }

                    if (submitResult.deliverableStatus_executionResult > DeliverableStatus_ExecutionResult.Processing) {
                        clearInterval_exponentialBackoff(updateIntervalId);
                    }

                });
            }

        };

        const open = (options: Partial<CheckoutOptions>): void => {

            const o = {} as CheckoutOptions;
            assignPartial(o, this.config.checkoutOptions);
            assignPartial(o, options);

            actualCheckoutOptions = o;

            // TODO: Note Verification Step?
            // TODO: Handle Payment Failed

            this._access.open({
                tokenCallback,
                recommendedOptions: {
                    amount: o.product.amountCents,
                    name: o.business.name,
                    image: o.business.imageUrl,
                    description: o.product.description,
                    zipCode: o.requirements.requireZipCode,
                    billingAddress: o.requirements.requireBillingAddress,
                },
                additionalOptions: {
                    email: o.user.email,
                    allowRememberMe: o.experience.allowRememberMe,
                    opened: () => {
                        updateResult({ checkoutStatus: CheckoutStatus.Opened });
                    },
                    closed: () => {
                        if (lastResult.checkoutStatus < CheckoutStatus.Submitting) {
                            updateResult({ checkoutStatus: CheckoutStatus.Closed });
                        }
                    },
                },
            });

            this.runtime.logCheckoutEvent('Open', { clientCheckoutId, openOptions: options, configOptions: this.config.checkoutOptions });
            updateResult({ checkoutStatus: CheckoutStatus.Started });
        };

        console.log('StripeCheckoutProcess DONE');

        return {
            open,
            result
        };
    }

    getResult(checkoutId: string): Observable<CheckoutResult_Client> {
        throw new Error("Method not implemented.");
    }
}