import * as React from "react";
import { useStore } from "../store";

const NavBar: React.FunctionComponent = () => {
  const [word, setWord] = React.useState("");

  const searchKeyword = useStore((state) => state.searchKeyword);
  const setSearchKeyword = useStore((state) => state.setSearchKeyword);
  const setYear = useStore((state) => state.setYear);
  const setCurrentCategory = useStore((state) => state.setCurrentCategory);

  React.useEffect(() => {
    if (!searchKeyword) setWord("");
  }, [searchKeyword]);

  const startSearch = (word: string) => {
    setYear(0);
    setSearchKeyword(word);
    setCurrentCategory("전체");
  };

  return (
    <nav className="flex justify-around mt-2">
      <div>
        <input
          type="text"
          value={word}
          placeholder="전체 텍스트 검색"
          className="border border-solid border-blue-700 h-10 rounded-lg p-2 w-56"
          onChange={e => setWord(e.target.value)}
          onKeyPress={e => e.key === "Enter" && startSearch(word)}
        />
        <button
          type="submit"
          className="ml-2 bg-blue-600 text-white font-bold py-2 px-4 border-b-4 hover:border-b-2 hover:border-t-2 border-blue-dark hover:border-blue rounded"
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
