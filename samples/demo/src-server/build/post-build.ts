import { runPostBuild } from '@told/stack/src/build/post-build';
import { resolveEntries } from '@told/stack/src/build/resolve-entries';
import { entries, requireCallback } from "../../config/src/entries-server";
import { testEntries, requireCallback as requireCallbackTest  } from "../../config/src/tests-server";

runPostBuild(resolveEntries(entries, requireCallback), '../_deploy', '../_deploy_testing');
runPostBuild(resolveEntries(testEntries, requireCallbackTest), '../_deploy_testing');
