import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    /*
     * Trading type scale — see src/design-system/TYPE-SCALE.md.
     *
     * Scoped to the migrated surfaces only. Widen the glob as later batches
     * land; do not switch it on for a folder before migrating it, or the rule
     * fails on day one and gets disabled on day one.
     */
    files: ['src/components/terminal/**/*.{js,jsx}', 'src/components/trade/**/*.{js,jsx}'],
    ignores: [
      /*
       * Not yet migrated — see the burn-down list in TYPE-SCALE.md. Delete each
       * entry as its batch lands. Turning the rule on ahead of the migration is
       * how a lint rule gets switched off permanently.
       */
      'src/components/terminal/strategyTrading/**',
      'src/components/terminal/VaultsMobileNavBar.jsx',
      'src/components/trade/TradeAlertsBar.jsx',
      'src/components/trade/TradeBottomPanel.jsx',
      'src/components/trade/TradeChartPanel.jsx',
      'src/components/trade/TradeDataTable.jsx',
      'src/components/trade/TradeMarketSelect.jsx',
      'src/components/trade/tradeCells.jsx',
      'src/components/trade/tradeTableColumns.jsx',
      /* Dead code — nothing imports these; delete rather than migrate. */
      'src/components/terminal/CopilotStrategyDetailStrip.jsx',
      'src/components/terminal/CopilotStrategyLensKpis.jsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/text-\\[\\d+(\\.\\d+)?px\\]/]',
          message:
            'Arbitrary font size on a trading surface. Use text-anchor | text-control | text-data | text-micro | text-meta | ds-eyebrow — src/design-system/TYPE-SCALE.md',
        },
        {
          selector: 'TemplateElement[value.raw=/text-\\[\\d+(\\.\\d+)?px\\]/]',
          message:
            'Arbitrary font size on a trading surface. Use the type scale — src/design-system/TYPE-SCALE.md',
        },
        {
          selector: 'Literal[value=/font-(semibold|bold|extrabold|black)/]',
          message:
            'Weight is capped at 500 on trading surfaces. Use the ink ladder (text-ink / text-ink-muted / text-ink-subtle) for hierarchy — src/design-system/TYPE-SCALE.md',
        },
        {
          selector: 'TemplateElement[value.raw=/font-(semibold|bold|extrabold|black)/]',
          message:
            'Weight is capped at 500 on trading surfaces. Use the ink ladder for hierarchy — src/design-system/TYPE-SCALE.md',
        },
      ],
    },
  },
  {
    /* Brand wordmark is a logo lockup, not content type — exempt by design. */
    files: [
      'src/components/terminal/HeaderTerminal.jsx',
      'src/components/terminal/CopilotMobileHeader.jsx',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },
])
