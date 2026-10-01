import { useState, type FormEvent } from 'react'

export default function useSwitchDemo() {
  const [value, setValue] = useState(true)
  const [result, setResult] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))))
  }

  return { value, setValue, result, handleSubmit }
}
