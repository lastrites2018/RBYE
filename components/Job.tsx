import React from "react";
import HighLight from "./HighLight";
import normalizeJobText from "../utils/normalizeJobText";
import expandBulletsText from "../utils/expandBullets";
import usePendingAction from "../hooks/usePendingAction";
import useReadabilityStore from "../stores/useReadabilityStore";
import extractYearTag from "../utils/extractYearTag";

interface IJob extends Job {
  searchKeyword: string;
  index: number;
  totalDataCount: number | undefined;
  companyData?: any;
  onHideCompany?: (companyName: string) => void;
  onToggleBookmark?: (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => void;
  isBookmarked?: boolean;
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
  onHideCompany,
  onToggleBookmark,
  isBookmarked,
}: IJob) => {
  const { expandBullets, collapsePreferential, collapseMainTask, isMoreInfo, toggleMoreInfo } = useReadabilityStore();
  const [prefOpen, setPrefOpen] = React.useState(!collapsePreferential);
  const [taskOpen, setTaskOpen] = React.useState(!collapseMainTask);

  React.useEffect(() => { setPrefOpen(!collapsePreferential); }, [collapsePreferential]);
  React.useEffect(() => { setTaskOpen(!collapseMainTask); }, [collapseMainTask]);

  const yearTag = extractYearTag(contentObj?.requirement);

  const fmt = (t: string | undefined) => {
    const normalized = normalizeJobText(t);
    return expandBullets ? expandBulletsText(normalized) : normalized;
  };
  const requirement = fmt(contentObj?.requirement);
  const preferentialTreatment = fmt(contentObj?.preferentialTreatment);
  const mainTask = fmt(contentObj?.mainTask);

  const hideAction = usePendingAction(
    React.useCallback((name: string) => onHideCompany?.(name), [onHideCompany]),
  );
  const pendingHide = hideAction.pendingId === companyName;

  const companyInfoObject =
    companyData?.length > 0 ? companyData[0][companyName] : null;

  return (
    <div className={`p-3 sm:p-5 shadow rounded bg-white mt-3 job-wrapper relative break-word-and-keep-all transition-all ${
      pendingHide ? "border-2 border-dashed border-red-300 opacity-50" : ""
    }`}>
      {/* 오른쪽 상단: 즐겨찾기, ON/OFF, 인덱스 */}
      <div className="absolute flex gap-1 items-center select-none text-xs" style={{ right: "1rem", top: "-0.5rem" }}>
        {onToggleBookmark && !pendingHide && (
          <span
            className={`px-1.5 rounded-full cursor-pointer transition-colors ${
              isBookmarked
                ? "bg-amber-200 text-amber-600"
                : "bg-gray-300 text-gray-500 hover:bg-amber-100 hover:text-amber-500"
            }`}
            onClick={() => onToggleBookmark({ link, companyName, subject, contentObj })}
            title="즐겨찾기"
          >
            {isBookmarked ? "★" : "☆"}
          </span>
        )}
        <span
          className="bg-gray-300 rounded-full text-gray-700 cursor-pointer text-center"
          style={{ width: "2.2rem" }}
          onClick={toggleMoreInfo}
        >
          {isMoreInfo ? "ON" : "OFF"}
        </span>
        <span className="bg-gray-300 px-2 rounded-full text-gray-600">
          {index + 1}/{totalDataCount}
        </span>
      </div>
      {/* 우측 모서리 꼭짓점: 숨기기 */}
      {onHideCompany && (
        <div className="absolute select-none text-xs" style={{ right: "-0.4rem", top: "-0.5rem" }}>
          {pendingHide ? (
            <span
              className="bg-red-100 px-2 rounded-full text-red-500 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={hideAction.cancel}
            >
              취소
            </span>
          ) : (
            <span
              className="bg-gray-300 px-1.5 rounded-full text-gray-500 cursor-pointer hover:bg-red-200 hover:text-red-600 transition-colors"
              onClick={() => hideAction.start(companyName)}
              title={`${companyName} 숨기기`}
            >
              ✕
            </span>
          )}
        </div>
      )}
      <h2 className="text-gray-700">
        {yearTag && (
          <span className="inline-block text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 mr-1.5 align-middle">
            {yearTag}
          </span>
        )}
        <HighLight content={companyName} searchText={searchKeyword} />
      </h2>
      <p className="text-gray-800">
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
            href={`https://www.jobplanet.co.kr/search?query=${encodeURIComponent(
              companyInfoObject?.companyName || companyName
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-gray-800 text-sm inline-block mr-3"
          >
            잡플래닛
          </a>
          <a
            href={`https://www.saramin.co.kr/zf_user/search/company?searchword=${encodeURIComponent(
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
      <h6 className="mt-2 sm:mx-2 md:mx-4 text-sm text-gray-400 font-medium">자격요건</h6>
      <div className="text-gray-600 sm:mx-2 md:mx-4 whitespace-pre-wrap">
        <HighLight content={requirement} searchText={searchKeyword} />
      </div>
      <h6
        className={`mt-3 sm:mx-2 md:mx-4 text-sm text-gray-400 font-medium ${collapsePreferential ? "cursor-pointer select-none" : ""}`}
        onClick={collapsePreferential ? () => setPrefOpen((p) => !p) : undefined}
      >
        우대사항{collapsePreferential && <span className="ml-1 text-xs">{prefOpen ? "▲" : "▼"}</span>}
      </h6>
      {prefOpen && (
        <div className="text-gray-500 mb-2 sm:mx-2 md:mx-4 whitespace-pre-wrap">
          <HighLight
            content={preferentialTreatment}
            searchText={searchKeyword}
          />
        </div>
      )}
      <h6
        className={`mt-3 sm:mx-2 md:mx-4 text-sm text-gray-400 font-medium ${collapseMainTask ? "cursor-pointer select-none" : ""}`}
        onClick={collapseMainTask ? () => setTaskOpen((p) => !p) : undefined}
      >
        주요업무{collapseMainTask && <span className="ml-1 text-xs">{taskOpen ? "▲" : "▼"}</span>}
      </h6>
      {taskOpen && (
        <div className="text-gray-600 mb-2 sm:mx-2 md:mx-4 whitespace-pre-wrap">
          <HighLight content={mainTask} searchText={searchKeyword} />
        </div>
      )}
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

export default React.memo(Jobs);
