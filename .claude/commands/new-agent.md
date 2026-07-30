---
description: Create a new repo-specific subagent via the agent-factory meta-agent
argument-hint: [role and purpose, e.g. "supabase-agent for schema + RLS work"]
allowed-tools: Agent, Read, Grep, Glob
---

## Goal

Create a new subagent for this repo.

Request: $ARGUMENTS

## Task

1. If `$ARGUMENTS` is empty, ask the user for: the agent's role/name, its
   purpose, and whether it needs write access (Write/Edit) or just read access
   (Read/Grep/Glob) — then wait for their answer before continuing.
2. Otherwise, delegate directly to the `agent-factory` agent, passing the full
   request (`$ARGUMENTS`) as the task description.
3. Relay the agent-factory's report back to the user: file path written,
   description trigger phrases, tools granted and why, and the suggested test
   invocation.

Do not create or edit any files yourself — the `agent-factory` agent owns file
creation for new agents.
