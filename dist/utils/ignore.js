// src/utils/ignore.ts
import { readFile } from 'fs/promises';
import { join } from 'path';
import ignore from 'ignore';
export class IgnorePatternManager {
    constructor(defaultPatterns) {
        this.defaultPatterns = defaultPatterns;
        this.ig = ignore();
        this.ig.add(defaultPatterns);
    }
    async initialize(projectRoot) {
        // Load .gitignore
        try {
            const gitignorePath = join(projectRoot, '.gitignore');
            const gitignore = await readFile(gitignorePath, 'utf-8');
            this.ig.add(gitignore.split('\n').filter(line => line.trim() && !line.startsWith('#')));
            console.log(`📄 Loaded .gitignore from: ${gitignorePath}`);
        }
        catch (error) {
            console.log('ℹ️  .gitignore not found');
        }
        // Load .summaryignore
        try {
            const summaryignorePath = join(projectRoot, '.summaryignore');
            const summaryignore = await readFile(summaryignorePath, 'utf-8');
            this.ig.add(summaryignore.split('\n').filter(line => line.trim() && !line.startsWith('#')));
            console.log(`📄 Loaded .summaryignore from: ${summaryignorePath}`);
        }
        catch (error) {
            console.log('ℹ️  .summaryignore not found');
        }
    }
    shouldIgnore(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        return this.ig.ignores(normalizedPath);
    }
    addPattern(pattern) {
        this.ig.add(pattern);
    }
}
export const createIgnoreManager = (defaultPatterns) => new IgnorePatternManager(defaultPatterns);
//# sourceMappingURL=ignore.js.map