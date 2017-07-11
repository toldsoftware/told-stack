import { runPostBuild } from '@told/stack/src/build/post-build';
import { resolveEntries } from '@told/stack/src/build/resolve-entries';
import { entries, requireCallback } from "../../config/src/entries-server";

runPostBuild(resolveEntries(entries, requireCallback), '../_deploy');