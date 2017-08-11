import { FunctionDefinitionBase, FunctionExtension } from "../../azure-functions/function-base";
import { AccountServerConfig } from "../config/server-config";
import { createUserId_server } from "../config/account-ids";
import { Function as Function_SessionAuthenticate, FunctionDefinition as FunctionDefinition_SessionAuthenticate } from "./extension-session-authenticate";
import { Function as Function_SessionCreate, FunctionDefinition as FunctionDefinition_SessionCreate } from "./extension-session-create";
import { Function as Function_Email, FunctionDefinition as FunctionDefinition_Email } from "../../email/server/extension-queue-email";
import { AccountPermission } from "../config/types";
import { AccountManager } from "./account-manager";

export class FunctionDefinition extends FunctionDefinitionBase {
    constructor(private config: AccountServerConfig) {
        super();
    }

    private _sessionAuthenticate = new FunctionDefinition_SessionAuthenticate(this.config);
    inSessionTable = this._sessionAuthenticate.inSessionTable;

    private _sessionCreate = new FunctionDefinition_SessionCreate(this.config);
    outSessionTable = this._sessionCreate.outSessionTable;

    private _email = new FunctionDefinition_Email(this.config.emailServerConfig);
    outEmailQueue = this._email.outEmailQueue;
}

export class Function extends FunctionExtension<FunctionDefinition>{
    constructor(private config: AccountServerConfig) {
        super();
    }

    private _sessionAuthenticate = new Function_SessionAuthenticate(this.config);
    private _sessionCreate = new Function_SessionCreate(this.config);
    private _email = new Function_Email(this.config.emailServerConfig);

    createAccountManager = this.buildMethod((context) => {
        return new AccountManager(this.config,
            {
                authenticateSession_accountPermission: (a) => this._sessionAuthenticate.authenticateSession_accountPermission(context)(a),
                getUserId: () => this._sessionAuthenticate.getUserId(context)(),
            }, {
                createNewSession: async (a, b, c, d) => this._sessionCreate.createNewSession(context)(a, b, c, d)
            }, {
                sendEmail: async (message) => this._email.sendEmail(context)(message),
            }, context);
    });
}