import React from "react";
import Highlighter from "react-highlight-words";

export default function HighLight({ searchText, content }) {
  return (
    <>
      <Highlighter
        highlightStyle={{ backgroundColor: "pink", padding: 0 }}
        searchWords={[searchText]}
        autoEscape={true}
        textToHighlight={content}
      />
    </>
  );
}
