const INITIALS_LENGTH = 2

function isNameWord(word: string): boolean {
  return /^\p{L}/u.test(word) && word.length > 2 && !word.endsWith('.')
}

export function getInitials(name: string): string {
  const nameWords = name.split(/\s+/).filter(isNameWord)
  const words = nameWords.length > 0 ? nameWords : [name.trim()]
  if (words.length === 1) {
    return words[0].slice(0, INITIALS_LENGTH).toUpperCase()
  }

  return words
    .slice(0, INITIALS_LENGTH)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
