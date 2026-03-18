import React from "react";
import Jobs from "./Job";

interface IJobList {
  data: Job[];
  searchKeyword: string;
  totalDataCount: number | undefined;
  companyData?: any;
  onHideCompany?: (companyName: string) => void;
  onToggleBookmark?: (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => void;
  isBookmarked?: (link: string) => boolean;
  showYearTag?: boolean;
}

export default React.memo(function JobList({
  data,
  searchKeyword,
  totalDataCount,
  companyData,
  onHideCompany,
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
            companyData={companyData}
            onHideCompany={onHideCompany}
            onToggleBookmark={onToggleBookmark}
            isBookmarked={isBookmarked?.(job.link)}
            showYearTag={showYearTag}
          />
        );
      })}
    </div>
  );
});
