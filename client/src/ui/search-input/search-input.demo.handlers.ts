import { useState } from 'react'

export default function useSearchInputDemo() {
  const [query, setQuery] = useState('')

  return { query, setQuery }
}
