import { Logger } from '@nestjs/common';
import type {
  CalculateCellMaxHeightParams,
  RenderTableBodyParams,
  ReportTableParams,
} from '../interfaces/table-report.interface.js';
import { commonPdf } from './common-pdf.js';
import { tableTemplate } from './table-template.js';

const logger = new Logger('reportTable');

export const reportTable =
  <T>({
    dataSource,
    mainTitle = 'REPORT EXAMPLE',
    pageHeader = {},
    table = {},
    zoneId = 'UTC',
  }: ReportTableParams<T>) =>
  (document: PDFKit.PDFDocument): PDFKit.PDFDocument => {
    const {
      columnWidths = [],
      columnHeaders = [],
      columnRows = () => [],
    } = table;

    const { getTableXColumnPositions, addHorizontalLine } = commonPdf({
      document,
      defaultFont: 'Inter',
    });

    const {
      builderPageTitle,
      builderPageHeader,
      builderTableHeader,
      builderPageFooter,
    } = tableTemplate(document);

    let pageNumber = 1;

    builderPageTitle(mainTitle, !!pageHeader.enterpriseLogo);
    builderPageHeader({ ...pageHeader, zoneId });

    document.moveDown(2);

    const xColumns = getTableXColumnPositions(columnWidths);

    let yPosition = document.y;

    builderTableHeader({ columnHeaders, xColumns, y: yPosition, columnWidths });

    yPosition += 15;

    addHorizontalLine({ y: yPosition });

    yPosition += 10;
    const footerHeight = 30;

    builderPageFooter({
      height: footerHeight,
      pageNumber,
      paddingTop: 10,
      zoneId,
    });

    document.on('pageAdded', () => {
      pageNumber++;
      builderPageFooter({
        height: footerHeight,
        pageNumber,
        paddingTop: 10,
        zoneId,
      });
    });

    void renderTableBody<T>({
      document,
      y: yPosition,
      columnWidths,
      footerHeight,
      xColumns,
      columnRows,
      dataSource,
    });

    return document;
  };

const renderTableBody = async <T>({
  document,
  dataSource,
  y,
  columnWidths = [],
  columnRows = () => [],
  footerHeight = 0,
  xColumns = [],
}: RenderTableBodyParams<T>): Promise<void> => {
  let yPosition = y;

  const { getUsableWidth, getTextHeight, getYPositionFromBottom, addNewPage } =
    commonPdf({
      document,
      defaultFont: 'Inter',
    });

  const { addTableColumnText } = tableTemplate(document);

  try {
    let index = 1;

    for await (const item of dataSource()) {
      const values = columnRows(item, index);

      const maxCellHeight = calculateCellMaxHeight({
        columnWidths,
        values,
        getUsableWidth,
        getTextHeight,
      });

      if (yPosition + maxCellHeight > getYPositionFromBottom(footerHeight)) {
        yPosition = addNewPage();
      }

      for (let index = 0; index < columnWidths.length; index++) {
        addTableColumnText({
          value: values[index],
          xColumn: xColumns[index],
          width: columnWidths[index],
          y: yPosition,
        });
      }

      yPosition += maxCellHeight + 6;

      index++;
    }

    document.end();
  } catch (error) {
    logger.error('[PDF] Error occurred while consuming data iterator', error);
    document.destroy(error instanceof Error ? error : new Error(String(error)));
  }
};

const calculateCellMaxHeight = ({
  columnWidths = [],
  values = [],
  getUsableWidth = () => 0,
  getTextHeight = () => 0,
}: CalculateCellMaxHeightParams) => {
  let maxCellHeight = 0;

  for (let index = 0; index < columnWidths.length; index++) {
    const {
      text = '',
      fontSize = 9,
      paddingStart,
      paddingEnd,
      paddingX,
    } = values[index] || {};

    const cellHeight = getTextHeight({
      text,
      fontSize,
      width: getUsableWidth({
        width: columnWidths[index] ?? 10,
        paddingStart,
        paddingEnd,
        paddingX,
      }),
    });

    if (cellHeight > maxCellHeight) {
      maxCellHeight = cellHeight;
    }
  }

  return maxCellHeight;
};

/* 
Puedes ayudarme a generar documentación precisa y detallada para este proyecto, puedes crear una carpeta docs y agregar todo lo relevante ahi, necesito que cualquier persona que lea esa documentación entienda fácilmente el proyecto, incluso si no estoy presente para explicarlo.

1. Estado actual del proyecto.
2. Tecnologías que se están utilizando conjuntamente con sus versiones.
3. La forma en la que pueden levantar el proyecto.
5. Documentar y explicar el propósito de todas las variables de entorno.
6. No ahondar en enseñar como se usan las tecnologías, prefiero que les agregues el enlace a la documentación oficial, pero si debes explicar el propósito de esa tecnología en este proyecto.
*/
