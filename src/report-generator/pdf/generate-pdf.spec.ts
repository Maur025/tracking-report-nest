import PdfKit from 'pdfkit';
import { describe, expect, it, vi } from 'vitest';
import { unitConversion } from '../utils/unit-conversion.js';
import { initializeDocument } from './generate-pdf.js';

describe('initializeDocument', () => {
  it('should create a document with the default page size and no margins', () => {
    // WHEN
    const document = initializeDocument({});

    // THEN
    expect(document.page.width).toBe(612);
    expect(document.page.height).toBe(792);
    expect(document.page.margins.top).toBe(0);
    expect(document.page.margins.bottom).toBe(0);
    expect(document.page.margins.left).toBe(0);
    expect(document.page.margins.right).toBe(0);
  });

  it('should convert the margins expressed in centimeters into points', () => {
    // WHEN
    const document = initializeDocument({
      pageMargins: { top: 2, bottom: 1, left: 2.5, right: 1, unit: 'cm' },
    });

    // THEN
    expect(document.page.margins.top).toBeCloseTo(unitConversion(2, 'cm'), 5);
    expect(document.page.margins.bottom).toBeCloseTo(unitConversion(1, 'cm'), 5);
    expect(document.page.margins.left).toBeCloseTo(unitConversion(2.5, 'cm'), 5);
    expect(document.page.margins.right).toBeCloseTo(unitConversion(1, 'cm'), 5);
  });

  it('should keep the margins expressed in points', () => {
    // WHEN
    const document = initializeDocument({
      pageMargins: { top: 10, bottom: 20, left: 30, right: 40, unit: 'pt' },
    });

    // THEN
    expect(document.page.margins.top).toBe(10);
    expect(document.page.margins.bottom).toBe(20);
    expect(document.page.margins.left).toBe(30);
    expect(document.page.margins.right).toBe(40);
  });

  it('should use the a4 page size when it is requested', () => {
    // WHEN
    const document = initializeDocument({ pageSize: 'A4' });

    // THEN
    expect(document.page.width).toBeCloseTo(595.28, 1);
    expect(document.page.height).toBeCloseTo(841.89, 1);
  });

  it('should register the four variants of every requested font', () => {
    // GIVEN
    const registerFont = vi.spyOn(PdfKit.prototype, 'registerFont');

    // WHEN
    initializeDocument({ fonts: ['Inter'] });

    // THEN
    expect(registerFont).toHaveBeenCalledTimes(4);
    expect(registerFont).toHaveBeenCalledWith(
      'Inter',
      expect.stringContaining('inter/Inter-Regular.ttf'),
    );
    expect(registerFont).toHaveBeenCalledWith(
      'Inter-Bold',
      expect.stringContaining('inter/Inter-Bold.ttf'),
    );
    expect(registerFont).toHaveBeenCalledWith(
      'Inter-BoldItalic',
      expect.stringContaining('inter/Inter-BoldItalic.ttf'),
    );
    expect(registerFont).toHaveBeenCalledWith(
      'Inter-Italic',
      expect.stringContaining('inter/Inter-Italic.ttf'),
    );

    registerFont.mockRestore();
  });

  it('should not register any font when the list is empty', () => {
    // GIVEN
    const registerFont = vi.spyOn(PdfKit.prototype, 'registerFont');

    // WHEN
    initializeDocument({ fonts: [] });

    // THEN
    expect(registerFont).not.toHaveBeenCalled();

    registerFont.mockRestore();
  });

  it('should register the roboto font variants', () => {
    // GIVEN
    const registerFont = vi.spyOn(PdfKit.prototype, 'registerFont');

    // WHEN
    initializeDocument({ fonts: ['Roboto'] });

    // THEN
    expect(registerFont).toHaveBeenCalledTimes(4);
    expect(registerFont).toHaveBeenCalledWith(
      'Roboto',
      expect.stringContaining('roboto/Roboto-Regular.ttf'),
    );

    registerFont.mockRestore();
  });
});
