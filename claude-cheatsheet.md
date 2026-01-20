# Claude Code Cheatsheet

## Commands

| Command | Description |
|---------|-------------|
| `/exit` | Exit the Claude Code CLI session |
| `/clear` | Clear the conversation history and start fresh |
| `/compact` | Summarize the conversation to reduce context usage |
| `/status` | Check current model and session status |
| `Esc Esc` | Press Escape twice to cancel the current operation or interrupt Claude |

## Changing Models

### During a Session
```bash
/model opus    # Switch to Opus 4.5 (complex reasoning)
/model sonnet  # Switch to Sonnet 4.5 (daily coding)
/model haiku   # Switch to Haiku (fast, simple tasks)
```

### At Startup
```bash
claude --model opus
claude --model sonnet
claude --model haiku
```

### Environment Variable
```bash
export ANTHROPIC_MODEL=opus
```

### Settings File
Edit `~/.claude/settings.json`:
```json
{
  "model": "opus"
}
```
