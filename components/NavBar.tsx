import * as React from "react";

interface NavBarProps {
  searchKeyword: string;
  setSearchKeyword: (searchKeyword: string) => void;
  setYear: (year: number) => void;
  setCurrentCategory: (category: string) => void;
}

const NavBar: React.FunctionComponent<NavBarProps> = ({
  searchKeyword,
  setSearchKeyword,
  setYear,
  setCurrentCategory,
}) => {
  const [word, setWord] = React.useState("");

  React.useEffect(() => {
    if (!searchKeyword) setWord("");
  }, [searchKeyword]);

  const startSearch = (word: string) => {
    setYear(0);
    setSearchKeyword(word);
    setCurrentCategory("전체");
  };

  return (
    <nav className="flex justify-center mt-2 px-4 mb-3">
      <div className="flex w-full max-w-[640px]">
        <input
          type="text"
          value={word}
          placeholder="전체 텍스트 검색"
          className="border border-solid border-gray-300 h-10 rounded-lg p-2 flex-1 min-w-0 focus:border-teal-500 focus:outline-none"
          onChange={e => setWord(e.target.value)}
          onKeyDown={e => e.key === "Enter" && startSearch(word)}
        />
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
