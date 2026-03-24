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
  searchKeyword?: string;
}

interface BookmarkEntry {
  link: string;
  companyName: string;
  subject: string;
  contentObj?: ContentObj;
  savedAt?: string;
}
