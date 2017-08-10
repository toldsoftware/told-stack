import { FunctionDefinitionBase, FunctionExtension } from "../../azure-functions/function-base";
import { AccountServerConfig } from "../config/server-config";
import { createUserId_server } from "../config/account-ids";
import { Function as Function_SessionCreate, FunctionDefinition as FunctionDefinition_SessionCreate } from "./extension-session-create";
import { AccountPermission } from "../config/types";
import { AccountManager } from "./account-manager";

export class FunctionDefinition extends FunctionDefinitionBase {
    constructor(private config: AccountServerConfig) {
        super();
    }

    private _extSessionCreate = new FunctionDefinition_SessionCreate(this.config);
    outSessionTable = this._extSessionCreate.outSessionTable;
}

export class Function extends FunctionExtension<FunctionDefinition>{
    constructor(private config: AccountServerConfig) {
        super();
    }

    private _extSessionCreate = new Function_SessionCreate(this.config);

    createAccountManager = this.buildMethod((context) => {
        return new AccountManager(this.config, {
            createNewSession: async (a, b, c, d) => this._extSessionCreate.createNewSession(context)(a, b, c, d)
        });
    });
}