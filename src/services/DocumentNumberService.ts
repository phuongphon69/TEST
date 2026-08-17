import { DocumentRecord } from '../types';
import { getDocuments, saveDocuments } from '../utils/storage';
import { PermissionService } from './PermissionService';
import { AuditLogService } from './AuditLogService';

export class DocumentNumberService {
  /**
   * Get the next auto-increment number for outgoing documents (vb_di)
   */
  public static getNextOutgoingNumber(): number {
    const docs = getDocuments();
    const outgoingDocs = docs.filter(d => (d.type as string) === 'vanban_di' || (d.type as string) === 'vb_di');
    let maxNum = 0;
    outgoingDocs.forEach(d => {
      const match = d.code?.match(/^(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return maxNum + 1;
  }

  /**
   * Reset outgoing document number sequence (Admin only)
   */
  public static resetNumberSequence(reason: string): boolean {
    PermissionService.assertPermission('outgoingDocument.number.reset', 'Reset chuỗi số Văn bản đi');

    AuditLogService.log({
      module: 'Văn bản đi',
      actionDetails: `Reset chuỗi số thứ tự Văn bản đi về 1. Lý do: ${reason}`,
      actionType: 'chinh_sua',
      reason,
      result: 'success'
    });
    return true;
  }

  /**
   * Manual override of document number for specific document (Admin only)
   */
  public static overrideDocumentNumber(docId: string, newNumber: string, reason: string): boolean {
    PermissionService.assertPermission('outgoingDocument.number.override', 'Điều chỉnh thủ công số Văn bản đi');

    const docs = getDocuments();
    const docIndex = docs.findIndex(d => d.id === docId);
    if (docIndex === -1) throw new Error(`Không tìm thấy văn bản ID ${docId}`);

    const existingDoc = docs[docIndex];
    // Check duplicate number
    const isDuplicate = docs.some(d => d.id !== docId && ((d.type as string) === 'vanban_di' || (d.type as string) === 'vb_di') && d.code === newNumber);
    if (isDuplicate) {
      throw new Error(`Số văn bản "${newNumber}" đã tồn tại trong hệ thống. Không thể đặt trùng!`);
    }

    const beforeVal = existingDoc.code;
    docs[docIndex] = {
      ...existingDoc,
      code: newNumber,
      updatedAt: new Date().toISOString()
    };

    saveDocuments(docs, `Điều chỉnh số VB từ ${beforeVal} sang ${newNumber}`);

    AuditLogService.log({
      module: 'Văn bản đi',
      actionDetails: `Điều chỉnh số Văn bản đi ID ${docId} từ "${beforeVal}" thành "${newNumber}". Lý do: ${reason}`,
      actionType: 'chinh_sua',
      targetObject: 'Văn bản đi',
      targetObjectId: docId,
      dataBefore: { code: beforeVal },
      dataAfter: { code: newNumber },
      reason,
      result: 'success'
    });

    return true;
  }

  /**
   * Insert a document number between existing numbers
   */
  public static insertDocumentNumber(newNumber: string, reason: string): boolean {
    PermissionService.assertPermission('outgoingDocument.number.insert', 'Chèn số Văn bản đi');

    const docs = getDocuments();
    const isDuplicate = docs.some(d => ((d.type as string) === 'vanban_di' || (d.type as string) === 'vb_di') && d.code === newNumber);
    if (isDuplicate) {
      throw new Error(`Số văn bản "${newNumber}" đã tồn tại! Không thể chèn số trùng.`);
    }

    AuditLogService.log({
      module: 'Văn bản đi',
      actionDetails: `Đăng ký chèn số Văn bản đi bổ sung: "${newNumber}". Lý do: ${reason}`,
      actionType: 'tao',
      reason,
      result: 'success'
    });

    return true;
  }
}
