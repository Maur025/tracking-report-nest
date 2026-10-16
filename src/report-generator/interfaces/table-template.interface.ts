export interface BuilderPageHeaderParams {
  username?: string;
  issueDate?: number;
  filterBy?: string;
  enterpriseName?: string;
  enterpriseLogo?: string;
  zoneId?: string;
}

export interface BuilderTableHeaderParams {
  columnHeaders?: TableRowObject[];
  xColumns?: number[];
  y?: number;
  columnWidths?: number[];
}

export interface TableRowObject {
  text?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  lineBreak?: boolean;
  paddingStart?: number;
  paddingEnd?: number;
  paddingX?: number;
}

export interface BuilderPageFooterParams {
  height?: number;
  paddingTop?: number;
  pageNumber?: number;
  zoneId?: string;
}

export interface AddTableColumnTextParams {
  value?: TableRowObject;
  xColumn?: number;
  width?: number;
  y?: number;
}
