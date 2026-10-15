import path from 'node:path';
import { cwd } from 'node:process';
import PdfKit from 'pdfkit';
import {
  initializeDocumentParams,
  LoadFontsParams,
  RegisterFontParams,
} from '../interfaces/generate-pdf.interface.js';
import { unitConversion } from '../utils/unit-conversion.js';

export const initializeDocument = ({
  pageSize = 'LETTER',
  pageMargins = {},
  bufferPages = false,
  fonts = ['Roboto'],
}: initializeDocumentParams): PDFKit.PDFDocument => {
  const { top = 0, bottom = 0, left = 0, right = 0, unit = 'cm' } = pageMargins;

  const document = new PdfKit({
    bufferPages,
    size: pageSize,
    margins: {
      top: unitConversion(top, unit),
      bottom: unitConversion(bottom, unit),
      left: unitConversion(left, unit),
      right: unitConversion(right, unit),
    },
  });

  loadFonts({ fonts, document });

  return document;
};

const loadFonts = ({ fonts, document }: LoadFontsParams) => {
  if (fonts.length <= 0) return;

  const fontPath = path.join(cwd(), 'src/report/fonts');

  for (const fontName of fonts) {
    if (!fontName) {
      continue;
    }

    registerFont({ font: fontName, document, fontPath });
  }
};

const registerFont = ({ font, document, fontPath }: RegisterFontParams) => {
  const fontFolderPath = path.join(fontPath, font.toLowerCase());

  document.registerFont(font, `${fontFolderPath}/${font}-Regular.ttf`);
  document.registerFont(`${font}-Bold`, `${fontFolderPath}/${font}-Bold.ttf`);
  document.registerFont(
    `${font}-BoldItalic`,
    `${fontFolderPath}/${font}-BoldItalic.ttf`,
  );
  document.registerFont(
    `${font}-Italic`,
    `${fontFolderPath}/${font}-Italic.ttf`,
  );
};
