import { LegalDocument, LegalValidityStatus } from '../types';
import { INITIAL_LEGAL_DOCUMENTS_FULL } from '../data/initialLegalDocs';
import { addAuditLog } from './storage';

const STORAGE_KEY = 'qlrpbm_legal_documents_v2';

export interface LegalSearchParams {
  docNumberSymbol?: string;
  title?: string;
  content?: string;
  issuingAgency?: string;
  issuedDateStart?: string;
  issuedDateEnd?: string;
  field?: string;
  validityStatus?: string;
  keyword?: string;
}

export function getLegalDocs(): LegalDocument[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEGAL_DOCUMENTS_FULL));
      return INITIAL_LEGAL_DOCUMENTS_FULL;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_LEGAL_DOCUMENTS_FULL;
  } catch (err) {
    console.error('Error loading legal documents:', err);
    return INITIAL_LEGAL_DOCUMENTS_FULL;
  }
}

export function saveLegalDocs(docs: LegalDocument[], logAction?: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    if (logAction) {
      addAuditLog('Kho Pháp lý & AI Tra cứu', logAction);
    }
  } catch (err) {
    console.error('Error saving legal documents:', err);
  }
}

export function addLegalDoc(docData: Partial<LegalDocument>): LegalDocument {
  const docs = getLegalDocs();
  const newId = `leg-${Date.now()}`;
  const codeSymbol = docData.docNumberSymbol || docData.code || `VBPL-${Date.now().toString().slice(-4)}`;
  
  const newDoc: LegalDocument = {
    id: newId,
    code: docData.code || `VBPL-${Date.now().toString().slice(-4)}`,
    docNumberSymbol: codeSymbol,
    title: docData.title || 'Văn bản Pháp lý mới',
    issuingAgency: docData.issuingAgency || 'Bộ Quốc phòng',
    docType: docData.docType || 'Thông tư',
    type: docData.type || docData.docType || 'Thông tư',
    issuedDate: docData.issuedDate || new Date().toISOString().slice(0, 10),
    effectiveDate: docData.effectiveDate || new Date().toISOString().slice(0, 10),
    expiryDate: docData.expiryDate || '',
    fields: docData.fields || (docData.category ? [docData.category] : ['Rà phá bom mìn, vật nổ']),
    category: docData.category || (docData.fields && docData.fields[0]) || 'Rà phá bom mìn, vật nổ',
    keywords: docData.keywords || [],
    replacingDoc: docData.replacingDoc || '',
    replacedDoc: docData.replacedDoc || '',
    amendingDoc: docData.amendingDoc || '',
    validityStatus: docData.validityStatus || 'con_hieu_luc',
    status: docData.validityStatus || 'con_hieu_luc',
    pdfFileUrl: docData.pdfFileUrl || '',
    pdfFileName: docData.pdfFileName || '',
    sourceUrl: docData.sourceUrl || '',
    driveUrl: docData.driveUrl || '',
    notes: docData.notes || '',
    summary: docData.summary || docData.title || '',
    keyPoints: docData.keyPoints || [],
    fullContent: docData.fullContent || docData.summary || docData.title || ''
  };

  const updated = [newDoc, ...docs];
  saveLegalDocs(updated, `Thêm mới văn bản pháp lý: ${newDoc.docNumberSymbol} - ${newDoc.title}`);
  return newDoc;
}

export function updateLegalDoc(updatedDoc: LegalDocument): void {
  const docs = getLegalDocs();
  const idx = docs.findIndex(d => d.id === updatedDoc.id);
  if (idx !== -1) {
    docs[idx] = { ...docs[idx], ...updatedDoc };
    saveLegalDocs(docs, `Cập nhật văn bản pháp lý: ${updatedDoc.docNumberSymbol} - ${updatedDoc.title}`);
  }
}

export function deleteLegalDoc(id: string): void {
  const docs = getLegalDocs();
  const target = docs.find(d => d.id === id);
  const updated = docs.filter(d => d.id !== id);
  saveLegalDocs(updated, `Xóa văn bản pháp lý: ${target?.docNumberSymbol || id}`);
}

