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
                product: { amountCents: 100, description: 'Cool Thing to Buy' },
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
                        <RX.Text>status: {CheckoutStatus[this.state.result.status]}</RX.Text>
                        <RX.Text>checkoutId: {this.state.result.checkoutId}</RX.Text>
                        <RX.Text>timeChanged: {this.state.result.timeChanged}</RX.Text>
                    </RX.View>
                )}
            </RX.View>
        );
    }
}