import { FunctionDefinitionBase, FunctionBase } from "../../azure-functions/function-base";
import { ServerConfig } from "../config/server-config";

export class FunctionDefinition extends FunctionDefinitionBase {
    constructor(private config: ServerConfig) {
        super();
    }

    inEmailQueueTrigger = this.config.binding_emailQueue_trigger;
    outEmailTable = this.config.binding_emailTable_out;
    outSendGrid = this.config.binding_sendGrid;
}

export class Function extends FunctionBase<FunctionDefinition>{
    constructor(config: ServerConfig) {
        super();
    }

    run = this.buildRun(context => {
        const { message } = context.bindings.inEmailQueueTrigger;
        context.bindings.outEmailTable = {
            from: message.from.email,
            to: message.to.email,
            subject: message.subject,
            message: message,
        };

        context.bindings.outSendGrid = {
            from: message.from,
            content: message.content,
            personalizations: [{
                to: [message.to],
                subject: message.subject
            }]
        };

        return context.done();
    });
}