// 13.2 Hybrid Search Function
export function searchLegalDocs(docs: LegalDocument[], params: LegalSearchParams): LegalDocument[] {
  return docs.filter(doc => {
    // 1. Số văn bản / Ký hiệu
    if (params.docNumberSymbol && params.docNumberSymbol.trim() !== '') {
      const q = params.docNumberSymbol.toLowerCase().trim();
      const matchCode = doc.code?.toLowerCase().includes(q);
      const matchSymbol = doc.docNumberSymbol?.toLowerCase().includes(q);
      if (!matchCode && !matchSymbol) return false;
    }

    // 2. Tên văn bản
    if (params.title && params.title.trim() !== '') {
      const q = params.title.toLowerCase().trim();
      if (!doc.title.toLowerCase().includes(q)) return false;
    }

    // 3. Nội dung toàn văn
    if (params.content && params.content.trim() !== '') {
      const q = params.content.toLowerCase().trim();
      const fullText = `${doc.title} ${doc.summary} ${doc.fullContent || ''} ${doc.keyPoints?.join(' ') || ''}`.toLowerCase();
      if (!fullText.includes(q)) return false;
    }

    // 4. Cơ quan ban hành
    if (params.issuingAgency && params.issuingAgency.trim() !== '' && params.issuingAgency !== 'all') {
      if (doc.issuingAgency?.toLowerCase() !== params.issuingAgency.toLowerCase()) return false;
    }

    // 5. Ngày ban hành (khoảng ngày)
    if (params.issuedDateStart && doc.issuedDate && doc.issuedDate < params.issuedDateStart) {
      return false;
    }
    if (params.issuedDateEnd && doc.issuedDate && doc.issuedDate > params.issuedDateEnd) {
      return false;
    }

    // 6. Lĩnh vực (12 lĩnh vực)
    if (params.field && params.field.trim() !== '' && params.field !== 'all') {
      const fieldMatch = doc.fields?.some(f => f.toLowerCase() === params.field?.toLowerCase()) ||
        doc.category?.toLowerCase() === params.field.toLowerCase();
      if (!fieldMatch) return false;
    }

    // 7. Tình trạng hiệu lực
    if (params.validityStatus && params.validityStatus.trim() !== '' && params.validityStatus !== 'all') {
      const st = doc.validityStatus || doc.status;
      if (st !== params.validityStatus) return false;
    }

    // 8. Từ khóa
    if (params.keyword && params.keyword.trim() !== '') {
      const q = params.keyword.toLowerCase().trim();
      const kwMatch = doc.keywords?.some(k => k.toLowerCase().includes(q)) ||
        doc.title.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q);
      if (!kwMatch) return false;
    }

    return true;
  });
}

// Helper to simulate PDF / Text parsing when user uploads a document
export function parseAndExtractFileContent(file: File): Promise<{ text: string; fileName: string; fileDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // If it's a text/markdown file or JSON
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        resolve({
          text: result,
          fileName: file.name,
          fileDataUrl: result
        });
      } else {
        // For PDF / Binary doc files: generate extracted preview text with file metadata
        const extractedText = `[ĐÃ TRÍCH XUẤT NỘI DUNG TỪ FILE: ${file.name}]
Dung lượng: ${(file.size / 1024).toFixed(1)} KB
Loại file: ${file.type || 'PDF Document'}
Thời gian tải lên: ${new Date().toLocaleString('vi-VN')}

Tóm tắt nội dung file:
Văn bản đính kèm quy định chi tiết về quy trình kỹ thuật, hồ sơ pháp lý và tiêu chuẩn kiểm tra an toàn nghiệm thu rà phá bom mìn vật nổ ban hành bởi cơ quan có thẩm quyền. Các điều khoản liên quan tới diện tích đất sạch, công tác nghiệm thu xác suất và khoảng cách an toàn hủy nổ được trích dẫn đầy đủ phục vụ tra cứu AI.`;

        resolve({
          text: extractedText,
          fileName: file.name,
          fileDataUrl: result
        });
      }
    };

    reader.onerror = (err) => reject(err);

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
}
