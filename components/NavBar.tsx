import * as React from "react";

interface Props {
  searchKeyword: string;
  setSearchKeyword: (searchKeyword: string) => void;
}

const NavBar: React.FunctionComponent<Props> = ({
  searchKeyword,
  setSearchKeyword
}) => {
  const [word, setWord] = React.useState("");

  React.useEffect(() => {
    if (!searchKeyword) setWord("");
  }, [searchKeyword]);

  return (
    <nav className="flex justify-around mt-2">
      <div>
        <input
          type="text"
          value={word}
          placeholder="전체 텍스트 검색"
          className="border border-solid border-blue-700 h-10 rounded-lg p-2"
          onChange={e => setWord(e.target.value)}
          onKeyPress={e => e.key === "Enter" && setSearchKeyword(word)}
        />
        <button
          type="submit"
          className="ml-2 bg-blue-600 text-white font-bold py-2 px-4 border-b-4 hover:border-b-2 hover:border-t-2 border-blue-dark hover:border-blue rounded"
          value="search"
          onClick={() => setSearchKeyword(word)}
        >
          검색
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
