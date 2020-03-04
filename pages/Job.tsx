import Markdown from "react-markdown";

const Jobs = ({
  subject,
  companyName,
  contentObj,
  link,
  closingDate,
  workingArea
}: Job) => (
  <div className="p-4 shadow rounded bg-white mt-2 sm:p-2 sm:m-2">
    <h2 className="text-gray-700">{companyName}</h2>
    <p className="text-gray-800">{subject}</p>
    <div className="text-gray-600 sm:m-2 md:m-10">
      <Markdown source={contentObj?.requirement.replace(/• /gi, "- • ")} />
    </div>
    <h6 className="sm:m-2 md:m-4">우대사항</h6>
    <p className="text-gray-500 mb-2 sm:m-2 md:m-4">
      {contentObj?.preferentialTreatment}
    </p>
    <h6 className="sm:m-2 md:m-4">주요업무</h6>
    <p className="text-gray-600 mb-2 sm:m-2 md:m-4">{contentObj?.mainTask}</p>
    <div className="text-right">
      <p className="ml-2 text-gray-500 text-sm">근무지 {workingArea}</p>
      <a
        className="text-blue-600 hover:text-blue-400"
        href={link}
        target="blank"
      >
        {link}
      </a>
      <span className="ml-2 text-gray-500">마감일 {closingDate}</span>
    </div>
  </div>
);

export default Jobs;
