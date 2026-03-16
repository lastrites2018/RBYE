import * as React from "react";

interface NavBarProps {
  searchKeyword: string;
  onSearch: (keyword: string) => void;
}

const NavBar: React.FunctionComponent<NavBarProps> = ({
  searchKeyword,
  onSearch,
}) => {
  const [word, setWord] = React.useState("");

  React.useEffect(() => {
    setWord(searchKeyword);
  }, [searchKeyword]);

  const startSearch = (w: string) => {
    onSearch(w);
  };

  return (
    <nav className="flex justify-center mt-2 px-4 mb-3">
      <div className="flex w-full max-w-[640px]">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={word}
            placeholder="전체 텍스트 검색"
            className="border border-solid border-gray-300 h-10 rounded-lg p-2 pr-8 w-full focus:border-teal-500 focus:outline-none"
            onChange={e => setWord(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.nativeEvent.isComposing && startSearch(word)}
          />
          {word && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              onClick={() => { setWord(""); startSearch(""); }}
            >
              &times;
            </button>
          )}
        </div>
        <button
          type="submit"
          className="ml-2 bg-teal-700 hover:bg-teal-600 text-white text-sm py-2 px-4 rounded transition-colors flex-shrink-0"
          value="search"
          onClick={() => startSearch(word)}
        >
          검색
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
