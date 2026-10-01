import { useState, type FormEvent } from 'react'

export default function useInputDemo() {
  const [value, setValue] = useState('Luna')
  const [result, setResult] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))))
  }

  return { value, setValue, result, handleSubmit }
}
