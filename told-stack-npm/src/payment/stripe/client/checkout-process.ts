import { Observable, Observer } from "../../../core/utils/observable";
import { CheckoutProcess, CheckoutOptions, CheckoutResult, CheckoutProcessPrepareResult, CheckoutStatus } from '../../common/checkout-types';
import { ClientConfig } from "../config/client-config";
import { StripeCheckoutAccess, StripeToken, StripeTokenArgs } from "./stripe-checkout-access";
import { assignPartial } from "../../../core/utils/objects";
import { uuid } from "../../../core/utils/uuid";

export class StripeCheckoutProcess implements CheckoutProcess {

    _access: StripeCheckoutAccess;

    constructor(private config: ClientConfig) {

    }

    prepare = async (): Promise<CheckoutProcessPrepareResult> => {
        if (!this._access) {
            this._access = new StripeCheckoutAccess(this.config.stripePublishableKey);
        }

        await this._access.prepare();
        const checkoutId = uuid.v4();

        let observer: Observer<CheckoutResult>;
        let lastResult: CheckoutResult = {
            checkoutId,
            status: CheckoutStatus.NotStarted,
            timeChanged: Date.now(),
        };

        const updateResult = (result: Partial<CheckoutResult>) => {
            if (result.checkoutId && result.checkoutId !== lastResult.checkoutId) {
                throw 'StripeCheckoutProcess: Cannot change checkoutId';
            }

            assignPartial(lastResult, result);
            result.checkoutId = checkoutId;
            result.timeChanged = Date.now();

            this.config.logCheckoutEvent('ResultChange', lastResult);
        }

        const result = new Observable<CheckoutResult>(o => {
            observer = o;
        });

        const tokenCallback = (token: StripeToken, args: StripeTokenArgs) => {

            updateResult({ status: CheckoutStatus.Submitting });

            // TODO: Submit to server

        };

        const open = (options: Partial<CheckoutOptions>): void => {

            const o = {} as CheckoutOptions;
            assignPartial(o, this.config.checkoutOptions);
            assignPartial(o, options);

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

            this.config.logCheckoutEvent('Open', { checkoutId, openOptions: options, configOptions: this.config.checkoutOptions });
            updateResult({ status: CheckoutStatus.Started });
        };

        return {
            open,
            result
        };
    }

    getResult(checkoutId: string): Observable<CheckoutResult> {
        throw new Error("Method not implemented.");
    }
}