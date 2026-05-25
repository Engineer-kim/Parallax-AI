export function blockHistoryNavigation() {
  if (typeof window === 'undefined') return

  history.pushState(null, '', location.href)

  const handlePopState = () => {
    history.go(1)
  }

  window.addEventListener('popstate', handlePopState)

  return () => {
    window.removeEventListener('popstate', handlePopState)
  }
}