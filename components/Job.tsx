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
    companyData &&
    companyData.length > 0 &&
    companyData.find((object) => object.원래이름 === companyName);

  return (
    <div className="p-5 shadow rounded bg-white mt-3 sm:p-3 sm:m-3 job-wrapper relative">
      <div
        className="absolute bg-gray-300 px-2 select-none rounded-full text-gray-700 cursor-pointer"
        style={{ right: "5.2rem", top: "-0.5rem" }}
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
      {isMoreInfo && companyInfoObject && !companyInfoObject.isError ? (
        <div className="border-solid border-2 border-gray-500 rounded">
          {companyInfoObject.인원 ? (
            <>
              {" "}
              퇴사율 :{" "}
              {companyInfoObject.퇴사율 &&
                Number(companyInfoObject.퇴사율).toFixed(0)}
              % 입사율 :{" "}
              {companyInfoObject.입사율 &&
                Number(companyInfoObject.입사율).toFixed(0)}
              % 인원 : {companyInfoObject.인원}명{" "}
              {companyInfoObject.업력 ? (
                <>업력: {companyInfoObject.업력}년 </>
              ) : (
                ""
              )}
              올해 입사자 평균연봉 : {companyInfoObject.올해입사자평균연봉}{" "}
              평균연봉 : {companyInfoObject.평균연봉}
              <br />
              크레딧잡 정보 체크시점 :{" "}
              {companyInfoObject.updatedAt && companyInfoObject.updatedAt.split(" ")[0] || ""}{" "}
              {/* 크레딧잡 정보 체크시점 : {companyInfoObject.updatedAt}{" "} */}
            </>
          ) : (
            <>
              "크레딧잡 정보 BLOCK ✖️"
              <br />
              크레딧잡 정보 체크시점 :{" "}
              {companyInfoObject.updatedAt && companyInfoObject.updatedAt.split(" ")[0] || ""}
            </>
          )}
          <br />
          <span className="text-gray-500">
            {/* 이 정보는{" "} */}
            출처 :{" "}
            <a
              href={`${companyInfoObject.link || "http://kreditjob.com"}`}
              target="_blank"
              className="underline text-gray-800"
            >
              크레딧잡의 '{companyInfoObject.companyName}' 데이터
            </a>
            {/* 에 기초합니다. */}
            <br />
            <span className="text-gray-500">외부 링크 : </span>
            {companyInfoObject.kisCode && (
              <a
                href={`https://www.nicebizinfo.com/ep/EP0100M002GE.nice?kiscode=${companyInfoObject.kisCode}`}
                target="_blank"
                className="underline text-gray-800 mr-3"
              >
                나이스평가
              </a>
            )}
            {
              <a
                href={`https://www.jobplanet.co.kr/search?query=${encodeURI(
                  companyInfoObject.companyName
                )}`}
                target="_blank"
                className="underline text-gray-800 inline-block mr-3"
              >
                잡플래닛
              </a>
            }
            {
              <a
                href={`http://www.saramin.co.kr/zf_user/search/company?searchword=${encodeURI(
                  companyInfoObject.companyName
                )}`}
                target="_blank"
                className="underline text-gray-800 inline-block"
              >
                사람인
              </a>
            }
          </span>
        </div>
      ) : isMoreInfo ? (
        <div className="border-solid border-2 border-gray-500 rounded">
          RBYE에 기록된 회사 상세 정보가 없습니다.
        </div>
      ) : (
        <></>
      )}
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
