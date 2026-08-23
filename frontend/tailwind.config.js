/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        clinical: {
          navy: '#0F294A',
          primary: '#1E3A8A',
          secondary: '#3B82F6',
          light: '#F0F7FF',
          panel: '#F8FAFC',
          border: '#E2E8F0',
          darkText: '#0F172A',
          mutedText: '#64748B',
        },
        psych: {
          purple: '#7C3AED',
          purpleLight: '#FAF5FF',
          purpleDark: '#581C87',
          purpleBorder: '#E9D5FF',
        },
        risk: {
          low: '#10B981',
          moderate: '#F59E0B',
          high: '#EF4444',
          lowBg: '#ECFDF5',
          modBg: '#FFFBEB',
          highBg: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        clinical: '0 4px 12px -2px rgba(15, 41, 74, 0.08)',
      },
    },
  },
  plugins: [],
};
