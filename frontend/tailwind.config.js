/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // ─── Border Radius ────────────────────────────────────────────────
    borderRadius: {
      sm:      '0.25rem',   // 4px  — small tags, badges
      DEFAULT: '0.5rem',    // 8px  — buttons, inputs, thumbnails
      md:      '0.75rem',   // 12px
      lg:      '1rem',      // 16px — cards, images
      xl:      '1.5rem',    // 24px — large modals
      full:    '9999px',    // pill — avatars, status badges
    },

    extend: {
      // ─── Colors ───────────────────────────────────────────────────────
      colors: {
        // Primary — Ocean Blue
        primary: {
          DEFAULT:   '#004581',
          container: '#005daa',
          fixed:     '#d4e3ff',
          'fixed-dim':        '#a5c8ff',
          'on':               '#ffffff',
          'on-container':     '#bed7ff',
          'on-fixed':         '#001c3a',
          'on-fixed-variant': '#004785',
          inverse:            '#a5c8ff',
          tint:               '#075fac',
        },

        // Secondary — Teal
        secondary: {
          DEFAULT:   '#006a64',
          container: '#6ef4ea',
          fixed:     '#72f7ed',
          'fixed-dim':        '#50dad1',
          'on':               '#ffffff',
          'on-container':     '#006f69',
          'on-fixed':         '#00201e',
          'on-fixed-variant': '#00504b',
        },

        // Tertiary — Sunset Orange / Sand
        tertiary: {
          DEFAULT:   '#6b3700',
          container: '#8d4b00',
          fixed:     '#ffdcc3',
          'fixed-dim':        '#ffb77d',
          'on':               '#ffffff',
          'on-container':     '#ffcba3',
          'on-fixed':         '#2f1500',
          'on-fixed-variant': '#6e3900',
        },

        // Error — Crimson
        error: {
          DEFAULT:      '#ba1a1a',
          container:    '#ffdad6',
          'on':         '#ffffff',
          'on-container': '#93000a',
        },

        // Surface
        surface: {
          DEFAULT:     '#f8f9fa',
          dim:         '#d9dadb',
          bright:      '#f8f9fa',
          variant:     '#e1e3e4',
          'container-lowest':  '#ffffff',
          'container-low':     '#f3f4f5',
          'container':         '#edeeef',
          'container-high':    '#e7e8e9',
          'container-highest': '#e1e3e4',
          'on':                '#191c1d',
          'on-variant':        '#414751',
          'inverse':           '#2e3132',
          'inverse-on':        '#f0f1f2',
        },

        // Background
        background: {
          DEFAULT: '#f8f9fa',
          on:      '#191c1d',
        },

        // Outline
        outline: {
          DEFAULT: '#727782',
          variant: '#c1c6d3',
        },
      },

      // ─── Font Family ──────────────────────────────────────────────────
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
      },

      // ─── Font Size (với lineHeight & letterSpacing) ───────────────────
      fontSize: {
        // Display
        'display-lg': ['3rem', {          // 48px
          lineHeight:    '3.5rem',        // 56px
          letterSpacing: '-0.02em',
          fontWeight:    '700',
        }],
        // Headlines
        'headline-lg': ['2rem', {         // 32px
          lineHeight:    '2.5rem',        // 40px
          letterSpacing: '-0.01em',
          fontWeight:    '700',
        }],
        'headline-lg-mobile': ['1.75rem', { // 28px
          lineHeight:    '2.25rem',          // 36px
          fontWeight:    '700',
        }],
        'headline-md': ['1.5rem', {       // 24px
          lineHeight:    '2rem',          // 32px
          fontWeight:    '600',
        }],
        // Body
        'body-lg': ['1.125rem', {         // 18px
          lineHeight:  '1.75rem',         // 28px
          fontWeight:  '400',
        }],
        'body-md': ['1rem', {             // 16px
          lineHeight:  '1.5rem',          // 24px
          fontWeight:  '400',
        }],
        // Label & Caption
        'label-md': ['0.875rem', {        // 14px
          lineHeight:    '1.25rem',       // 20px
          letterSpacing: '0.05em',
          fontWeight:    '600',
        }],
        'caption': ['0.75rem', {          // 12px
          lineHeight:  '1rem',            // 16px
          fontWeight:  '500',
        }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────
      spacing: {
        'base':           '8px',    // 8px  — base unit
        'gutter':         '24px',   // 24px — column gutter (desktop)
        'margin-mobile':  '16px',   // 16px — page margin (mobile)
        'margin-desktop': '40px',   // 40px — page margin (desktop)
        'section-gap':    '80px',   // 80px — between major sections
      },

      // ─── Max Width ────────────────────────────────────────────────────
      maxWidth: {
        container: '1280px',
      },

      // ─── Box Shadow (Elevation từ DESIGN.md) ─────────────────────────
      boxShadow: {
        // Level 1 — Card resting state (Blur 15px, 4% opacity, Y 4px)
        'card':       '0 4px 15px rgba(0, 0, 0, 0.04)',
        // Level 2 — Card hover state (Y 8px)
        'card-hover': '0 8px 20px rgba(0, 0, 0, 0.08)',
        // Floating — Buttons, Avatars
        'float':      '0 2px 8px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
