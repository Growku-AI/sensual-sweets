# Security

- Never hardcode secrets, tokens, or keys. Use environment variables.
- Validate and sanitize all external input.
- Don't log credentials or PII.
- Treat dependencies as untrusted; pin versions and review additions.
- Treat MCP servers, skills, and hooks as executable code with tool and filesystem access — review before adding; never wire an unaudited or untrusted one into an autonomous workflow.
- Permission deny-globs (e.g. blocking `curl … | sh`) are a speed bump, not a security boundary — don't rely on them alone.
