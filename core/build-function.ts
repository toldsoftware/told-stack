import * as fs from 'fs';
import * as path from 'path';


// Create function.json Files
// Create index.js files

export async function buildFunction(options: {
    destDir: string
}, items: {
    functionName: string,
    functionJsonFile: string,
}[]) {

    const fullPath = path.resolve(options.destDir);
    console.log('buildFunction START', { fullPath });

    // for (let x of items) {
    //     console.log(x.functionName, x.functionJsonFile);
    // }

    console.log('buildFunction START', { fullPath });
}