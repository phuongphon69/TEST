import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Building,
  Eye,
  Edit2,
  Trash2,
  X,
  ClipboardList,
  CheckSquare,
  Shield,
  FileCheck
} from 'lucide-react';
import { DocumentRecord, InternalDocCategory } from '../../types';
import { formatDateVN, formatDateForInput } from '../../utils/formatters';

interface InternalDocsTabProps {
  documents: DocumentRecord[];
  currentUser: { name: string; title: string };
  onSaveDoc: (doc: DocumentRecord) => void;
  onDeleteDoc: (id: string) => void;
}

const INTERNAL_CATEGORIES: { id: InternalDocCategory; label: string; icon: string }[] = [
  { id: 'thong_bao', label: 'Thông báo', icon: '📢' },
  { id: 'ke_hoach', label: 'Kế hoạch', icon: '📅' },
  { id: 'bao_cao', label: 'Báo cáo', icon: '📊' },
  { id: 'to_trinh', label: 'Tờ trình', icon: '📑' },
  { id: 'bien_ban', label: 'Biên bản', icon: '📝' },
  { id: 'quyet_dinh', label: 'Quyết định', icon: '⚖️' },
  { id: 'phieu_giao_viec', label: 'Phiếu giao việc', icon: '📌' },
  { id: 'lich_cong_tac', label: 'Lịch công tác', icon: '🗓️' },
  { id: 'quy_che_quy_dinh', label: 'Quy chế & Quy định nội bộ', icon: '📜' }
];

export const InternalDocsTab: React.FC<InternalDocsTabProps> = ({
  documents,
  currentUser,
  onSaveDoc,
  onDeleteDoc
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);

  const [formData, setFormData] = useState<Partial<DocumentRecord>>({
    code: 'TB-NB-2026-08',
    title: '',
    category: 'Thông báo',
    issueDate: formatDateForInput(new Date()),
    issuer: 'Ban Chỉ huy Tiểu đoàn 93',
    recipientLocation: 'Toàn thể các Ban, Đội thi công & Trạm kỹ thuật',
    driveUrl: 'https://drive.google.com/drive/folders/sample-internal',
    notes: ''
  });

  const internalDocs = documents
    .filter(d => d.dataStatus !== 'da_xoa')
    .filter(d => d.type === 'vanban_noi_bo' || d.category.includes('Nội bộ') || d.category.includes('Lịch') || d.category.includes('Phiếu'))
    .filter(d => {
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.code.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.issuer.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const handleOpenAdd = (catLabel?: string) => {
    setEditingDoc(null);
    const num = Math.floor(Math.random() * 80) + 10;
    const category = catLabel || 'Thông báo';
    setFormData({
      code: `NB-${num}/2026`,
      title: `V/v triển khai công tác ${category.toLowerCase()} nội bộ tháng 7/2026`,
      category: category,
      issueDate: formatDateForInput(new Date()),
      issuer: 'Chỉ huy trưởng Tiểu đoàn 93',
      recipientLocation: 'Toàn bộ lực lượng thi công',
      driveUrl: 'https://drive.google.com/drive/folders/sample-internal',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (doc: DocumentRecord) => {
    setEditingDoc(doc);
    setFormData({ ...doc });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    const docToSave: DocumentRecord = {
      id: editingDoc ? editingDoc.id : `doc-int-${Date.now()}`,
      type: 'vanban_noi_bo',
      code: formData.code || '',
      title: formData.title || '',
      category: formData.category || 'Thông báo',
      issueDate: formData.issueDate || formatDateForInput(new Date()),
      issuer: formData.issuer || 'Ban Chỉ huy Tiểu đoàn 93',
      recipientLocation: formData.recipientLocation || 'Nội bộ',
      deadline: formatDateForInput(new Date(Date.now() + 30 * 24 * 3600 * 1000)),
      status: 'da_hoan_thanh',
      driveUrl: formData.driveUrl || 'https://drive.google.com',
      notes: formData.notes,
      uploader: currentUser.name,
      uploadDate: formatDateForInput(new Date())
    };

    onSaveDoc(docToSave);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedCategory === 'all'
              ? 'bg-sky-600/20 border-sky-500/50 text-sky-300 shadow-md'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <div className="text-xs font-semibold text-slate-400">TẤT CẢ</div>
          <div className="text-sm font-bold mt-1">Toàn bộ VB Nội bộ</div>
        </button>

        {INTERNAL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.label)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedCategory === cat.label
                ? 'bg-sky-600/20 border-sky-500/50 text-sky-300 shadow-md'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-[10px] text-slate-500 font-mono">93-NB</span>
            </div>
            <div className="text-sm font-medium mt-1 truncate">{cat.label}</div>
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã văn bản, trích yếu, người ban hành..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          onClick={() => handleOpenAdd(selectedCategory !== 'all' ? selectedCategory : 'Thông báo')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ban Hành VB Nội Bộ Mới
        </button>
      </div>

      {/* Internal Docs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4 w-36">Mã / Số VB</th>
                <th className="py-3.5 px-4 w-36">Danh Mục</th>
                <th className="py-3.5 px-4">Trích Yếu Nội Dung & Nơi Nhận</th>
                <th className="py-3.5 px-4 w-36">Cơ Quan / Người Ký</th>
                <th className="py-3.5 px-4 w-28">Ngày Ban Hành</th>
                <th className="py-3.5 px-4 w-24 text-right">Tệp Tin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {internalDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Chưa có văn bản nội bộ nào thuộc danh mục này.
                  </td>
                </tr>
              ) : (
                internalDocs.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-400">{doc.code}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-100 line-clamp-2">{doc.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Nơi nhận: <span className="text-slate-300">{doc.recipientLocation || 'Toàn đơn vị'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-200">
                      {doc.issuer}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {formatDateVN(doc.issueDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <a
                        href={doc.driveUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Google Drive"
                        className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-semibold text-lg text-slate-100">
                {editingDoc ? 'Cập Nhật Văn Bản Nội Bộ' : 'Tạo Văn Bản Nội Bộ Mới'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mã / Số VB <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: TB-NB-2026-08"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Danh mục văn bản</label>
                  <select
                    value={formData.category || 'Thông báo'}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {INTERNAL_CATEGORIES.map(c => (
                      <option key={c.id} value={c.label}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trích yếu nội dung <span className="text-rose-400">*</span></label>
                <textarea
                  rows={2}
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Trích yếu văn bản..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cơ quan / Người ban hành</label>
                  <input
                    type="text"
                    value={formData.issuer || ''}
                    onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày ban hành</label>
                  <input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link Google Drive</label>
                <input
                  type="url"
                  value={formData.driveUrl || ''}
                  onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-600/30"
                >
                  {editingDoc ? 'Lưu Thay Đổi' : 'Ban Hành VB Nội Bộ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
