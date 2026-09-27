export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'coffee_shop_theme'

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function readStored(): ThemeMode | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isThemeMode(stored) ? stored : null
  } catch {
    return null
  }
}

/**
 * Light/dark theme.
 *
 * Nuxt UI's `useColorMode` is gone, so this owns the whole lifecycle:
 *  - SSR renders the server-known default and never guesses wrong
 *  - a tiny inline script in `app.vue` applies the stored class before paint,
 *    which is what stops a light→dark flash on first load
 *  - preference is remembered across visits
 *
 * The `.dark` class lands on `<html>`; the `dark` Tailwind variant in
 * assets/css/theme.css is declared as `(&:is(.dark *))` to match.
 */
export function useTheme() {
  const mode = useState<ThemeMode>('theme-mode', () => 'light')

  function apply(next: ThemeMode) {
    mode.value = next
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  function setTheme(next: ThemeMode) {
    apply(next)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Non-fatal: the theme still applies for this session.
    }
  }

  function toggleTheme() {
    setTheme(mode.value === 'dark' ? 'light' : 'dark')
  }

  // Adopt whatever the pre-paint script already put on <html>, so the SSR
  // markup and the client state agree.
  if (import.meta.client && mode.value === 'light' && document.documentElement.classList.contains('dark')) {
    apply('dark')
  }

  // Follow the OS only while the visitor hasn't made an explicit choice.
  if (import.meta.client) {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      if (readStored()) return
      apply(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    if (!readStored() && !document.documentElement.classList.contains('dark')) {
      apply(media.matches ? 'dark' : 'light')
    }
    onBeforeUnmount(() => media.removeEventListener('change', onChange))
  }

  const isDark = computed(() => mode.value === 'dark')

  return { mode, isDark, setTheme, toggleTheme }
}

/**
 * Runs before first paint to set the initial `.dark` class.
 * Kept as a string so it can be inlined in a `<script>` in app.vue.
 */
export const themeNoFlashScript = `(function(){try{var k=${JSON.stringify(STORAGE_KEY)};var s=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s?s==='dark':m;document.documentElement.classList.toggle('dark',d);}catch(e){}})()`
