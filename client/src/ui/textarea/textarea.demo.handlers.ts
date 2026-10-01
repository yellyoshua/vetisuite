import { useState, type FormEvent } from 'react'

export default function useTextareaDemo() {
  const [value, setValue] = useState('Vacuna al día')
  const [result, setResult] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))))
  }

  return { value, setValue, result, handleSubmit }
}
