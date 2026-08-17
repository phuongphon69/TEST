import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  Send,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { LegalDocument } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: string[];
}

const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'leg-1',
    code: 'QCVN 01:2019/BQP',
    title: 'Quy chuẩn Kỹ thuật Quốc gia về Rà phá Bom mìn Vật nổ',
    issuedDate: '2019-09-15',
    category: 'Quy chuẩn Quốc gia',
    summary: 'Quy định các tiêu chuẩn kỹ thuật, độ sâu rà phá (0.3m, 3m, 5m), phương pháp kiểm tra tín hiệu và độ an toàn tuyệt đối khi hủy vật nổ.',
    driveUrl: 'https://drive.google.com/file/d/sample-qcvn01/view'
  },
  {
    id: 'leg-2',
    code: 'Nghị định 18/2019/NĐ-CP',
    title: 'Nghị định về Quản lý và Thực hiện Hoạt động Khắc phục Hậu quả Bom mìn Vật nổ',
    issuedDate: '2019-02-01',
    category: 'Nghị định Chính phủ',
    summary: 'Quy định thẩm quyền phê duyệt dự án, cấp chứng chỉ năng lực cho đơn vị thi công, và cơ chế nghiệm thu bàn giao đất sạch.',
    driveUrl: 'https://drive.google.com/file/d/sample-nd18/view'
  },
  {
    id: 'leg-3',
    code: 'Thông tư 195/2019/TT-BQP',
    title: 'Thông tư Quy định Định mức Kinh tế - Kỹ thuật Rà phá Bom mìn Vật nổ',
    issuedDate: '2019-12-20',
    category: 'Thông tư Bộ Quốc phòng',
    summary: 'Bộ định mức tính chi phí, nhân công, máy móc thiết bị và vật tư sử dụng cho công tác rà phá bom mìn trên đất liền và dưới nước.',
    driveUrl: 'https://drive.google.com/file/d/sample-tt195/view'
  }
];

const SUGGESTED_QUERIES = [
  'Quy trình kiểm tra nghiệm thu độ sâu rà phá 3m theo QCVN 01:2019/BQP?',
  'Hồ sơ nghiệm thu bàn giao đất sạch bom mìn bao gồm những văn bản gì?',
  'Quy định về thời hạn chứng chỉ K kỹ thuật viên RPBM Cấp 1, 2, 3?',
  'Biện pháp bảo đảm an toàn khi hủy nổ bom mìn tại chỗ cách khu dân cư bao xa?'
];

export const AISearchAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'library'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý Trí tuệ Nhân tạo hỗ trợ tra cứu Văn bản Pháp quy & Quy chuẩn Kỹ thuật Rà phá Bom mìn, Vật nổ (QCVN 01:2019/BQP, Nghị định 18/2019/NĐ-CP).\n\nBạn có thể đặt câu hỏi về quy trình nghiệm thu, định mức kỹ thuật, thời hạn chứng chỉ hoặc phương án xử lý an toàn vật nổ.',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (!response.ok) {
        throw new Error('Lỗi phản hồi từ máy chủ AI');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Không thể lấy thông tin trả lời. Vui lòng thử lại.',
        citations: data.citations || ['QCVN 01:2019/BQP', 'Nghị định 18/2019/NĐ-CP'],
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ Không thể kết nối tới Trợ lý Gemini AI. Vui lòng kiểm tra lại khóa API hoặc kết nối mạng.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Tra cứu Pháp lý & Quy chuẩn RPBM bằng Trợ lý Trí tuệ Nhân tạo AI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tra cứu nhanh Quy chuẩn QCVN 01:2019/BQP, Nghị định 18/2019/NĐ-CP, định mức kỹ thuật và quy trình an toàn hủy nổ bom mìn.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" /> Trợ lý Hỏi Đáp AI
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'library'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Kho Văn bản Pháp quy
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
            {/* Messages View */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                    }`}
                  >
                    {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] space-y-2`}>
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-emerald-800/80 text-white rounded-tr-none'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}

                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-emerald-400">Trích dẫn căn cứ:</span>
                          {msg.citations.map((c, idx) => (
                            <span key={idx} className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-[10px] text-slate-500 font-mono ${
                        msg.sender === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-300 p-0.5"
                          title="Sao chép nội dung"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 text-slate-400 text-xs font-mono bg-slate-950 p-3 rounded-2xl w-fit border border-slate-800 animate-pulse">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>Trợ lý AI đang phân tích quy chuẩn QCVN 01:2019/BQP...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  placeholder="Đặt câu hỏi về quy trình kỹ thuật RPBM, quy chuẩn, chứng chỉ..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !inputQuery.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 text-xs transition-all shrink-0"
                >
                  <Send className="w-4 h-4" /> Trả lời
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Suggested Queries */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Gợi ý Câu hỏi Thường gặp
              </h3>

              <div className="space-y-2">
                {SUGGESTED_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-700/80 p-3 rounded-xl text-xs text-slate-300 transition-all leading-snug group"
                  >
                    <span className="group-hover:text-emerald-300 font-medium">{q}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notice card */}
            <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-2xl text-xs space-y-2 text-emerald-200">
              <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                <ShieldAlert className="w-4 h-4" /> Cơ sở dữ liệu Pháp luật RPBM
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-100/80">
                Hệ thống AI được huấn luyện trên toàn bộ văn bản quy phạm pháp luật hiện hành của Bộ Quốc phòng Việt Nam. Mọi phương án xử lý thực địa phải tuân thủ mệnh lệnh trực tiếp của Chỉ huy trưởng.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Legal Library Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LEGAL_DOCUMENTS.map(doc => (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-700">
                      {doc.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{doc.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{doc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{doc.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">Ban hành: {doc.issuedDate}</span>
                  <a
                    href={doc.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Xem file Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
