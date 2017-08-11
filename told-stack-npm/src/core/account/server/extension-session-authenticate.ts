import { FunctionDefinitionBase, FunctionExtension } from "../../azure-functions/function-base";
import { AccountServerConfig } from "../config/server-config";
import { AccountPermission, verifyAccountPermission } from "../config/types";

export class FunctionDefinition extends FunctionDefinitionBase {
    constructor(private config: AccountServerConfig) {
        super();
    }

    inSessionTable = this.config.binding_sessionTable_fromSessionToken;
}

export class Function extends FunctionExtension<FunctionDefinition>{
    constructor(config: AccountServerConfig) {
        super();
    }

    authenticateSession_accountPermission = this.buildMethod((context) => (userPermission: AccountPermission) => {
        const inSessionTable = context.bindings.inSessionTable;
        if (!inSessionTable) { return false; }

        return verifyAccountPermission(inSessionTable.accountPermissions, userPermission);
    });

    getUserId = this.buildMethod((context) => () => {
        const inSessionTable = context.bindings.inSessionTable;
        if (!inSessionTable) { return null; }

        return inSessionTable.userId;
    });
}