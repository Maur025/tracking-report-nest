import { formatDateOfTimestamp } from '../../shared/utils/format-date-of-timestamp.js';
import type {
  AddTableColumnTextParams,
  BuilderPageFooterParams,
  BuilderPageHeaderParams,
  BuilderTableHeaderParams,
} from '../interfaces/table-template.interface.js';
import { commonPdf } from './common-pdf.js';

export const tableTemplate = (document: PDFKit.PDFDocument) => {
  const LOGO_WIDTH: number = 120;
  const {
    getXPositionFromStart,
    addText,
    getPageMarginTop,
    getPageMarginStart,
    getYPositionFromTop,
    getYPositionFromBottom,
    getXPositionFromEnd,
    getUsableWidth,
  } = commonPdf({
    document,
    defaultFont: 'Inter',
  });

  /**
   * Functions to build page and content
   */
  const builderPageTitle = (title: string, hasEnterpriseLogo: boolean) => {
    const xPosition = getXPositionFromStart(hasEnterpriseLogo ? LOGO_WIDTH : 0);

    addText({
      text: title,
      fontSize: 14,
      bold: true,
      x: xPosition,
      y: getPageMarginTop(),
    });
  };

  const builderPageHeader = ({
    username = 'Sin Nombre',
    issueDate,
    filterBy,
    enterpriseName,
    enterpriseLogo,
    zoneId = 'UTC',
  }: BuilderPageHeaderParams) => {
    if (enterpriseLogo) {
      document.image(enterpriseLogo, getPageMarginStart(), getPageMarginTop(), {
        height: 65,
      });
    }

    const xPosition = getXPositionFromStart(enterpriseLogo ? LOGO_WIDTH : 0);

    if (enterpriseName) {
      addText({
        text: enterpriseName,
        fontSize: 12,
        x: xPosition,
        y: getYPositionFromTop(16),
      });
    }

    if (username) addText({ text: `Usuario: ${username}` });
    if (filterBy) addText({ text: `Filtrado por: ${filterBy}` });

    addText({
      text: `Fecha de emisión: ${formatDateOfTimestamp({ timestamp: issueDate, zoneId })}`,
    });

    document.restore();
  };

  const builderTableHeader = ({
    columnHeaders = [],
    xColumns = [],
    y = getPageMarginTop(),
    columnWidths = [],
  }: BuilderTableHeaderParams) => {
    for (let index = 0; index < columnHeaders.length; index++) {
      addTableColumnText({
        value: columnHeaders[index],
        xColumn: xColumns[index],
        width: columnWidths[index],
        y,
      });
    }
  };

  const addTableColumnText = ({
    value,
    xColumn,
    width,
    y = getPageMarginTop(),
  }: AddTableColumnTextParams): void => {
    if (!value) return;

    const {
      text = '',
      fontSize = 11,
      bold,
      italic,
      lineBreak,
      paddingStart,
      paddingEnd,
      paddingX,
    } = value;

    const xPosition = xColumn ?? getPageMarginStart();

    addText({
      text,
      fontSize,
      bold,
      italic,
      x: xPosition + (paddingStart ?? paddingX ?? 0),
      y,
      options: {
        width: getUsableWidth({
          width: width ?? 10,
          paddingStart,
          paddingEnd,
          paddingX,
        }),
        lineBreak,
      },
    });
  };

  const builderPageFooter = ({
    height = 10,
    pageNumber = 0,
    paddingTop = 0,
    zoneId = 'UTC',
  }: BuilderPageFooterParams) => {
    const yPosition = getYPositionFromBottom(height - paddingTop);

    const currentDate = formatDateOfTimestamp({ zoneId });

    addText({
      text: `Página ${pageNumber}`,
      fontSize: 8,
      x: getPageMarginStart(),
      y: yPosition,
      options: { width: 150 },
    });

    addText({
      text: `Fecha de impresión: ${currentDate}`,
      fontSize: 8,
      x: getXPositionFromEnd(150),
      y: yPosition,
      options: { width: 150 },
    });
  };

  return {
    //doc
    document,

    // builders
    builderPageTitle,
    builderPageHeader,
    builderTableHeader,
    builderPageFooter,

    addTableColumnText,
  };
};
