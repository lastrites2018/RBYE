import React from "react";
import Jobs from "./Job";

export default React.memo(function JobList({ data, searchKeyword }: any) {
  return (
    <div className="break-word-and-keep-all">
      {data.map((job: Job) => {
        return <Jobs key={job.no} searchKeyword={searchKeyword} {...job} />;
      })}
    </div>
  );
});
