export function qs(key) {
  const qs = new URLSearchParams(window.location.search)
  return qs.get(key)
}