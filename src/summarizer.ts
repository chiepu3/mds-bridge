// src/summarizer.ts
import { basename } from 'path';
import type { FileEntry, SummaryOptions, Summary } from './types.js';
import { createIgnoreManager } from './utils/ignore.js';
import { createFileManager } from './utils/file.js';

const SELF_FILES = [
  'summarizer.ts',
  'server.ts',
  'cli.ts',
  'types.ts',
  'package.json',
  'tsconfig.json',
  'node_modules',
  'dist'
];

const DEFAULT_IGNORE = [
  ...SELF_FILES,
  '.git',
  '.env',
  '*.log',
  'coverage',
  '*.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.DS_Store',
  'thumbs.db',
  'summarize/**/*'
];

export class ProjectSummarizer {
  private readonly ignoreManager;
  private readonly fileManager;
  private initialized = false;

  constructor() {
    this.ignoreManager = createIgnoreManager(DEFAULT_IGNORE);
    this.fileManager = createFileManager(this.ignoreManager);
  }

  private async ensureInitialized(projectRoot: string): Promise<void> {
    if (!this.initialized) {
      await this.ignoreManager.initialize(projectRoot);
      this.initialized = true;
    }
  }

  private generateDirectoryStructure(files: FileEntry[], showContentStatus: boolean = true): string {
    let markdown = '';
    const tree: { [key: string]: any } = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (!current._files) current._files = [];
          current._files.push({
            name: part,
            hasContent: file.hasContent
          });
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      });
    });

    function renderTree(node: any, prefix: string = '', level: number = 0): void {
      const indent = '  '.repeat(level);
      
      Object.keys(node)
        .filter(key => key !== '_files')
        .sort()
        .forEach(dir => {
          markdown += `${indent}- ${prefix}${dir}/\n`;
          renderTree(node[dir], '', level + 1);
        });
      
      if (node._files) {
        node._files.sort((a: any, b: any) => a.name.localeCompare(b.name))
          .forEach((file: { name: string, hasContent: boolean }) => {
            const suffix = showContentStatus && !file.hasContent ? ' (content not included)' : '';
            markdown += `${indent}- ${file.name}${suffix}\n`;
          });
      }
    }

    renderTree(tree);
    return markdown;
  }
  
  generatePathMarkdown(projectRoot: string, files: FileEntry[]): string {
    let markdown = `# File Paths\n\n`;
    files.sort((a, b) => a.path.localeCompare(b.path))
      .forEach(file => {
        markdown += `- \`${projectRoot}/${file.path}\`\n`;
      });
    return markdown;
  }


  private generateFileContents(files: FileEntry[]): string {
    let markdown = '';
    
    files.filter(f => f.hasContent && f.content)
      .sort((a, b) => a.path.localeCompare(b.path))
      .forEach(file => {
        markdown += `### ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
      });
    
    return markdown;
  }

  async summarize(options: SummaryOptions): Promise<Summary> {
    const { projectPath, patterns } = options;
    
    await this.ensureInitialized(projectPath);
    
    const files = await this.fileManager.findAllFiles(
      projectPath, 
      projectPath, 
      patterns
    );
    const projectName = basename(projectPath);
    let markdown = `# ${projectName}\n\n## Directory Structure\n\n`;
    
    markdown += this.generateDirectoryStructure(files);
    markdown += '\n## File Contents\n\n';
    markdown += this.generateFileContents(files);
    
    return {
      projectName,
      files,
      markdown
    };
  }

  
  async generateStructureOnly(options: SummaryOptions): Promise<Summary> {
    const { projectPath } = options;
    
    await this.ensureInitialized(projectPath);
    
    const files = await this.fileManager.findAllFiles(projectPath, projectPath);
    const projectName = basename(projectPath);
    let markdown = `# ${projectName}\n\n## Directory Structure\n\n`;
    
    markdown += this.generateDirectoryStructure(files, false);
    
    return {
      projectName,
      files,
      markdown
    };
  }
}

export const createSummarizer = () => new ProjectSummarizer();