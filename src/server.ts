#!/usr/bin/env node
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createSummarizer } from './summarizer.js';
import { program } from 'commander';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

const DEFAULT_CONFIG = {
  port: 3000
};

async function loadConfig() {
  const projectRoot = process.cwd();
  const configPath = join(projectRoot, 'summarizer.config.json');
  
  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }
  
  try {
    const configContent = await readFile(configPath, 'utf-8');
    console.log(`📄 Loaded config from: ${configPath}`);
    const config = JSON.parse(configContent);
    return {
      ...DEFAULT_CONFIG,
      ...config
    };
  } catch (error) {
    console.warn('Warning: Could not load summarizer.config.json', error);
    return DEFAULT_CONFIG;
  }
}

program
  .option('-p, --port <number>', 'port number to listen on', String(DEFAULT_CONFIG.port))
  .parse(process.argv);

const options = program.opts();

async function startServer() {
  const projectRoot = process.cwd();
  console.log(`🚀 Starting server in: ${projectRoot}`);
  
  const config = await loadConfig();
  const port = parseInt(options.port) || config.port;

  const app = express();
  app.use(express.json());

  const summarizer = createSummarizer();

  // JSON API エンドポイント
  app.get('/api/summarize', async (req, res) => {
    try {
      const patternsStr = req.query.patterns as string;
      const patterns = patternsStr ? patternsStr.split(',').map(p => p.trim()) : undefined;
      
      const summary = await summarizer.summarize({
        projectPath: projectRoot,
        patterns
      });
      
      res.json(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // HTMLビュー用エンドポイント
  app.get('/view/summarize', async (req, res) => {
    try {
      const patternsStr = req.query.patterns as string;
      const patterns = patternsStr ? patternsStr.split(',').map(p => p.trim()) : undefined;
      
      const summary = await summarizer.summarize({
        projectPath: projectRoot,
        patterns
      });
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Summary</title>
    <style>
        body {
            font-family: monospace;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        pre {
            background: #fff;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            tab-size: 2;
            -moz-tab-size: 2;
            white-space: pre;
        }
        button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
        }
        button:hover {
            background: #45a049;
        }
        #content {
            margin-top: 60px;
        }
    </style>
</head>
<body>
    <button onclick="copyToClipboard()">Copy to Clipboard</button>
    <pre id="content">${summary.markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <script>
        async function copyToClipboard() {
            const content = document.getElementById('content').innerText;
            try {
                await navigator.clipboard.writeText(content);
                // alert('Copied to clipboard!');
            } catch (err) {
                alert('Failed to copy: ' + err);
            }
        }
    </script>
</body>
</html>`;
      
      res.send(html);
    } catch (error) {
      console.error('Error generating summary:', error);
      res.status(500).send('Internal server error');
    }
  });



  app.get('/view/structure', async (req, res) => {
    try {
      const summary = await summarizer.generateStructureOnly({
        projectPath: projectRoot
      });
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Structure</title>
    <style>
        body {
            font-family: monospace;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        pre {
            background: #fff;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            tab-size: 2;
            -moz-tab-size: 2;
            white-space: pre;
        }
        button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
        }
        button:hover {
            background: #45a049;
        }
        #content {
            margin-top: 60px;
        }
    </style>
</head>
<body>
    <button onclick="copyToClipboard()">Copy to Clipboard</button>
    <pre id="content">${summary.markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <script>
        async function copyToClipboard() {
            const content = document.getElementById('content').innerText;
            try {
                await navigator.clipboard.writeText(content);
                alert('Copied to clipboard!');
            } catch (err) {
                alert('Failed to copy: ' + err);
            }
        }
    </script>
</body>
</html>`;
      
      res.send(html);
    } catch (error) {
      console.error('Error generating structure:', error);
      res.status(500).send('Internal server error');
    }
  });

  app.listen(port, () => {
    console.log(`🌐 Server running at http://localhost:${port}`);
    console.log('📍 Available endpoints:');
    console.log(`  - Full summary: http://localhost:${port}/view/summarize`);
    console.log(`  - Structure only: http://localhost:${port}/view/structure`);
    console.log(`  - Components summary: http://localhost:${port}/view/components`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});