import React from "react";
import Jobs from "./Job";

interface IJobList {
  data: Job[];
  searchKeyword: string;
  totalDataCount: number | undefined;
  isMoreInfo: boolean;
  companyData?: any;
  onHideCompany?: (companyName: string) => void;
  onToggleMoreInfo: () => void;
  onToggleBookmark?: (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => void;
  isBookmarked?: (link: string) => boolean;
  showYearTag?: boolean;
}

export default React.memo(function JobList({
  data,
  searchKeyword,
  totalDataCount,
  isMoreInfo,
  companyData,
  onHideCompany,
  onToggleMoreInfo,
  onToggleBookmark,
  isBookmarked,
  showYearTag,
}: IJobList) {
  return (
    <div className="break-word-and-keep-all">
      {data.map((job: Job, index: number) => {
        return (
          <Jobs
            key={job.no}
            searchKeyword={searchKeyword}
            {...job}
            index={index}
            totalDataCount={totalDataCount}
            isMoreInfo={isMoreInfo}
            companyData={companyData}
            onHideCompany={onHideCompany}
            onToggleMoreInfo={onToggleMoreInfo}
            onToggleBookmark={onToggleBookmark}
            isBookmarked={isBookmarked?.(job.link)}
            showYearTag={showYearTag}
          />
        );
      })}
    </div>
  );
});
