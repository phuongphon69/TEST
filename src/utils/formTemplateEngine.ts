import { Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, Packer } from 'docx';
import * as XLSX from 'xlsx';
import { FormTemplateItem, GeneratedFormRecord } from '../types';
import { getStored, setStored, addAuditLog, getCurrentUser } from './storage';
import { INITIAL_FORM_TEMPLATES } from '../data/initialFormTemplates';

const FORM_TEMPLATES_KEY = 'qlrpbm_form_templates';
const GENERATED_FORMS_KEY = 'qlrpbm_generated_forms';

export function getFormTemplates(): FormTemplateItem[] {
  return getStored<FormTemplateItem[]>(FORM_TEMPLATES_KEY, INITIAL_FORM_TEMPLATES);
}

export function saveFormTemplates(templates: FormTemplateItem[], logMsg?: string): void {
  setStored(FORM_TEMPLATES_KEY, templates);
  if (logMsg) addAuditLog('Quản lý Biểu mẫu', logMsg);
}

export function getGeneratedForms(): GeneratedFormRecord[] {
  return getStored<GeneratedFormRecord[]>(GENERATED_FORMS_KEY, []);
}

export function saveGeneratedForms(forms: GeneratedFormRecord[], logMsg?: string): void {
  setStored(GENERATED_FORMS_KEY, forms);
  if (logMsg) addAuditLog('Quản lý Biểu mẫu', logMsg);
}

// Word Export (.docx)
export async function generateDocxBlob(template: FormTemplateItem, mappedData: Record<string, any>): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'BỘ QUỐC PHÒNG - BINH CHỦNG CÔNG BINH', bold: true, size: 24, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 24, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', underline: { type: 'single' }, size: 22, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: template.name.toUpperCase(), bold: true, size: 32, font: 'Times New Roman', color: '104E8B' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Mã biểu mẫu: ${template.code} | Ngày lập: ${new Date().toLocaleDateString('vi-VN')}`, italics: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 300 } }),

          // Filled values
          ...Object.entries(mappedData).map(([key, value]) => {
            return new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({ text: `${key.replace(/[{}]/g, '')}: `, bold: true, size: 24, font: 'Times New Roman' }),
                new TextRun({ text: String(value || 'N/A'), size: 24, font: 'Times New Roman' }),
              ],
            });
          }),

          new Paragraph({ text: '', spacing: { after: 400 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Ghi chú / Ý kiến phê duyệt: ................................................................................................................', italics: true, size: 22, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 600 } }),

          // Signature Block
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NGƯỜI LẬP BIỂU MẪU', bold: true, font: 'Times New Roman' })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', italics: true, font: 'Times New Roman' })] }),
                      new Paragraph({ text: '', spacing: { after: 1000 } }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: getCurrentUser().name, bold: true, font: 'Times New Roman' })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'THỦ TRƯỞNG PHÊ DUYỆT', bold: true, font: 'Times New Roman' })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, đóng dấu)', italics: true, font: 'Times New Roman' })] }),
                      new Paragraph({ text: '', spacing: { after: 1000 } }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Thượng tá Nguyễn Văn Hùng', bold: true, font: 'Times New Roman' })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadDocxFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Excel Export (.xlsx)
export function exportFormToExcel(template: FormTemplateItem, mappedData: Record<string, any>, filename: string): void {
  const dataRows = [
    ['BỘ QUỐC PHÒNG - BINH CHỦNG CÔNG BINH', ''],
    ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 'Độc lập - Tự do - Hạnh phúc'],
    ['', ''],
    [template.name.toUpperCase(), ''],
    [`Mã biểu mẫu: ${template.code}`, `Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`],
    ['', ''],
    ['TÊN TRƯỜNG DỮ LIỆU', 'NỘI DUNG TỰ ĐỘNG NHẬP TỪ HỆ THỐNG'],
    ...Object.entries(mappedData).map(([key, val]) => [key.replace(/[{}]/g, ''), String(val || '')]),
    ['', ''],
    ['Người lập biểu mẫu', 'Thủ trưởng phê duyệt'],
    [getCurrentUser().name, 'Thượng tá Nguyễn Văn Hùng']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Biểu Mẫu');
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
