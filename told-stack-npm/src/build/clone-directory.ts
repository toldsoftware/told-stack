import * as fs from 'fs-extra';
import * as path from 'path';

export async function cloneDirectory(args: { sourceDir: string, destDir: string, excluded?: RegExp[] }) {

    const src = path.resolve(args.sourceDir);
    const dest = path.resolve(args.destDir);
    const excluded = args.excluded;

    console.log('cloneDirectory: START', { args, src, dest });

    await fs.copy(src, dest, {
        overwrite: true,
        filter: excluded && excluded.length ? (x => {
            // console.log('PATH', x);
            return args.excluded.every(r => !x.match(r));
        }) : undefined
    });

    console.log('cloneDirectory: DONE');
}