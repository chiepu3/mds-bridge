# MDS Bridge (mds-bridge)

[English](./README.md) | [日本語](./README.ja.md)

Model Development Synopsis (MDS) Bridge - A tool to create summaries of your codebase for LLM development.

## Overview

MDS Bridge is a specialized tool designed to facilitate communication between developers and Large Language Models (LLMs) like ChatGPT and Claude during development. It generates structured summaries of your codebase, allowing LLMs to efficiently understand and work with large projects.

## Features

- 📁 Generate comprehensive project structure summaries
- 🔍 Selective file content inclusion with pattern matching
- 🌐 Built-in server for easy access to summaries
- 🎯 Customizable ignore patterns
- 💻 CLI and server interfaces

## Installation

```bash
npm install -g mds-bridge
```

## Usage

### CLI

```bash
# Generate summary for current directory
mds

# Generate summary with specific file patterns
mds -p "src/**/*.ts,src/**/*.tsx"

# Save summary to specific file
mds -o summary.md

# Generate only file paths
mds --create-paths

# Analyze another directory
mds ../other-project
```

### Server

```bash
# Start server with default port (3000)
mds-server

# Start server with custom port
mds-server -p 8080
```

### Server Endpoints

- `http://localhost:3000/view/summarize` - Full project summary
- `http://localhost:3000/view/structure` - Project structure only


## Configuration

### summarizer.config.json

```json
{
  "port": 3000
}
```

### Ignore Files

- `.gitignore` - Automatically respected
- `.summaryignore` - Additional patterns to ignore

## Examples

### Basic Summary Generation

```bash
mds -o project_summary.md
```

This will create a markdown file containing:
- Project structure
- File contents (based on patterns)
- Easily copyable format for LLM interaction

### Running the Server

```bash
mds-server
```

Access `http://localhost:3000/view/summarize` in your browser to:
- View the project summary
- Copy content with one click
- Share summaries with team members

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.