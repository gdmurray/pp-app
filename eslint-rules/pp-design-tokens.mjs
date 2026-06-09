/** @type {import('eslint').Rule.RuleModule} */
export const noArbitraryColor = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded hex colors in Tailwind arbitrary values (e.g. text-[#3A86C8])',
    },
    schema: [],
    messages: {
      noArbitraryColor:
        'Use design tokens instead of arbitrary hex colors (e.g. text-primary, bg-muted). See AGENTS.md § Design tokens.',
    },
  },
  create(context) {
    const HEX_IN_CLASS = /\[#([0-9a-fA-F]{3,8})\]/g

    function check(value, node) {
      if (typeof value !== 'string') return
      if (HEX_IN_CLASS.test(value)) {
        context.report({ node, messageId: 'noArbitraryColor' })
      }
    }

    return {
      Literal(node) {
        check(node.value, node)
      },
      TemplateElement(node) {
        check(node.value.raw, node)
      },
    }
  },
}

/** @type {import('eslint').ESLint.Plugin} */
export const ppDesignTokensPlugin = {
  rules: {
    'no-arbitrary-color': noArbitraryColor,
  },
}
