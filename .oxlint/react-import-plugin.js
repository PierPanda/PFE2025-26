import { definePlugin, defineRule } from "oxlint/plugins-dev";

const rule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        'Enforce namespace import for React (import * as React from "react")',
      category: "Best Practices",
    },
    messages: {
      defaultImport:
        'Use namespace import instead: import * as React from "react"',
      namedImport:
        'Use namespace import instead: import * as React from "react"',
    },
  },

  createOnce(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "react") {
          return;
        }

        const namespaceSpecifier = node.specifiers.find(
          (spec) => spec.type === "ImportNamespaceSpecifier",
        );

        if (namespaceSpecifier) {
          return;
        }

        const defaultSpecifier = node.specifiers.find(
          (spec) => spec.type === "ImportDefaultSpecifier",
        );

        if (defaultSpecifier) {
          context.report({
            node,
            messageId: "defaultImport",
          });
          return;
        }

        const namedSpecifiers = node.specifiers.filter(
          (spec) => spec.type === "ImportSpecifier",
        );

        if (namedSpecifiers.length > 0) {
          context.report({
            node,
            messageId: "namedImport",
          });
        }
      },
    };
  },
});

const plugin = definePlugin({
  meta: {
    name: "maestroo-react-imports",
    version: "1.0.0",
  },
  rules: {
    "namespace-only": rule,
  },
});

export default plugin;
