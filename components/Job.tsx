import HighLight from "./HighLight";

interface IJob extends Job {
  searchKeyword: string;
  index: number;
  totalDataCount: number | undefined;
  companyData?: any;
  isMoreInfo: boolean;
  handleSetIsMoreInfo: () => void;
}

const Jobs = ({
  subject,
  companyName,
  contentObj,
  link,
  closingDate,
  workingArea,
  searchKeyword,
  index,
  totalDataCount,
  companyData,
  isMoreInfo,
  handleSetIsMoreInfo,
}: IJob) => {
  const applyMultipleBlankToOneBlank = (string) =>
    string && string.replace(/  +/g, " ");

  let requirement =
    contentObj.requirement &&
    contentObj?.requirement
      .replace(/\t/g, "") // 스타일 망가뜨리는 탭 문자 제거
      .replace(/• |\* /gi, "- ");

  requirement = applyMultipleBlankToOneBlank(requirement); // 스타일 망가뜨리는 다중 공백 제거

  const companyInfoObject =
    companyData?.length > 0 ? companyData[0][companyName] : null;

  return (
    <div className="p-5 shadow rounded bg-white mt-3 sm:p-3 sm:m-3 job-wrapper relative">
      <div
        className="absolute bg-gray-300 px-2 select-none rounded-full text-gray-700 cursor-pointer"
        style={{
          right: (totalDataCount || 0) > 1000 ? "5.4rem" : "5.2rem",
          top: "-0.5rem",
        }}
        onClick={handleSetIsMoreInfo}
      >
        {isMoreInfo ? "ON" : "OFF"}
      </div>
      <div
        className="absolute bg-gray-300 px-2 select-none rounded-full text-gray-600"
        style={{ right: "1rem", top: "-0.5rem" }}
      >
        {index + 1}/{totalDataCount}
      </div>
      <h2 className="text-gray-700">
        {" "}
        <HighLight content={companyName} searchText={searchKeyword} />
      </h2>
      <p className="text-gray-800">
        {" "}
        <HighLight content={subject} searchText={searchKeyword} />
      </p>
      {isMoreInfo ? (
        <div className="border-solid border-2 border-gray-500 rounded">
          <span className="text-gray-500">외부 링크 : </span>
          {companyInfoObject?.kisCode && (
            <a
              href={`https://www.nicebizinfo.com/ep/EP0100M002GE.nice?kiscode=${companyInfoObject.kisCode}`}
              target="_blank"
              className="underline text-gray-800 mr-3"
            >
              나이스평가
            </a>
          )}
          <a
            href={`https://www.jobplanet.co.kr/search?query=${encodeURI(
              companyInfoObject?.companyName || companyName
            )}`}
            target="_blank"
            className="underline text-gray-800 inline-block mr-3"
          >
            잡플래닛
          </a>
          <a
            href={`http://www.saramin.co.kr/zf_user/search/company?searchword=${encodeURI(
              companyInfoObject?.companyName || companyName
            )}`}
            target="_blank"
            className="underline text-gray-800 inline-block"
          >
            사람인
          </a>
        </div>
      ) : (
        <></>
      )}
      <div className="text-gray-600 sm:m-2 md:m-4 whitespace-pre-wrap">
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
        {workingArea && (
          <p className="ml-2 text-gray-500 text-sm">
            근무지{" "}
            <HighLight content={workingArea} searchText={searchKeyword} />
          </p>
        )}
        <a
          className="text-blue-600 hover:text-blue-400"
          href={link}
          target="blank"
        >
          <HighLight content={link} searchText={searchKeyword} />
        </a>
        {closingDate && (
          <span className="ml-2 text-gray-500">
            마감일{" "}
            <HighLight content={closingDate} searchText={searchKeyword} />
          </span>
        )}
      </div>
    </div>
  );
};

export default Jobs;
