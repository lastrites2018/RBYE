import React from "react";
import Jobs from "./Job";

interface IJobList {
  data: Job[];
  searchKeyword: string;
  totalDataCount: number | undefined;
  companyData?: any;
  isMoreInfo: boolean;
  handleSetIsMoreInfo: () => void;
  onHideCompany?: (companyName: string) => void;
  onToggleBookmark?: (job: { link: string; companyName: string; subject: string; contentObj?: ContentObj }) => void;
  isBookmarked?: (link: string) => boolean;
  expandBullets?: boolean;
  collapsePreferential?: boolean;
  collapseMainTask?: boolean;
}

export default React.memo(function JobList({
  data,
  searchKeyword,
  totalDataCount,
  companyData,
  isMoreInfo,
  handleSetIsMoreInfo,
  onHideCompany,
  onToggleBookmark,
  isBookmarked,
  expandBullets,
  collapsePreferential,
  collapseMainTask,
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
            isMoreInfo={isMoreInfo}
            handleSetIsMoreInfo={handleSetIsMoreInfo}
            onHideCompany={onHideCompany}
            onToggleBookmark={onToggleBookmark}
            isBookmarked={isBookmarked?.(job.link)}
            expandBullets={expandBullets}
            collapsePreferential={collapsePreferential}
            collapseMainTask={collapseMainTask}
          />
        );
      })}
    </div>
  );
});
