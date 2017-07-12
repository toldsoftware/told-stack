import { ClientConfig } from "@told/stack/src/payment/stripe/config/client-config";

export const clientConfig = new ClientConfig({
    stripePublishableKey: 'pk_test_hB4VRQY8ICsC6mVsRo8jjnIh',
    checkoutOptions: {
        business: {
            name: 'Told Software',
            imageUrl: 'https://toldstackdemo.blob.core.windows.net/images/ToldLogo128.png'
        },
        requirements: {
            requireZipCode: true,
            requireBillingAddress: true,
        },
        experience: {
            allowRememberMe: true
        },
    },
});