import Markdown from "react-markdown";

const Jobs = ({ subject, companyName, contentObj, link, 마감일 }) => (
  <div className="p-4 shadow rounded bg-white mt-2 sm:p-2 sm:m-2">
    <h1 className="text-green-500 text-3xl ">{companyName}</h1>
    <p className="text-gray-800">{subject}</p>
    <div className="text-red-800 sm:m-2 md:m-10">
      <Markdown source={contentObj["자격요건"].replace(/• /gi, "- • ")} />
    </div>
    <h6 className="sm:m-2 md:m-4">우대사항</h6>
    <p className="text-gray-500 mb-2 sm:m-2 md:m-4">{contentObj["우대사항"]}</p>
    <h6 className="sm:m-2 md:m-4">주요업무</h6>
    <p className="text-gray-600 mb-2 sm:m-2 md:m-4">{contentObj["주요업무"]}</p>
    <div className="text-right">
      <a
        className="text-blue-600 hover:text-blue-400"
        href={link}
        target="blank"
      >
        {link}
      </a>
      <span className="ml-2 text-gray-500">마감일 {마감일}</span>
    </div>
  </div>
);

export default Jobs;