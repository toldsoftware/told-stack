import { runPreBuild } from '@told/stack/lib/build/pre-build';
import { entries } from "../config/entries";

runPreBuild(entries, '../_deploy');