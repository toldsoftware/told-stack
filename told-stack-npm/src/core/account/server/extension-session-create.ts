import { FunctionDefinitionBase, FunctionExtension } from "../../azure-functions/function-base";
import { AccountServerConfig } from "../config/server-config";
import { AccountPermission, SessionInfo } from "../config/types";
import { createSessonToken_server } from "../config/account-ids";

export class FunctionDefinition extends FunctionDefinitionBase {
    constructor(private config: AccountServerConfig) {
        super();
    }

    outSessionTable = this.config.binding_sessionTable_out;
}

export class Function extends FunctionExtension<FunctionDefinition>{
    constructor(private config: AccountServerConfig) {
        super();
    }

    createNewSession = this.buildMethod((context) => (
        userId: string,
        accountPermissions: AccountPermission[],
        userAuthorizations: string[],
        oldSessionToken?: string
    ) => {

        const sessionToken = createSessonToken_server();
        const sessionInfo: SessionInfo = {
            sessionToken,
            userId,
            accountPermissions,
            userAuthorizations,
        };

        const newSessionTableBinding = this.config.getBinding_sessionTable_fromSessionToken({ sessionToken });

        const outSessionTable = context.bindings.outSessionTable = context.bindings.outSessionTable || [];
        outSessionTable.push({
            PartitionKey: newSessionTableBinding.partitionKey,
            RowKey: newSessionTableBinding.rowKey,
            fromSessionToken: oldSessionToken,
            ...sessionInfo
        }, {
                // User Sessions List
                PartitionKey: userId,
                RowKey: sessionToken,
                fromSessionToken: oldSessionToken,
                ...sessionInfo
            });

        return sessionInfo;
    });
}