import * as RX from 'reactxp';
import { stripeCheckoutProcess } from "../server-access/stripe";
import { CheckoutOptions, CheckoutResult, CheckoutProcessOpen, CheckoutStatus } from "@told/stack/src/payment/common/checkout-types";

export class StripeTest extends RX.Component<{}, {
    hasStarted: boolean,
    isReady: boolean,
    result: CheckoutResult,
    open: CheckoutProcessOpen
}>{

    prepare = async () => {
        const r = await stripeCheckoutProcess.prepare();
        this.setState({
            isReady: true,
            open: r.open,
        } as any);

        r.result.subscribe(x => {
            console.log('Result Changed', { result: x });

            this.setState({
                result: x
            } as any);
        });
    }

    open = () => {
        if (this.state.open) {
            this.state.open({
                product: {
                    productCode: 'test-product-01',
                    amountCents: 10000,
                    monthlyAmountCents: 1000,
                    description: 'Cool Thing to Buy',
                    statementDescriptor: 'prod 01',
                    statementDescriptor_subscription: 'prod 01 sub',
                    subscriptionPlanId_noPrice: 'prod01',
                    subscriptionPlanName: 'prod01',
                },
                user: { email: 'me@home.com' },
            });
        }
    }

    render() {

        if (!this.state.hasStarted) {
            this.setState({
                hasStarted: true
            } as any);

            setTimeout(this.prepare);
        }

        return (
            <RX.View>
                <RX.Button
                    disabled={!this.state.isReady}
                    onPress={this.open}
                >Checkout</RX.Button>
                {this.state.result && (
                    <RX.View>
                        <RX.Text>checkoutId: {this.state.result.clientCheckoutId}</RX.Text>
                        <RX.Text>checkoutStatus: {this.state.result.checkoutStatus}</RX.Text>
                        <RX.Text>paymentStatus: {this.state.result.paymentStatus}</RX.Text>
                        <RX.Text>subscriptionStatus: {this.state.result.subscriptionStatus}</RX.Text>
                        <RX.Text>deliverableStatus: {this.state.result.deliverableStatus}</RX.Text>
                        <RX.Text>deliverableStatus_executionResult: {this.state.result.deliverableStatus_executionResult}</RX.Text>
                        {/* <RX.Text>timeChanged: {this.state.result.}</RX.Text> */}
                    </RX.View>
                )}
            </RX.View>
        );
    }
}