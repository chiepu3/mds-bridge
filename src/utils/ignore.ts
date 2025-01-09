// src/utils/ignore.ts
import { readFile } from 'fs/promises';
import { join } from 'path';
import ignore from 'ignore';
import type { IgnoreManager } from '../types.js';

export class IgnorePatternManager implements IgnoreManager {
  private readonly ig = ignore();
  
  constructor(private readonly defaultPatterns: string[]) {
    this.ig.add(defaultPatterns);
  }

  async initialize(projectRoot: string): Promise<void> {
    // Load .gitignore
    try {
      const gitignorePath = join(projectRoot, '.gitignore');
      const gitignore = await readFile(gitignorePath, 'utf-8');
      this.ig.add(gitignore.split('\n').filter(line => line.trim() && !line.startsWith('#')));
      console.log(`📄 Loaded .gitignore from: ${gitignorePath}`);
    } catch (error) {
      console.log('ℹ️  .gitignore not found');
    }

    // Load .summaryignore
    try {
      const summaryignorePath = join(projectRoot, '.summaryignore');
      const summaryignore = await readFile(summaryignorePath, 'utf-8');
      this.ig.add(summaryignore.split('\n').filter(line => line.trim() && !line.startsWith('#')));
      console.log(`📄 Loaded .summaryignore from: ${summaryignorePath}`);
    } catch (error) {
      console.log('ℹ️  .summaryignore not found');
    }
  }

  shouldIgnore(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return this.ig.ignores(normalizedPath);
  }

  addPattern(pattern: string): void {
    this.ig.add(pattern);
  }
}

export const createIgnoreManager = (defaultPatterns: string[]) => 
  new IgnorePatternManager(defaultPatterns);