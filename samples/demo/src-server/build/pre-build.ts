import { runPreBuild } from '@told/stack/src/build/pre-build';
import { entries } from "../../config/src/entries-server";
import { testEntries } from "../../config/src/tests-server";

runPreBuild(entries, '../../config/src/');
runPreBuild(testEntries, '../../config/src/', '_intermediate_tests');