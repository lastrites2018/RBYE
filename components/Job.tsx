import React from "react";
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
    <div className="p-3 sm:p-5 mx-3 sm:mx-0 shadow rounded bg-white mt-3 job-wrapper relative">
      <div
        className="absolute bg-gray-300 px-2 select-none rounded-full text-gray-700 cursor-pointer text-xs"
        style={{
          right: (totalDataCount || 0) > 1000 ? "5.4rem" : "5.2rem",
          top: "-0.5rem",
        }}
        onClick={handleSetIsMoreInfo}
      >
        {isMoreInfo ? "ON" : "OFF"}
      </div>
      <div
        className="absolute bg-gray-300 px-2 select-none rounded-full text-gray-600 text-xs"
        style={{ right: "1rem", top: "-0.5rem" }}
      >
        {index + 1}/{totalDataCount}
      </div>
      <h2 className="text-gray-700 text-base sm:text-lg">
        <HighLight content={companyName} searchText={searchKeyword} />
      </h2>
      <p className="text-gray-800 text-sm sm:text-base">
        <HighLight content={subject} searchText={searchKeyword} />
      </p>
      {isMoreInfo ? (
        <div className="border-solid border-2 border-gray-500 rounded p-2 mt-2">
          <span className="text-gray-500 text-sm">외부 링크 : </span>
          {companyInfoObject?.kisCode && (
            <a
              href={`https://www.nicebizinfo.com/ep/EP0100M002GE.nice?kiscode=${companyInfoObject.kisCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-gray-800 text-sm mr-3"
            >
              나이스평가
            </a>
          )}
          <a
            href={`https://www.jobplanet.co.kr/search?query=${encodeURI(
              companyInfoObject?.companyName || companyName
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-gray-800 text-sm inline-block mr-3"
          >
            잡플래닛
          </a>
          <a
            href={`https://www.saramin.co.kr/zf_user/search/company?searchword=${encodeURI(
              companyInfoObject?.companyName || companyName
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-gray-800 text-sm inline-block"
          >
            사람인
          </a>
        </div>
      ) : (
        <></>
      )}
      <div className="text-gray-600 text-sm mt-2 mx-0 sm:mx-2 md:mx-4 whitespace-pre-wrap">
        <HighLight content={requirement} searchText={searchKeyword} />
      </div>
      <h6 className="mt-3 mx-0 sm:mx-2 md:mx-4 text-sm font-semibold">우대사항</h6>
      <p className="text-gray-500 text-sm mb-2 mx-0 sm:mx-2 md:mx-4">
        <HighLight
          content={contentObj?.preferentialTreatment}
          searchText={searchKeyword}
        />
      </p>
      <h6 className="mt-3 mx-0 sm:mx-2 md:mx-4 text-sm font-semibold">주요업무</h6>
      <p className="text-gray-600 text-sm mb-2 mx-0 sm:mx-2 md:mx-4">
        <HighLight content={contentObj?.mainTask} searchText={searchKeyword} />
      </p>
      <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs sm:text-sm">
        {workingArea && (
          <span className="text-gray-500">
            근무지{" "}
            <HighLight content={workingArea} searchText={searchKeyword} />
          </span>
        )}
        {closingDate && (
          <span className="text-gray-500">
            마감일{" "}
            <HighLight content={closingDate} searchText={searchKeyword} />
          </span>
        )}
        <a
          className="text-teal-600 hover:text-teal-400"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          원문 보기
        </a>
      </div>
    </div>
  );
};

export default Jobs;
