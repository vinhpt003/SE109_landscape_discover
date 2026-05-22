/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {

      // ─── Colors — đúng 100% theo Stitch design tokens ───────────────
      colors: {
        // Primary — Ocean Blue
        primary:                    '#004581',
        'primary-container':        '#005daa',
        'primary-fixed':            '#d4e3ff',
        'primary-fixed-dim':        '#a5c8ff',
        'on-primary':               '#ffffff',
        'on-primary-container':     '#bed7ff',
        'on-primary-fixed':         '#001c3a',
        'on-primary-fixed-variant': '#004785',
        'inverse-primary':          '#a5c8ff',
        'surface-tint':             '#075fac',

        // Secondary — Teal
        secondary:                      '#006a64',
        'secondary-container':          '#6ef4ea',
        'secondary-fixed':              '#72f7ed',
        'secondary-fixed-dim':          '#50dad1',
        'on-secondary':                 '#ffffff',
        'on-secondary-container':       '#006f69',
        'on-secondary-fixed':           '#00201e',
        'on-secondary-fixed-variant':   '#00504b',

        // Tertiary — Sunset Orange / Sand
        tertiary:                      '#6b3700',
        'tertiary-container':          '#8d4b00',
        'tertiary-fixed':              '#ffdcc3',
        'tertiary-fixed-dim':          '#ffb77d',
        'on-tertiary':                 '#ffffff',
        'on-tertiary-container':       '#ffcba3',
        'on-tertiary-fixed':           '#2f1500',
        'on-tertiary-fixed-variant':   '#6e3900',

        // Error — Crimson
        error:                '#ba1a1a',
        'error-container':    '#ffdad6',
        'on-error':           '#ffffff',
        'on-error-container': '#93000a',

        // Surface
        surface:                     '#f8f9fa',
        'surface-dim':               '#d9dadb',
        'surface-bright':            '#f8f9fa',
        'surface-variant':           '#e1e3e4',
        'surface-container-lowest':  '#ffffff',
        'surface-container-low':     '#f3f4f5',
        'surface-container':         '#edeeef',
        'surface-container-high':    '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'on-surface':                '#191c1d',
        'on-surface-variant':        '#414751',
        'inverse-surface':           '#2e3132',
        'inverse-on-surface':        '#f0f1f2',

        // Background
        background:       '#f8f9fa',
        'on-background':  '#191c1d',

        // Outline
        outline:          '#727782',
        'outline-variant': '#c1c6d3',
      },

      // ─── Border Radius ───────────────────────────────────────────────
      borderRadius: {
        DEFAULT: '0.5rem',     // 8px — buttons, inputs
        sm:      '0.25rem',    // 4px
        md:      '0.75rem',    // 12px
        lg:      '1rem',       // 16px — cards
        xl:      '1.5rem',     // 24px
        full:    '9999px',     // pill
      },

      // ─── Spacing ─────────────────────────────────────────────────────
      spacing: {
        'base':             '8px',
        'gutter':           '24px',
        'margin-mobile':    '16px',
        'margin-desktop':   '40px',
        'section-gap':      '80px',
        'container-max':    '1280px',
      },

      // ─── Font Family ─────────────────────────────────────────────────
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // alias ngắn gọn theo design
        'headline-lg':        ['"Plus Jakarta Sans"', 'sans-serif'],
        'headline-md':        ['"Plus Jakarta Sans"', 'sans-serif'],
        'headline-lg-mobile': ['"Plus Jakarta Sans"', 'sans-serif'],
        'display-lg':         ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-lg':            ['"Inter"', 'sans-serif'],
        'body-md':            ['"Inter"', 'sans-serif'],
        'label-md':           ['"Inter"', 'sans-serif'],
        caption:              ['"Inter"', 'sans-serif'],
      },

      // ─── Font Size — scale đúng theo Stitch ─────────────────────────
      fontSize: {
        'display-lg': [
          '48px',
          { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'headline-lg': [
          '32px',
          { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' },
        ],
        'headline-lg-mobile': [
          '28px',
          { lineHeight: '36px', fontWeight: '700' },
        ],
        'headline-md': [
          '24px',
          { lineHeight: '32px', fontWeight: '600' },
        ],
        'body-lg': [
          '18px',
          { lineHeight: '28px', fontWeight: '400' },
        ],
        'body-md': [
          '16px',
          { lineHeight: '24px', fontWeight: '400' },
        ],
        'label-md': [
          '14px',
          { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' },
        ],
        caption: [
          '12px',
          { lineHeight: '16px', fontWeight: '500' },
        ],
      },

      // ─── Box Shadow — ambient shadows từ Stitch ─────────────────────
      boxShadow: {
        card:       '0 4px 15px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.08)',
        float:      '0 2px 8px rgba(0, 0, 0, 0.12)',
        ambient:    '0 4px 15px rgba(0, 0, 0, 0.04)',
      },

      // ─── Max Width ───────────────────────────────────────────────────
      maxWidth: {
        container: '1280px',
      },

      // ─── Backdrop Blur (dùng cho TopNavBar) ─────────────────────────
      backdropBlur: {
        md: '12px',
      },
    },
  },
  plugins: [],
}
