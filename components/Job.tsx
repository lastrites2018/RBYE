import HighLight from "./HighLight";

const Jobs = ({
  subject,
  companyName,
  contentObj,
  link,
  closingDate,
  workingArea,
  searchKeyword
}: Job) => {
  const applyMultipleBlankToOneBlank = string =>
    string && string.replace(/  +/g, " ");

  let requirement =
    contentObj.requirement &&
    contentObj?.requirement
      .replace(/\t/g, "") // 스타일 망가뜨리는 탭 문자 제거
      .replace(/• |\* /gi, "- ");

  requirement = applyMultipleBlankToOneBlank(requirement); // 스타일 망가뜨리는 다중 공백 제거

  return (
    <div className="p-5 shadow rounded bg-white mt-3 sm:p-3 sm:m-3">
      <h2 className="text-gray-700">
        {" "}
        <HighLight content={companyName} searchText={searchKeyword} />
      </h2>
      <p className="text-gray-800">
        {" "}
        <HighLight content={subject} searchText={searchKeyword} />
      </p>
      <div className="text-gray-600 sm:m-2 md:m-10 whitespace-pre-wrap">
        <HighLight content={requirement} searchText={searchKeyword} />
      </div>
      <h6 className="sm:m-2 md:m-4">우대사항</h6>
      <p className="text-gray-500 mb-2 sm:m-2 md:m-4">
        <HighLight
          content={contentObj?.preferentialTreatment}
          searchText={searchKeyword}
        />
      </p>
      <h6 className="sm:m-2 md:m-4">주요업무</h6>
      <p className="text-gray-600 mb-2 sm:m-2 md:m-4">
        <HighLight content={contentObj?.mainTask} searchText={searchKeyword} />
      </p>
      <div className="text-right">
        <p className="ml-2 text-gray-500 text-sm">
          근무지 <HighLight content={workingArea} searchText={searchKeyword} />
        </p>
        <a
          className="text-blue-600 hover:text-blue-400"
          href={link}
          target="blank"
        >
          <HighLight content={link} searchText={searchKeyword} />
        </a>
        <span className="ml-2 text-gray-500">
          마감일 <HighLight content={closingDate} searchText={searchKeyword} />
        </span>
      </div>
    </div>
  );
};

export default Jobs;
