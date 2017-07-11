
export class ScriptLoader<T> {
    private hasStartedLoading = false;
    private instance: T;

    private resolves: ((value: T) => void)[] = [];

    constructor(private options: { url: string, scriptElementId: string, getInstance: () => T, onBeforeLoadScript?: () => void, onAfterLoadScript?: () => void }) {

    }

    private resolveAll = () => {
        const r = this.resolves;
        this.resolves = [];
        r.forEach(x => x(this.instance));
    };

    load(): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this.instance) {
                resolve(this.instance);
                return;
            }

            // Subscribe
            this.resolves.push(resolve);

            if (this.hasStartedLoading) {
                return;
            }

            this.hasStartedLoading = true;
            console.log('ScriptLoader.load START');

            if (this.options.onBeforeLoadScript) { this.options.onBeforeLoadScript(); }

            // Load Script
            const d = document;
            const s = 'script';
            const id = this.options.scriptElementId;

            // Script already loaded
            if (d.getElementById(id)) {
                this.resolveAll();
                return;
            }

            const fjs = d.getElementsByTagName(s)[0];
            const js = d.createElement(s) as HTMLScriptElement;
            js.id = id;

            js.onload = () => {
                if (this.options.onAfterLoadScript) { this.options.onAfterLoadScript(); }
                this.instance = this.options.getInstance();
                this.resolveAll();
            }

            js.src = this.options.url;
            fjs.parentNode.insertBefore(js, fjs);
        });
    }
}




