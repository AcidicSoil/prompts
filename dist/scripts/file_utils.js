import { promises as fs } from 'fs';
import path from 'path';
export async function writeFileAtomic(filePath, contents) {
    const existing = await readFileIfExists(filePath);
    if (existing === contents) {
        return false;
    }
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    const tempPath = path.join(dir, `.${base}.${process.pid}.${Date.now()}.tmp`);
    try {
        await fs.writeFile(tempPath, contents, 'utf8');
        await fs.rename(tempPath, filePath);
    }
    catch (error) {
        await cleanupTempFile(tempPath);
        throw error;
    }
    return true;
}
async function readFileIfExists(filePath) {
    try {
        return await fs.readFile(filePath, 'utf8');
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
async function cleanupTempFile(tempPath) {
    try {
        await fs.unlink(tempPath);
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}
