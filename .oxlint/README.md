# Custom Oxlint Plugins

This directory contains custom Oxlint plugins for the Maestroo project.

## React Import Plugin

**File:** `react-import-plugin.js`

### Purpose

Enforces a consistent React import pattern across the codebase by requiring namespace imports only.

### Rules

- ✅ **Allowed:** `import * as React from 'react';`
- ❌ **Disallowed:** `import React from 'react';` (default import)
- ❌ **Disallowed:** `import { useState } from 'react';` (named imports)

### Why Namespace Imports?

1. **Clarity:** Makes it explicit what comes from React (`React.useState`, `React.useEffect`)
2. **Tree-shaking:** Modern bundlers handle namespace imports efficiently
3. **Consistency:** Reduces cognitive load by enforcing one pattern
4. **Future-proof:** Aligns with React's ESM migration

### Usage

The plugin is automatically loaded via `.oxlintrc.json` and will:

1. Detect non-namespace React imports
2. Report warnings during linting
3. Guide developers to use namespace imports manually

### Configuration

```json
{
  "jsPlugins": ["./.oxlint/react-import-plugin.js"],
  "rules": {
    "maestroo-react-imports/namespace-only": "error"
  }
}
```

### Technical Details

This plugin uses Oxlint's optimized JS plugin API:

- `defineRule` and `definePlugin` from `oxlint/plugins-dev` package
- `createOnce` for better performance (rule is initialized once)
- Compatible with both Oxlint and ESLint
- Supports auto-fixing via the `fix` function

### Performance

The plugin uses Oxlint's `createOnce` API which provides better performance by:

- Initializing the rule only once instead of per file
- Enabling Rust-side optimizations for AST traversal
- Skipping files without `ImportDeclaration` nodes

### Development

To modify the plugin:

1. Edit `react-import-plugin.js`
2. Test with `pnpm lint` in the app directory
3. The plugin is reloaded automatically on each lint run

### Future Enhancements

Potential improvements:

- Add support for React type imports
- Configure allowed import patterns via options
- Add more granular control over hook imports
