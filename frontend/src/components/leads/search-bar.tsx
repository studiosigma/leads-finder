import React, { useState } from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar Component
 * A premium, minimalist search bar inspired by Google/ChatGPT.
 *
 * Features:
 * - Real-time query handling
 * - Visual feedback on focus
 * - Premium hover/transition effects
 */
export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-28 py-4 bg-white border border-zinc-200 rounded-2xl text-lg placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm group-hover:shadow-md"
          placeholder="What business are you looking for? (e.g. Manufacturing Bekasi)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              onClick={handleSearch}
              className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
                Search
            </button>
        </div>
      </div>
    </div>
  );
};
