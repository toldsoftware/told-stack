import * as RX from 'reactxp';
import { logger } from "../server-access/logger";

export class LoggerTest extends RX.Component<{}, {
}>{

    render() {

        return (
            <RX.View>
                <RX.TextInput
                    onBlur={(e) => logger.log('TestTextInput', 'onBlur', { value: (e.target as any).value }, true)}
                    onChangeText={(e) => logger.log('TestTextInput', 'onChangeText', { value: e })}
                />
                <RX.Button
                    onPress={() => logger.log('TestButton', 'onPress', null, true)}
                    onBlur={() => logger.log('TestButton', 'onBlur', null)}
                    onHoverStart={() => logger.log('TestButton', 'onHoverStart', null)}
                    onHoverEnd={() => logger.log('TestButton', 'onHoverEnd', null)}
                    onLongPress={() => logger.log('TestButton', 'onLongPress', null)}
                >Click Me</RX.Button>
            </RX.View>
        );
    }
}