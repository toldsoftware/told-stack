import { runPostBuild } from '@told/stack/lib/build/post-build';
import { resolveEntries } from '@told/stack/lib/build/resolve-entries';
import { entries, requireCallback } from "../config/entries";

runPostBuild(resolveEntries(entries, requireCallback), '../_deploy');