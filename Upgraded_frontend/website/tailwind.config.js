/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#070B18',
        surface: '#0D1428',
        'surface-2': '#121C33',
        'surface-3': '#16213D',

        line: '#1E2A47',
        'line-strong': '#2A3A5C',

        ink: '#E6ECF8',
        'ink-soft': '#B4C0DA',
        muted: '#8A97B8',
        'muted-2': '#5F6C8A',

        cyan: {
          DEFAULT: '#22D3EE',
          deep: '#0EA5C4',
        },
        electric: '#3B82F6',
        violet: {
          DEFAULT: '#A78BFA',
          deep: '#7C5CF0',
        },

        good: '#34D399',
        bad: '#FB7185',
        warn: '#FBBF24',
      },
      fontFamily: {
        display: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      maxWidth: {
        shell: '1180px',
      },
      boxShadow: {
        panel: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
    },
  },
  plugins: [],
}
