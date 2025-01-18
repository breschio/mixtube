
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

const CACHE_DIR = './.cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class FileCache {
  constructor() {
    mkdir(CACHE_DIR).catch(() => {});
  }

  async set(key: string, value: any) {
    const data = {
      value,
      timestamp: Date.now()
    };
    await writeFile(
      join(CACHE_DIR, `${key}.json`),
      JSON.stringify(data)
    );
  }

  async get(key: string) {
    try {
      const data = JSON.parse(
        await readFile(join(CACHE_DIR, `${key}.json`), 'utf8')
      );
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data.value;
      }
    } catch (e) {}
    return null;
  }
}

export const cache = new FileCache();
