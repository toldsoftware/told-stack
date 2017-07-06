import { Config } from "@told/stack/lib/data-pattern-lookup-lsc/src-config/config";
import { obtainTestBlobData } from "../src/obtain-test-blob-data";

export const config = new Config(obtainTestBlobData, 'api/test-blob');

