# MDS Bridge

[English](./README.md) | [日本語](./README.ja.md)

A tool for summarizing codebases for LLM development

## Overview

When developing with LLMs like ChatGPT or Claude, managing your codebase's context becomes increasingly challenging as your project grows. This tool helps you efficiently share only the necessary code with your AI assistant.

## Key Benefits

In LLM-assisted development, it's common practice to provide AI with system specifications and entire source code for comprehension. However, as codebases grow, they quickly hit token limits. This necessitates a way to selectively share only the relevant files for the current development task.

This tool allows you to share your project's directory structure with LLMs upfront, enabling efficient sharing of only the necessary files. With its local server feature, you can easily retrieve and share files through your browser.

For example, here's how it works:

```
👤 User: I'm getting an "Invalid credentials" error during login and can't log in.
       I'm sure the password is correct...

🤖 Assistant: Let me check the authentication process in both frontend and backend.
    First, I need to see the project structure:
http://localhost:3000/view/structure

[After reviewing structure]
Now, let me check the frontend authentication files:
http://localhost:3000/view/summarize?patterns=src/hooks/useAuth.ts,src/components/Auth/**/*

[After checking frontend]
I'll also need to verify the backend authentication:
http://localhost:5120/view/summarize?patterns=src/routes/auth/**/*

[After review]
I found the issue. When the frontend sends the password, the hashing process...
```

Users can simply click the URLs and use the copy button to provide code to the AI. Since the AI already understands the project structure, it can precisely specify which files it needs.

## Installation

```bash
npm install -g @chiepu3/mds-bridge
```

## Basic Usage

### Command Line Tool

Basic commands to generate project summaries:

```bash
# Summarize current directory
mds

# Include specific files only
mds -p "src/**/*.ts"

# Specify output file
mds -o summary.md

# Output directory structure only
mds --structure

# Output structure to specific file
mds --structure -o structure.md

# Analyze another directory
mds ../other-project
```

### Server Mode

Start a summary server accessible via browser:

```bash
# Start with default port (3000)
mds-server

# Start with custom port
mds-server -p 8080
```

Available endpoints:
- `http://localhost:3000/view/summarize` - Project summary
- `http://localhost:3000/view/structure` - Directory structure only
- `http://localhost:3000/view/components` - React components summary

## Customization

### Configuration: summarizer.config.json

```json
{
  "port": 3000
}
```

### Ignore Patterns

Specify patterns to ignore in:
- `.gitignore` - Git ignore patterns are automatically respected
- `.summaryignore` - Additional patterns (supports `*.md` or `test/**/*` format)

## License

MIT License - see [LICENSE](LICENSE) for details.