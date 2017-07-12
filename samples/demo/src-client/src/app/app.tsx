import * as RX from 'reactxp';
import { LookupLscTest } from "./components/lookup-lsc-test";
import { LoggerTest } from "./components/logger-test";
// import { Store } from './store/store';
// import { handleRoute } from "./routes";
// import { Root } from "./components/page/root";

// const store = Store;

// handleRoute();

// <Root store={store} />
export const App = () => (
    <RX.View>
        <RX.Text>TEST</RX.Text>
        {/*<LookupLscTest />*/}
        <LoggerTest />
    </RX.View>
);