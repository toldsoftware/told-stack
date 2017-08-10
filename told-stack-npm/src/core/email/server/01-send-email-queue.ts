import { FunctionDefinitionBase, FunctionBase } from "../../azure-functions/function-base";
import { ServerConfig } from "../config/server-config";
import { randHex } from "../../utils/rand";

export class FunctionDefinition extends FunctionDefinitionBase {
    constructor(private config: ServerConfig) {
        super();
    }

    inEmailQueueTrigger = this.config.binding_emailQueue_trigger;
    outEmailTable = this.config.binding_emailTable_out;
    outSendGrid = this.config.binding_sendGrid;
}

export class Function extends FunctionBase<FunctionDefinition>{
    constructor(private config: ServerConfig) {
        super();
    }

    run = this.buildRun(context => {
        const { message } = context.bindings.inEmailQueueTrigger;

        context.bindings.outEmailTable = {
            PartitionKey: `${Date.now()}_${randHex(8)}`,
            RowKey: `message`,

            from: message.from.email,
            to: message.to.email,
            subject: message.subject,
            plainContent: message.content.plain,
            message: message,
        };

        context.bindings.outSendGrid = {
            from: message.from,
            content: [
                { type: 'text/plain', value: message.content.plain },
                { type: 'text/html', value: message.content.html },
            ],
            personalizations: [{
                to: [message.to],
                subject: message.subject
            }]
        };

        return context.done();
    });
}