#!/usr/bin/env node
import { program } from 'commander';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createSummarizer } from './summarizer.js';

const summarizer = createSummarizer();

program
  .name('mds')
  .description('Model Development Synopsis (MDS) Bridge - Generate codebase summaries for LLM development')
  .version('1.0.0')
  .argument('[path]', 'project path (defaults to current directory)')
  .option('-p, --patterns <patterns>', 'file patterns to include (comma-separated)')
  .option('-o, --output <file>', 'output file path')
  .option('--structure', 'output only directory structure')
  .addHelpText('after', `
Examples:
  $ mds                                  # Summarize current directory
  $ mds -p "src/**/*.ts,src/**/*.tsx"   # Summarize TypeScript files
  $ mds -o summary.md                    # Save to specific file
  $ mds --structure                      # Output only directory structure
  $ mds ../other-project                # Summarize another directory`)
  .action(async (path: string | undefined, options: { patterns?: string, output?: string, structure?: boolean }) => {
    try {
      const projectPath = path ? join(process.cwd(), path) : process.cwd();
      console.log(`📂 Analyzing project at: ${projectPath}`);

      if (options.structure) {
        const summary = await summarizer.generateStructureOnly({ projectPath });
        const outputPath = options.output || './structure.md';
        await writeFile(outputPath, summary.markdown);
        console.log(`✅ Directory structure has been saved to ${outputPath}`);
      } else {
        const patterns = options.patterns?.split(',').map((p: string) => p.trim());
        const summary = await summarizer.summarize({ projectPath, patterns });
        const outputPath = options.output || `./${summary.projectName}_summary.md`;
        await writeFile(outputPath, summary.markdown);
        console.log(`✅ Summary has been saved to ${outputPath}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

program.parse();