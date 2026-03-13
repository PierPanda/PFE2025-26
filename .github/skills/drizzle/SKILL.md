---
name: drizzle
description: Drizzle ORM schema and database guide. Use when working with database schemas (src/database/schemas/*), defining tables, creating migrations, or database model code. Triggers on Drizzle schema definition, database migrations, or ORM usage questions.
---

# Drizzle ORM Schema Style Guide

## Configuration

- Config: `packages/db/drizzle.config.ts`
- Schemas: `packages/db/src/schemas-definitions/`
- Migrations: `packages/db/drizzle/migrations/`
- Dialect: `postgresql` with `strict: true`

## Naming Conventions

- **Tables**: Singular snake_case (`user`, `session_group`)
- **Columns**: snake_case (`user_id`, `created_at`)

## Column Definitions

### Primary Keys

```typescript
id: uuid('id').$default(uuidv7).primaryKey(),
```

ID prefixes make entity types distinguishable. For internal tables, use `uuid` except for better-auth related tables.

### Foreign Keys

```typescript
userId: uuid('user_id')
  .references(() => users.id, { onDelete: 'cascade' })
  .notNull(),
```

### Indexes

```typescript
// Return array (object style deprecated)
(t) => [uniqueIndex('client_id_user_id_unique').on(t.clientId, t.userId)],
```

## Type Inference

```typescript
export const insertAgentSchema = createInsertSchema(agents);
export type NewAgent = typeof agents.$inferInsert;
export type AgentItem = typeof agents.$inferSelect;
```

## Example Pattern

```typescript
export const agents = pgTable(
  'agents',
  {
    id: uuid('id').$default(uuidv7)
      .primaryKey()
    slug: varchar('slug', { length: 100 })
      .$defaultFn(() => randomSlug(4))
      .unique(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: uuid('client_id'),
    chatConfig: jsonb('chat_config').$type<LobeAgentChatConfig>(),
    createdAt: timestamp('created_at').$defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$defaultNow().notNull(),
  },
  (t) => [uniqueIndex('client_id_user_id_unique').on(t.clientId, t.userId)],
);
```

## Common Patterns

### Junction Tables (Many-to-Many)

```typescript
export const agentsKnowledgeBases = pgTable(
  'agents_knowledge_bases',
  {
    agentId: uuid('agent_id')
      .references(() => agents.id, { onDelete: 'cascade' })
      .notNull(),
    knowledgeBaseId: uuid('knowledge_base_id')
      .references(() => knowledgeBases.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    enabled: boolean('enabled').default(true),
    createdAt: timestamp('created_at').$defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.agentId, t.knowledgeBaseId] })],
);
```

## Database Migrations

See `references/db-migrations.md` for detailed migration guide.

```bash
# Generate migrations
pnpm db generate

# Run migrations
pnpm db migrate

# Push migration
pnpm db push
```

Before doing a push, always try to migrate first.

### Migration Best Practices

```sql
-- ✅ Idempotent operations
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" text;
DROP TABLE IF EXISTS "old_table";
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");

-- ❌ Non-idempotent
ALTER TABLE "users" ADD COLUMN "avatar" text;
```
