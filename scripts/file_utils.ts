import { promises as fs } from 'fs';
import path from 'path';

export async function writeFileAtomic(filePath: string, contents: string): Promise<boolean> {
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
  } catch (error) {
    await cleanupTempFile(tempPath);
    throw error;
  }

  return true;
}

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function cleanupTempFile(tempPath: string): Promise<void> {
  try {
    await fs.unlink(tempPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}
