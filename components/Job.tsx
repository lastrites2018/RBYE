import HighLight from "./HighLight";

const Jobs = ({
  subject,
  companyName,
  contentObj,
  link,
  closingDate,
  workingArea,
  searchKeyword
}: Job) => (
  <div className="p-4 shadow rounded bg-white mt-2 sm:p-2 sm:m-2">
    <h2 className="text-gray-700">{companyName}</h2>
    <p className="text-gray-800">{subject}</p>
    <div className="text-gray-600 sm:m-2 md:m-10 whitespace-pre-wrap">
      <HighLight
        content={contentObj?.requirement.replace(/• |\* /gi, "- ")}
        searchText={searchKeyword}
      />
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
        {/* {link} */}
        <HighLight content={link} searchText={searchKeyword} />
      </a>
      <span className="ml-2 text-gray-500">
        마감일 <HighLight content={closingDate} searchText={searchKeyword} />
      </span>
    </div>
  </div>
);

export default Jobs;
