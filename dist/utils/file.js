// src/utils/file.ts
import { readFile, readdir } from 'fs/promises';
import { join, relative } from 'path';
import iconv from 'iconv-lite';
export class FileSystemManager {
    constructor(ignoreManager) {
        this.ignoreManager = ignoreManager;
    }
    isBinaryBuffer(buffer) {
        for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
            if (buffer[i] === 0)
                return true;
        }
        return false;
    }
    async readFileContent(filePath) {
        try {
            const buffer = await readFile(filePath);
            if (this.isBinaryBuffer(buffer)) {
                return null;
            }
            try {
                return buffer.toString('utf-8');
            }
            catch {
                return iconv.decode(buffer, 'shift-jis');
            }
        }
        catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return null;
        }
    }
    async findAllFiles(dir, projectRoot, patterns) {
        const files = [];
        const traverseDir = async (currentDir) => {
            const entries = await readdir(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = join(currentDir, entry.name);
                const relativePath = relative(projectRoot, fullPath).replace(/\\/g, '/');
                if (this.ignoreManager.shouldIgnore(relativePath))
                    continue;
                if (entry.isDirectory()) {
                    await traverseDir(fullPath);
                }
                else {
                    const shouldIncludeContent = !patterns || this.matchesPattern(relativePath, patterns);
                    if (shouldIncludeContent) {
                        const content = await this.readFileContent(fullPath);
                        if (content !== null) {
                            files.push({ path: relativePath, content, hasContent: true });
                        }
                    }
                    else {
                        files.push({ path: relativePath, hasContent: false });
                    }
                }
            }
        };
        await traverseDir(dir);
        return files;
    }
    matchesPattern(filePath, patterns) {
        return patterns.some(pattern => {
            // パターンの正規化: /**/* を /**/ に変換
            pattern = pattern.replace(/\/\*\*\/\*/g, '/**/');
            // ディレクトリ全検索パターンのチェック
            if (pattern.endsWith('/**/') || pattern.endsWith('/**')) {
                const dirPath = pattern.slice(0, -4); // '/**/' または '/**' を除去
                return filePath.startsWith(dirPath);
            }
            // その他のグロブパターンの処理
            const regexPattern = pattern
                .replace(/\/\*\*\//g, '/.*/') // /**/ を /.*/　に変換
                .replace(/\*\*/g, '.*') // ** を .* に変換
                .replace(/\*/g, '[^/]*') // * を [^/]* に変換（スラッシュを含まない任意の文字列）
                .replace(/\?/g, '.') // ? を . に変換
                .replace(/\//g, '\\/'); // / をエスケープ
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(filePath);
        });
    }
}
export const createFileManager = (ignoreManager) => new FileSystemManager(ignoreManager);
//# sourceMappingURL=file.js.map