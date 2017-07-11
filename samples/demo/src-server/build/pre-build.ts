import { runPreBuild } from '@told/stack/src/build/pre-build';
import { entries } from "../../config/src/entries-server";

runPreBuild(entries, '../../config/src/');