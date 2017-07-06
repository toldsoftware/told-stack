import { Config } from "@told/stack/lib/data-pattern-lookup-lsc/src-config/config";

export const config = new Config(async () => { return { data: 'TEST ' + new Date() } as any; });

