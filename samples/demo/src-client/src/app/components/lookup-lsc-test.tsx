import * as RX from 'reactxp';
import { lookupLscDataAccess } from "../server-access/lookup-lsc-data-access";


export class LookupLscTest extends RX.Component<{}, {
    containerName: string,
    blobName: string,
    hasStarted: boolean,
    timeToExpireSeconds: number,
    obj: any,
    cancel: () => void
}>{

    notifyUpdate = async (data: any, timeToExpireSeconds: number, cancel: () => void) => {
        const obj = data;

        this.setState({
            cancel,
            hasStarted: true,
            timeToExpireSeconds,
            obj
        } as any);
    }

    downloadTimeoutId: any = 0;
    download = (delay = 1000) => {
        clearTimeout(this.downloadTimeoutId);
        this.downloadTimeoutId = setTimeout(async () => {
            if (this.state.cancel) { this.state.cancel(); }

            const obj = await lookupLscDataAccess.readAndUpdate({
                containerName: this.state.containerName,
                blobName: this.state.blobName
            }, { shouldAutoRefresh: true }, this.notifyUpdate);

            this.setState({
                hasStarted: true,
                timeToExpireSeconds: undefined,
                obj
            } as any);
        }, delay);
    }

    setContainerName = (value: string) => {
        this.setState({
            containerName: value,
        } as any);

        this.download(3000);
    }

    setBlobName = (value: string) => {
        this.setState({
            blobName: value,
        } as any);

        this.download(3000);
    }

    render() {

        if (!this.state.hasStarted) {
            this.setState({
                containerName: 'test',
                blobName: 'test',
                hasStarted: true,
            } as any);

            this.download(0);
        }

        return (
            <RX.View>
                <RX.Text>hasStarted: {'' + this.state.hasStarted}</RX.Text>
                <RX.Text>timeToExpireSeconds: {'' + this.state.timeToExpireSeconds}</RX.Text>
                <RX.Text>{JSON.stringify(this.state.obj)}</RX.Text>
                <RX.View>Container: <RX.TextInput value={this.state.containerName} onChangeText={this.setContainerName} /></RX.View>
                <RX.View>Blob: <RX.TextInput value={this.state.blobName} onChangeText={this.setBlobName} /></RX.View>
            </RX.View>
        );
    }
}