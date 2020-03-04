interface ContentObj {
  requirement: string;
  preferentialTreatment: string;
  mainTask: string;
}

interface Job {
  companyName: string;
  contentObj: ContentObj;
  no: number;
  subject: string;
  workingArea: string;
  closingDate: string;
  link: string;
}

export type { ContentObj, Job };