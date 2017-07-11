import * as RX from 'reactxp';
import { lookupLscDataAccess } from "../server-access/lookup-lsc-data-access";


export class LookupLscTest extends RX.Component<{}, {
    hasStarted: boolean,
    isWaitingForUpdate: boolean,
    obj: any,
}>{

    notifyUpdate = async (data: any) => {
        const obj = data;

        this.setState({
            hasStarted: true,
            isWaitingForUpdate: false,
            obj
        });
    }

    download = async () => {
        const obj = await lookupLscDataAccess.readAndUpdate({ blobName: 'test', containerName: 'test' }, { shouldAutoRefresh: true }, this.notifyUpdate);

        this.setState({
            hasStarted: true,
            isWaitingForUpdate: true,
            obj
        });
    }

    render() {

        if (!this.state.hasStarted) {
            this.setState({
                hasStarted: true,
            } as any);

            setTimeout(this.download);
        }

        return (
            <RX.View>
                <RX.Text>hasStarted: {'' + this.state.hasStarted}</RX.Text>
                <RX.Text>isWaitingForUpdate: {'' + this.state.isWaitingForUpdate}</RX.Text>
                <RX.Text>{JSON.stringify(this.state.obj)}</RX.Text>
            </RX.View>
        );
    }
}