import { HttpFunction_Config, HttpFunction_TemplateConfig, InputData, HttpFunction_BindingData } from "../config/config";
import { HttpFunctionResponse, HttpFunctionRequest } from "../../../core/types/functions";
import fetch from 'node-fetch';

// Http Request: Handle Update Request
// Blob In: Read Old Lookup Blob Value
// Queue Out: Update Request Queue
// Http Response: Return Old Lookup Value with Short TTL

export function createFunctionJson(config: HttpFunction_TemplateConfig) {
    return {
        bindings: [
            {
                name: "req",
                type: "httpTrigger",
                direction: "in",
                authLevel: "anonymous",
                route: config.http_route
            },
            {
                name: "res",
                type: "http",
                direction: "out"
            },
        ],
        disabled: false
    };
}

export async function runFunction(config: HttpFunction_Config, context: {
    log: typeof console.log,
    done: () => void,
    res: HttpFunctionResponse,
    bindingData: HttpFunction_BindingData,
    bindings: {
    }
}, req: HttpFunctionRequest) {
    context.log('START');

    if (req.query.q === 'ping') {
        context.log('PONG');
        context.res = {
            status: 200,
            body: {
                time: Date.now(),
                timeIso: new Date().toISOString(),
                message: 'pong',
            },
            headers: {
                'Content-Type': 'application/json',
            }
        };
        return context.done();
    }

    // Ping other servers
    const pongUrls = config.getPongUrls();
    const startTime = Date.now();
    const startTimeIso = new Date().toISOString();

    const results: { name: string, deltaTime_total: number, url: string, ok: boolean }[] = [];
    // const results = pongUrls.map(x => ({
    //     name: x.name,
    //     deltaTime_total: null,
    //     deltaTime_ping: null,
    //     deltaTime_pong: null,
    //     pongTime: null,
    //     pongTimeIso: null,
    //     error: undefined,
    // }));

    //    const attempts = 10;
    const attempts = 5;
    for (let a = 0; a < attempts; a++) {
        for (let i = 0; i < pongUrls.length; i++) {
            const x = pongUrls[i];
            const j = i * attempts + a;
            context.log('PING', { ...x });

            try {

                let { name, url } = x;

                // if (a === 0) {
                //     url = url.replace('api', 'api-force-404');
                // } else if (a === 1) {
                //     url = url.replace('api', 'sbrazil/api');
                // } else if (a === 2) {
                //     url = url.replace('api', 'scus/api');
                // }else if (a === 3){
                //     url = url.replace('api/ping-pong?q=ping', 'api/pong');
                // }

                const pingTime = Date.now();
                const r = await fetch(url + `${0 | 100000 * Math.random()}`, { timeout: 5000 });
                const responseTime = Date.now();

                context.log('Received PONG', { ...x, ok: r.ok, status: r.status });

                let d = {
                    time: pingTime,
                    timeIso: '',
                };

                if (r.ok) {
                    d = await r.json() as { time: number, timeIso: string };
                }

                const pongTime = d.time;
                const pongTimeIso = d.timeIso;
                const deltaTime_total = responseTime - pingTime;
                const deltaTime_ping = pongTime - pingTime;
                const deltaTime_pong = responseTime - pongTime;

                results[j] = {
                    name: x.name,
                    deltaTime_total,
                    // deltaTime_ping,
                    // deltaTime_pong,
                    // pongTime,
                    // pongTimeIso,
                    // error: undefined,
                    url,
                    ok: r.ok,
                };
            } catch (error) {
                results[j] = {
                    name: x.name,
                    error,
                } as any;
            }

            // TESTING
            // break;
        }
    }

    // setTimeout(() => {

    // const report: any = {};

    // for (let x of results) {
    //     if (!x) { return; }
    //     report[x.name] = (report[x.name] || '') + x.deltaTime_total + ',';
    // }

    // context.res = {
    //     status: 200,
    //     body: {
    //         report,
    //         startTime,
    //         startTimeIso,
    //         results,
    //     },
    //     headers: {
    //         'Content-Type': 'application/json',
    //     }
    // };

    console.log('Creating Report');

    let text = '';
    let lastName = '';

    results.forEach(x => {
        if (!x) { return; }

        if (lastName !== x.name) {
            text += `\r\n${x.name} = ${x.deltaTime_total} ${x.ok ? '' : 'FAIL'}`;
        } else {
            text += ` ${x.deltaTime_total}${x.ok ? '' : 'FAIL'}`;
        }
        lastName = x.name;
    });

    console.log('RESPOND');

    context.res = {
        status: 200,
        body: text,
        headers: {
            'Content-Type': 'text/plain',
        }
    };

    console.log('DONE');
    context.done();

    // }, 5000);
};
