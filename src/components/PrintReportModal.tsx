import React from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';
import { Project } from '../types';
import { formatDateVN, formatVND } from '../utils/formatters';

interface PrintReportModalProps {
  project: Project;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ project, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto print:max-w-none print:w-full print:p-0 print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b pb-4 print:hidden">
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Biên bản Nghiệm thu & Bàn giao Đất sạch Bom mìn (Xem trước & In)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" /> In Biên bản / Xuất PDF
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content */}
        <div className="space-y-6 text-xs sm:text-sm font-serif leading-relaxed text-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start text-center border-b border-slate-300 pb-4">
            <div className="text-left font-sans">
              <p className="font-bold uppercase text-[11px] tracking-wider">BỘ QUỐC PHÒNG</p>
              <p className="font-bold uppercase text-[11px] text-emerald-900">BỘ LỆNH CÔNG BINH</p>
              <p className="text-[10px] text-slate-600 font-mono">Số: {project.code}/BB-NT-2026</p>
            </div>
            <div className="text-center font-sans">
              <p className="font-bold uppercase text-[11px] tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-[11px] border-b border-slate-900 pb-0.5 mb-0.5">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[10px] text-slate-600 italic">..., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1 py-2 font-sans">
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide">
              BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO ĐẤT SẠCH BOM MÌN, VẬT NỔ
            </h2>
            <p className="text-xs font-bold text-emerald-900">
              (Theo Quy chuẩn Kỹ thuật Quốc gia QCVN 01:2019/BQP)
            </p>
          </div>

          {/* Basis */}
          <div className="space-y-1 text-slate-800 text-xs italic bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
            <p>• Căn cứ Nghị định số 18/2019/NĐ-CP ngày 01/02/2019 của Chính phủ về quản lý và thực hiện hoạt động khắc phục hậu quả bom mìn vật nổ sau chiến tranh;</p>
            <p>• Căn cứ Quy chuẩn Kỹ thuật Quốc gia QCVN 01:2019/BQP về rà phá bom mìn vật nổ;</p>
            <p>• Căn cứ Phương án kỹ thuật thi công và Dự toán được phê duyệt cho dự án: <strong>{project.name}</strong>.</p>
          </div>

          {/* Project Details */}
          <div className="space-y-2 font-sans">
            <h4 className="font-bold uppercase text-xs text-slate-900 border-b pb-1">I. THÔNG TIN DỰ ÁN VÀ CÁC BÊN LIÊN QUAN</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p>1. Tên dự án: <strong>{project.name}</strong></p>
              <p>2. Chủ đầu tư: <strong>{project.investor}</strong></p>
              <p>3. Địa điểm rà phá: <strong>{project.commune}, {project.district}, tỉnh {project.province}</strong></p>
              <p>4. Đơn vị thi công: <strong>Phòng Nghiệp vụ QLRPBM - Binh chủng Công binh</strong></p>
              <p>5. Chỉ huy trưởng công trường: <strong>{project.commanderName}</strong></p>
              <p>6. Tổng diện tích giao rà phá: <strong>{project.areaHa} ha</strong></p>
              <p>7. Độ sâu rà phá nghiệm thu: <strong>Đến độ sâu {project.depthM} mét</strong></p>
              <p>8. Giá trị hợp đồng rà phá: <strong>{formatVND(project.budgetVnd)}</strong></p>
            </div>
          </div>

          {/* Results Summary */}
          <div className="space-y-2 font-sans">
            <h4 className="font-bold uppercase text-xs text-slate-900 border-b pb-1">II. KẾT QUẢ RÀ PHÁ VÀ XỬ LÝ VẬT NỔ</h4>
            <p className="text-xs">
              Đơn vị thi công đã hoàn thành công tác rà phá tín hiệu, đào bới kiểm tra và xử lý an toàn vật nổ trên toàn bộ diện tích <strong>{project.areaHa} ha</strong>, đạt khối lượng hoàn thành <strong>{project.progressPercent}%</strong>.
            </p>

            <table className="w-full text-left text-xs border-collapse border border-slate-300 mt-2">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2">STT</th>
                  <th className="border border-slate-300 p-2">Hạng mục / Loại vật nổ</th>
                  <th className="border border-slate-300 p-2">Độ sâu phát hiện</th>
                  <th className="border border-slate-300 p-2 text-center">Số lượng</th>
                  <th className="border border-slate-300 p-2">Biện pháp xử lý</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2">1</td>
                  <td className="border border-slate-300 p-2">Bom, đạn pháo các loại (MK-82, 105mm, 155mm)</td>
                  <td className="border border-slate-300 p-2">0,5m - 3,0m</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">12 quả</td>
                  <td className="border border-slate-300 p-2">Hủy nổ tập trung an toàn</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">2</td>
                  <td className="border border-slate-300 p-2">Mìn cá nhân, ngòi nổ các loại (M14, M16)</td>
                  <td className="border border-slate-300 p-2">0,1m - 0,3m</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">48 quả</td>
                  <td className="border border-slate-300 p-2">Thu gom & Hủy tại chỗ</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">3</td>
                  <td className="border border-slate-300 p-2">Mảnh kim loại, phế liệu chiến tranh</td>
                  <td className="border border-slate-300 p-2">Toàn dải độ sâu</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">Toàn bộ</td>
                  <td className="border border-slate-300 p-2">Thu gom đào bới sạch</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conclusion */}
          <div className="space-y-2 font-sans bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <h4 className="font-bold uppercase text-xs text-emerald-900">III. KẾT LUẬN VÀ BÀN GIAO ĐẤT SẠCH</h4>
            <p className="text-xs font-semibold text-slate-900 leading-relaxed">
              1. Diện tích <strong>{project.areaHa} ha</strong> thuộc dự án đã được rà phá sạch bom mìn, vật nổ đến độ sâu <strong>{project.depthM}m</strong>, bảo đảm an toàn tuyệt đối cho công tác thi công xây dựng và canh tác.
            </p>
            <p className="text-xs font-semibold text-slate-900">
              2. Hội đồng nghiệm thu thống nhất nghiệm thu và bàn giao mặt bằng đất sạch cho Chủ đầu tư <strong>{project.investor}</strong> đưa vào khai sử dụng.
            </p>
          </div>

          {/* Signatures Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center font-sans pt-6 border-t border-slate-300 text-xs">
            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN CHỦ ĐẦU TƯ</p>
              <p className="text-[10px] text-slate-500 italic mb-12">(Ký, ghi rõ họ tên & đóng dấu)</p>
              <p className="font-bold text-slate-800">Ban QLDA Công trình</p>
            </div>

            <div>
              <p className="font-bold uppercase">ĐƠN VỊ GIÁM SÁT CHẤT LƯỢNG</p>
              <p className="text-[10px] text-slate-500 italic mb-12">(Ký, ghi rõ họ tên)</p>
              <p className="font-bold text-slate-800">KTS. Lê Hoàng Nam</p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-bold uppercase text-emerald-900">ĐƠN VỊ THI CÔNG RPBM</p>
              <p className="text-[10px] text-slate-500 italic mb-12">(Chỉ huy trưởng công trường)</p>
              <p className="font-bold text-slate-900">{project.commanderName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
