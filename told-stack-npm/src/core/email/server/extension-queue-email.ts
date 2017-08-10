import { FunctionDefinitionBase, FunctionExtension } from "../../azure-functions/function-base";
import { ServerConfig, EmailQueue } from "../config/server-config";
import { EmailMessage } from "../../types/functions";

export class FunctionDefinition extends FunctionDefinitionBase {
    constructor(private config: ServerConfig) {
        super();
    }

    outEmailQueue = this.config.binding_emailQueue_out;
}

export class Function extends FunctionExtension<FunctionDefinition>{
    constructor(config: ServerConfig) {
        super();
    }

    sendEmail = this.buildMethod((context) => (message: EmailMessage) => {
        const outEmailQueue = context.bindings.outEmailQueue = context.bindings.outEmailQueue || [];
        outEmailQueue.push({ message });
    });
}