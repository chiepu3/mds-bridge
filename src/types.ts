// src/types.ts
export interface FileInfo {
  path: string;
  content: string;
}

export interface FileEntry {
  path: string;
  content?: string;
  hasContent: boolean;
}

export interface SummaryOptions {
  projectPath: string;
  patterns?: string[];
}

export interface Summary {
  projectName: string;
  files: FileEntry[];
  markdown: string;
}

export interface IgnoreManager {
  initialize(projectRoot: string): Promise<void>;
  shouldIgnore(filePath: string): boolean;
  addPattern(pattern: string): void;
}

export interface FileManager {
  readFileContent(filePath: string): Promise<string | null>;
  findAllFiles(
    dir: string,
    projectRoot: string,
    patterns?: string[]
  ): Promise<FileEntry[]>;
}