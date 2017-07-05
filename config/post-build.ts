import { buildFunction } from "../core/build-function";
import { functionBuildInfo as b1 } from "./_functions/lookup-lsc-01-http";
import { functionBuildInfo as b2 } from "./_functions/lookup-lsc-02-update-request-queue";
import { functionBuildInfo as b3 } from "./_functions/lookup-lsc-03-update-execute-queue";

export async function runBuild() {
    await buildFunction({ destDir: '_deploy' }, [b1, b2, b3]);
}

runBuild();