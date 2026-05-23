import { useState } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark(prev => {
      document.documentElement.setAttribute('data-theme', prev ? 'light' : 'dark')
      return !prev
    })
  }

  return {
    isDark,
    toggleTheme,
  }
}
