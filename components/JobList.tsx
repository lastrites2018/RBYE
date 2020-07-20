import React from "react";
import Jobs from "./Job";

interface IJobList {
  data: Job[];
  searchKeyword: string;
  totalDataCount: number | undefined;
  companyData?: any;
  isMoreInfo: boolean;
  handleSetIsMoreInfo : () => void;
}

export default React.memo(function JobList({
  data,
  searchKeyword,
  totalDataCount,
  companyData,
  isMoreInfo,
  handleSetIsMoreInfo
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
          />
        );
      })}
    </div>
  );
});
