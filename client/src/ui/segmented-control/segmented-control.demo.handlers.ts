import { useState } from 'react'

export default function useSegmentedControlDemo() {
  const [range, setRange] = useState('semana')

  return { range, setRange }
}
