import React from "react";
import Highlighter from "react-highlight-words";

interface IHighlight {
  searchText: string | undefined;
  content: string;
}

export default function HighLight({ searchText, content }: IHighlight) {
  if (!searchText) {
    return <>{content}</>;
  }

  return (
    <>
      <Highlighter
        highlightStyle={{ backgroundColor: "pink", padding: 0 }}
        searchWords={[searchText && searchText]}
        autoEscape={true}
        textToHighlight={content && content.toString()}
      />
    </>
  );
}
