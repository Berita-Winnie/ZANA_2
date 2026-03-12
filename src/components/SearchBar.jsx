import { useState } from 'react'
import { Search } from 'lucide-react'

/**
 * Generic dashboard search bar.
 * Expects a flat array of results and a render function.
 */
export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    onSearch?.(trimmed)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm max-w-xl w-full"
    >
      <Search size={18} className="text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search schools, resources, or distributions..."
        className="flex-1 border-none outline-none text-sm bg-transparent placeholder:text-gray-400"
      />
      <button
        type="submit"
        className="text-xs font-medium bg-[#253290] text-white rounded-full px-3 py-1 hover:bg-[#1b2568]"
      >
        Search
      </button>
    </form>
  )
}

