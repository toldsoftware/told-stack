import * as RX from 'reactxp';
import { lookupLscDataAccess } from "../server-access/lookup-lsc-data-access";


export class LookupLscTest extends RX.Component<{}, {
    hasStarted: boolean,
    isDownloading: boolean,
    obj: any,
}>{

    notifyUpdate = () => {
        this.setState({
            isDownloading: false,
        } as any);
    }

    download = async () => {
        const obj = await lookupLscDataAccess.readAndUpdate({ blobName: 'test', containerName: 'test' }, this.notifyUpdate);

        this.setState({
            hasStarted: true,
            isDownloading: true,
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
                <RX.Text>isDownloading: {'' + this.state.isDownloading}</RX.Text>
                <RX.Text>{JSON.stringify(this.state.obj)}</RX.Text>
            </RX.View>
        );
    }
}