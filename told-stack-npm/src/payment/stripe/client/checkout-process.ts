import { Observable, Observer } from "../../../core/utils/observable";
import { CheckoutProcess, CheckoutOptions, CheckoutResult, CheckoutProcessPrepareResult, CheckoutStatus } from '../../common/checkout-types';
import { ClientConfig, ClientRuntimeOptions, ClientConfigOptions, CheckoutSubmitResult, CheckoutStatusResult, CheckoutSubmitRequestBody } from "../config/client-config";
import { StripeCheckoutAccess, StripeToken, StripeTokenArgs } from "./stripe-checkout-access";
import { assignPartial } from "../../../core/utils/objects";
import { uuid } from "../../../core/utils/uuid";
import { setInterval_exponentialBackoff, clearInterval_exponentialBackoff } from "../../../core/utils/time";

export class StripeCheckoutProcess implements CheckoutProcess {

    private _access: StripeCheckoutAccess;

    constructor(private config: ClientConfigOptions, private runtime: ClientRuntimeOptions) {

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

        let observer: Observer<CheckoutResult>;
        let lastResult: CheckoutResult = {
            serverCheckoutId: null,
            clientCheckoutId,
            status: CheckoutStatus.NotStarted,
            timeChanged: Date.now(),
        };

        let actualCheckoutOptions: CheckoutOptions;

        const updateResult = (result: Partial<CheckoutResult>) => {
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

        const result = new Observable<CheckoutResult>(o => {
            console.log('StripeCheckoutProcess Observable START');
            observer = o;
        });

        const tokenCallback = async (token: StripeToken, args: StripeTokenArgs) => {

            updateResult({ status: CheckoutStatus.Submitting });

            const url = this.config.getSubmitTokenUrl();
            const data: CheckoutSubmitRequestBody = {
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

            if (submitResult.status === CheckoutStatus.ProcessingQueued) {
                // Poll for updates
                const updateUrl = this.config.getCheckoutStatusUrl(data.token.email, submitResult.serverCheckoutId);

                const updateIntervalId = setInterval_exponentialBackoff(async () => {
                    const rStatus = await fetch(updateUrl);
                    const submitResult = await rSubmit.json() as CheckoutStatusResult;

                    updateResult(submitResult);

                    if (submitResult.status === CheckoutStatus.ProcessingSucceeded
                        || submitResult.status === CheckoutStatus.ProcessingExecutionFailed
                    ) {
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
                        updateResult({ status: CheckoutStatus.Opened });
                    },
                    closed: () => {
                        if (lastResult.status < CheckoutStatus.Submitting) {
                            updateResult({ status: CheckoutStatus.Closed });
                        }
                    },
                },
            });

            this.runtime.logCheckoutEvent('Open', { clientCheckoutId, openOptions: options, configOptions: this.config.checkoutOptions });
            updateResult({ status: CheckoutStatus.Started });
        };

        console.log('StripeCheckoutProcess DONE');

        return {
            open,
            result
        };
    }

    getResult(checkoutId: string): Observable<CheckoutResult> {
        throw new Error("Method not implemented.");
    }
}