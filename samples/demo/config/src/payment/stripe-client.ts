import { ClientConfig } from "@told/stack/src/payment/stripe/config/client-config";

export const clientConfig = new ClientConfig({
    stripePublishableKey: 'pk_stripe_publishable_key_1234',
    checkoutOptions: {
        business: {
            name: 'Told Software',
            imageUrl: 'https://toldstackdemo.blob.core.windows.net/images/ToldLogo128.png',
            statementDescriptor: 'ToldSoft',
        },
        requirements: {
            requireZipCode: true,
            requireBillingAddress: true,
        },
        experience: {
            allowRememberMe: true
        },
    },
    getSessionToken: async () => ({ sessionToken: 'userToken42' }),
});