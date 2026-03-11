import React, { useState, useRef, useCallback } from "react";
import HighLight from "./HighLight";

interface IJob extends Job {
  searchKeyword: string;
  index: number;
  totalDataCount: number | undefined;
  companyData?: any;
  isMoreInfo: boolean;
  handleSetIsMoreInfo: () => void;
  onHideCompany?: (companyName: string) => void;
  onToggleBookmark?: (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => void;
  isBookmarked?: boolean;
}

/** 줄머리 불릿 문자 패턴 */
const BULLET_CHARS = "ㆍ•■□▶▷◆◇○";
const LINE_START_BULLET_RE = new RegExp(`^[${BULLET_CHARS}\\*]\\s*`, "gm");

/**
 * 공고 텍스트 정규화: 내용 손상 없이 가독성 향상
 * - 줄머리 불릿(ㆍ•○ 등) → "- "로 통일
 * - 문장 중간 불릿("스피킹ㆍ라이팅")은 보존
 * - 인라인 불릿("• A • B")은 줄바꿈으로 분리
 * - 불릿 항목 사이 불필요한 빈 줄 제거
 */
function normalizeJobText(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/\t/g, "")
    // 인라인 불릿 분리: "내용 • 다음항목" → "내용\n• 다음항목" (줄 중간에 공백+불릿+공백)
    .replace(new RegExp(`\\s+([${BULLET_CHARS}])\\s+`, "g"), (_, bullet, offset, str) => {
      // 줄 시작 불릿은 건드리지 않음 (이미 줄머리)
      const before = str.lastIndexOf("\n", offset);
      const lineStart = str.substring(before + 1, offset).trim();
      if (lineStart === "") return ` ${bullet} `; // 줄머리는 그대로
      return `\n${bullet} `;
    })
    // 줄머리 불릿 통일: ㆍ, •, *, ■ 등 → "- "
    .replace(LINE_START_BULLET_RE, "- ")
    // 불릿 항목 사이 빈 줄 제거
    .replace(/^(- .+)\n{2,}(?=- )/gm, "$1\n")
    // 3줄 이상 빈 줄 → 1줄
    .replace(/\n{3,}/g, "\n\n")
    // 다중 공백 → 단일 공백
    .replace(/  +/g, " ")
    // 앞뒤 빈 줄 제거
    .replace(/^\n+/, "")
    .trim();
}

const PENDING_DELAY = 1500;

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
  onHideCompany,
  onToggleBookmark,
  isBookmarked,
}: IJob) => {
  const requirement = normalizeJobText(contentObj?.requirement);
  const preferentialTreatment = normalizeJobText(contentObj?.preferentialTreatment);
  const mainTask = normalizeJobText(contentObj?.mainTask);

  const [pendingHide, setPendingHide] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const startHide = useCallback(() => {
    setPendingHide(true);
    hideTimer.current = setTimeout(() => {
      onHideCompany?.(companyName);
    }, PENDING_DELAY);
  }, [onHideCompany, companyName]);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
    setPendingHide(false);
  }, []);

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
          onClick={handleSetIsMoreInfo}
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
              onClick={cancelHide}
            >
              취소
            </span>
          ) : (
            <span
              className="bg-gray-300 px-1.5 rounded-full text-gray-500 cursor-pointer hover:bg-red-200 hover:text-red-600 transition-colors"
              onClick={startHide}
              title={`${companyName} 숨기기`}
            >
              ✕
            </span>
          )}
        </div>
      )}
      <h2 className="text-gray-700">
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
      <div className="text-gray-600 mt-2 sm:mx-2 md:mx-4 whitespace-pre-wrap">
        <HighLight content={requirement} searchText={searchKeyword} />
      </div>
      <h6 className="mt-3 sm:mx-2 md:mx-4 font-semibold">우대사항</h6>
      <div className="text-gray-500 mb-2 sm:mx-2 md:mx-4 whitespace-pre-wrap">
        <HighLight
          content={preferentialTreatment}
          searchText={searchKeyword}
        />
      </div>
      <h6 className="mt-3 sm:mx-2 md:mx-4 font-semibold">주요업무</h6>
      <div className="text-gray-600 mb-2 sm:mx-2 md:mx-4 whitespace-pre-wrap">
        <HighLight content={mainTask} searchText={searchKeyword} />
      </div>
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
