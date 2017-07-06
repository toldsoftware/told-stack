import * as path from 'path';

export function joinImportPath(prefix: string, importPath: string) {
    const p = importPath[0] === '@'
        ? importPath
        : path.join(prefix, importPath).replace(/\\/g, '/');
    return p;
}