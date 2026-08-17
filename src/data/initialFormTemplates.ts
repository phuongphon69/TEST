import { FormTemplateItem } from '../types';

export const INITIAL_FORM_TEMPLATES: FormTemplateItem[] = [
  {
    id: 'tmpl-01',
    code: 'BM-PGV-01',
    name: 'Phiếu giao việc nghiệp vụ RPBM',
    category: 'phieu_giao_viec',
    description: 'Mẫu giao nhiệm vụ công tác, xử lý văn bản, chỉ đạo thi công hiện trường',
    format: 'docx',
    version: '2.1',
    uploadedBy: 'Thượng tá Nguyễn Văn Hùng',
    uploadedDate: '2026-07-15',
    fileName: 'Phieu_Giao_Viec_RPBM_v2.docx',
    fileSize: '48 KB',
    isSystemDefault: true,
    placeholders: ['{MA_CONG_VIEC}', '{TEN_CONG_VIEC}', '{NGUOI_GIAO}', '{NGUOI_CHU_TRI}', '{THOI_HAN}', '{NOI_DUNG}'],
    contentTemplateHtml: `
      <div style="font-family: 'Times New Roman', serif; padding: 20px; border: 1px solid #ccc;">
        <div style="display: flex; justify-content: space-between; text-align: center; margin-bottom: 20px;">
          <div><b>BỘ QUỐC PHÒNG</b><br/><b>BINH CHỦNG CÔNG BINH</b></div>
          <div><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/><u>Độc lập - Tự do - Hạnh phúc</u></div>
        </div>
        <h2 style="text-align: center; margin: 20px 0; text-transform: uppercase;">PHIẾU GIAO VIỆC NGHIỆP VỤ</h2>
        <p><b>Số:</b> {MA_CONG_VIEC}</p>
        <p><b>Kính gửi:</b> Đồng chí {NGUOI_CHU_TRI}</p>
        <p><b>Thực hiện chỉ đạo của:</b> {NGUOI_GIAO}</p>
        <p><b>Nội dung công việc:</b> {NOI_DUNG}</p>
        <p><b>Dự án liên quan:</b> {TEN_DU_AN}</p>
        <p><b>Thời hạn hoàn thành:</b> {THOI_HAN}</p>
        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div><b>NGƯỜI NHẬN VIỆC</b><br/><br/><br/>{NGUOI_CHU_TRI}</div>
          <div><b>NGƯỜI GIAO VIỆC</b><br/><br/><br/>{NGUOI_GIAO}</div>
        </div>
      </div>
    `
  },
  {
    id: 'tmpl-02',
    code: 'BM-PTK-02',
    name: 'Phiếu trình ký văn bản & phương án',
    category: 'phieu_trinh_ky',
    description: 'Mẫu trình lãnh đạo phê duyệt phương án kỹ thuật, tờ trình ngân sách',
    format: 'docx',
    version: '1.5',
    uploadedBy: 'Thiếu tá Phạm Thị Mai',
    uploadedDate: '2026-07-10',
    fileName: 'Phieu_Trinh_Ky_Van_Ban.docx',
    fileSize: '52 KB',
    isSystemDefault: true,
    placeholders: ['{SO_TRINH_KY}', '{TRICH_YEAU}', '{NGUOI_TRINH}', '{CAP_PHE_DUYET}', '{Y_KIEN_CHI_DAO}'],
    contentTemplateHtml: `
      <div style="font-family: 'Times New Roman', serif; padding: 20px; border: 1px solid #ccc;">
        <h2 style="text-align: center; margin-bottom: 20px;">PHIẾU TRÌNH KÝ VĂN BẢN</h2>
        <p><b>Mã hồ sơ:</b> {SO_TRINH_KY}</p>
        <p><b>Tên văn bản / Phương án trình:</b> {TRICH_YEAU}</p>
        <p><b>Đơn vị / Cán bộ trình:</b> {NGUOI_TRINH}</p>
        <p><b>Thuộc dự án:</b> {TEN_DU_AN}</p>
        <p><b>Kính trình:</b> {CAP_PHE_DUYET}</p>
        <p><b>Ý kiến chỉ đạo / Phê duyệt:</b> {Y_KIEN_CHI_DAO}</p>
      </div>
    `
  },
  {
    id: 'tmpl-03',
    code: 'BM-PMH-03',
    name: 'Phiếu mượn hồ sơ lưu trữ kho',
    category: 'phieu_muon_ho_so',
    description: 'Phiếu yêu cầu và xác nhận mượn tài liệu, hồ sơ thi công RPBM tại kho 12',
    format: 'docx',
    version: '2.0',
    uploadedBy: 'Thiếu tá Hoàng Văn Thắng',
    uploadedDate: '2026-07-01',
    fileName: 'Phieu_Muon_Ho_So_Kho.docx',
    fileSize: '45 KB',
    isSystemDefault: true,
    placeholders: ['{SO_PHIET_MUON}', '{NGUOI_MUON}', '{DON_VI_MUON}', '{LY_DO_MUON}', '{DANH_SACH_HO_SO}', '{NGAY_HEN_TRA}']
  },
  {
    id: 'tmpl-04',
    code: 'BM-PBG-04',
    name: 'Phiếu bàn giao phương tiện, thiết bị',
    category: 'phieu_ban_giao_thiet_bi',
    description: 'Biên bản xuất giao máy dò bom mìn, xe ô tô chuyên dùng cho đội thi công',
    format: 'docx',
    version: '1.8',
    uploadedBy: 'Đại úy Trần Quốc Tuấn',
    uploadedDate: '2026-06-25',
    fileName: 'Phieu_Ban_Giao_Thiet_Bi.docx',
    fileSize: '60 KB',
    isSystemDefault: true,
    placeholders: ['{MA_THIET_BI}', '{TEN_THIET_BI}', '{SERIAL}', '{NGUOI_BBN}', '{NGUOI_NHAN}', '{TINH_TRANG}', '{DU_AN}']
  },
  {
    id: 'tmpl-05',
    code: 'BM-PKT-05',
    name: 'Phiếu kiểm tra & hiệu chuẩn thiết bị',
    category: 'phieu_kiem_tra_thiet_bi',
    description: 'Phiếu đánh giá tình trạng kỹ thuật máy dò Vallon, Minelab, Foerster trước khi ra công trường',
    format: 'docx',
    version: '1.2',
    uploadedBy: 'Đại úy Trần Quốc Tuấn',
    uploadedDate: '2026-06-20',
    fileName: 'Phieu_Kiem_Tra_Thiet_Bi.docx',
    fileSize: '55 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_THIET_BI}', '{SO_HIEU}', '{NGAY_KIEM_TRA}', '{KET_QUA}', '{NGUOI_KIEM_TRA}']
  },
  {
    id: 'tmpl-06',
    code: 'BM-BBNT-06',
    name: 'Biên bản nghiệm thu khối lượng hoàn thành',
    category: 'bien_ban_nghiem_thu',
    description: 'Biên bản nghiệm thu diện tích rà phá đất/nước hoàn thành đợt/giai đoạn',
    format: 'docx',
    version: '3.0',
    uploadedBy: 'Thượng tá Nguyễn Văn Hùng',
    uploadedDate: '2026-07-18',
    fileName: 'Bien_Ban_Nghiem_Thu_RPBM.docx',
    fileSize: '72 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_DU_AN}', '{CHU_DAU_TU}', '{DON_VI_THI_CONG}', '{DIEN_TICH_NGHIEM_THU}', '{GIA_TRI_VND}', '{NGAY_NGHIEM_THU}']
  },
  {
    id: 'tmpl-07',
    code: 'BM-BBBG-07',
    name: 'Biên bản bàn giao mặt bằng đất sạch UXO',
    category: 'bien_ban_ban_giao_mat_bang',
    description: 'Biên bản bàn giao mặt bằng đã hoàn thành RPBM cho Chủ đầu tư',
    format: 'docx',
    version: '2.5',
    uploadedBy: 'Thượng tá Nguyễn Văn Hùng',
    uploadedDate: '2026-07-05',
    fileName: 'Bien_Ban_Ban_Giao_Mat_Bang_UXO.docx',
    fileSize: '65 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_DU_AN}', '{CHU_DAU_TU}', '{TOA_DO_RANH_GIOI}', '{DIEN_TICH_HA}', '{DO_SAU_M}', '{NGAY_BAN_GIAO}']
  },
  {
    id: 'tmpl-08',
    code: 'BM-NKTC-08',
    name: 'Nhật ký thi công rà phá hằng ngày',
    category: 'nhat_ky_thi_cong',
    description: 'Nhật ký ghi chép thời tiết, diện tích rà phá, số tín hiệu và vật thể phát hiện trong ngày',
    format: 'docx',
    version: '1.9',
    uploadedBy: 'Thiếu tá Phạm Thị Mai',
    uploadedDate: '2026-07-22',
    fileName: 'Nhat_Ky_Thi_Cong_RPBM.docx',
    fileSize: '58 KB',
    isSystemDefault: true,
    placeholders: ['{NGAY_THI_CONG}', '{TEN_DU_AN}', '{SO_NHAN_SU}', '{DIEN_TICH_HA}', '{SO_TIN_HIEU}', '{VAT_NO_PHAT_HIEN}']
  },
  {
    id: 'tmpl-09',
    code: 'BM-BCN-09',
    name: 'Báo cáo thi công hằng ngày (Daily Report)',
    category: 'bao_cao_ngay',
    description: 'Báo cáo nhanh kết quả công tác trong ngày gửi Chỉ huy đơn vị',
    format: 'docx',
    version: '1.0',
    uploadedBy: 'Thiếu tá Phạm Thị Mai',
    uploadedDate: '2026-07-02',
    fileName: 'Bao_Cao_Ngay_RPBM.docx',
    fileSize: '42 KB',
    isSystemDefault: true,
    placeholders: ['{NGAY}', '{TEN_DU_AN}', '{KHOI_LUONG_TRONG_NGAY}', '{AN_TOAN}', '{DE_XUAT}']
  },
  {
    id: 'tmpl-10',
    code: 'BM-BCT-10',
    name: 'Báo cáo công tác tuần (Weekly Report)',
    category: 'bao_cao_tuan',
    description: 'Báo cáo tiến độ và kế hoạch thi công tuần tiếp theo',
    format: 'docx',
    version: '1.4',
    uploadedBy: 'Trung tá Lê Văn Minh',
    uploadedDate: '2026-07-12',
    fileName: 'Bao_Cao_Tuan_RPBM.docx',
    fileSize: '50 KB',
    isSystemDefault: true,
    placeholders: ['{TUAN_SO}', '{TEN_DU_AN}', '{TIEN_DO_DAT_DUOC}', '{KHUYET_DIEM}', '{KE_HOACH_TUAN_TOI}']
  },
  {
    id: 'tmpl-11',
    code: 'BM-BCTH-11',
    name: 'Báo cáo tổng hợp tháng (Monthly Report)',
    category: 'bao_cao_thang',
    description: 'Báo cáo kết quả công tác RPBM, giải ngân và quản lý thiết bị tháng',
    format: 'docx',
    version: '2.0',
    uploadedBy: 'Thượng tá Nguyễn Văn Hùng',
    uploadedDate: '2026-07-01',
    fileName: 'Bao_Cao_Thang_RPBM.docx',
    fileSize: '68 KB',
    isSystemDefault: true,
    placeholders: ['{THANG_NAM}', '{TONG_DIEN_TICH_HA}', '{TONG_DISBURSEMENT}', '{DANH_GIA_AN_TOAN}']
  },
  {
    id: 'tmpl-12',
    code: 'BM-BCTD-12',
    name: 'Báo cáo tiến độ dự án RPBM',
    category: 'bao_cao_tien_do',
    description: 'Báo cáo đánh giá các mốc tiến độ thi công, nguy cơ chậm trễ và giải pháp',
    format: 'docx',
    version: '1.1',
    uploadedBy: 'Thiếu tá Phạm Thị Mai',
    uploadedDate: '2026-06-28',
    fileName: 'Bao_Cao_Tien_Do_Du_An.docx',
    fileSize: '54 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_DU_AN}', '{TY_LE_HOAN_THANH}', '{NGAY_KHET_THUC_HOP_DONG}', '{NGUY_CO_TRE}']
  },
  {
    id: 'tmpl-13',
    code: 'BM-BCAT-13',
    name: 'Báo cáo công tác an toàn thi công',
    category: 'bao_cao_an_toan',
    description: 'Báo cáo kiểm tra trang bị PPE, tập huấn an toàn và biển cảnh báo hiện trường',
    format: 'docx',
    version: '1.3',
    uploadedBy: 'Đại úy Trần Quốc Tuấn',
    uploadedDate: '2026-07-14',
    fileName: 'Bao_Cao_An_Toan_Lao_Dong.docx',
    fileSize: '49 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_DU_AN}', '{KET_QUA_KIEM_TRA_PPE}', '{SU_CO_AN_TOAN}', '{CAN_BO_AN_TOAN}']
  },
  {
    id: 'tmpl-14',
    code: 'BM-BCSC-14',
    name: 'Báo cáo sự cố / tình huống nguy hiểm',
    category: 'bao_cao_su_co',
    description: 'Báo cáo đột xuất khi phát hiện vật nổ nguy hiểm nguy cơ cao hoặc sự cố kỹ thuật',
    format: 'docx',
    version: '2.1',
    uploadedBy: 'Đại úy Trần Quốc Tuấn',
    uploadedDate: '2026-07-08',
    fileName: 'Bao_Cao_Su_Co_Thi_Cong.docx',
    fileSize: '46 KB',
    isSystemDefault: true,
    placeholders: ['{THOI_GIAN_SU_CO}', '{MO_TA_SU_CO}', '{MUC_DO}', '{BIEN_PHAP_KHAC_PHUC}']
  },
  {
    id: 'tmpl-15',
    code: 'BM-DSNS-15',
    name: 'Danh sách nhân sự thi công & chứng chỉ',
    category: 'danh_sach_nhan_su',
    description: 'Bảng tổng hợp danh sách cán bộ, kỹ thuật viên RPBM kèm số hiệu chứng chỉ',
    format: 'xlsx',
    version: '2.0',
    uploadedBy: 'Thiếu tá Hoàng Văn Thắng',
    uploadedDate: '2026-07-19',
    fileName: 'Danh_Sach_Nhan_Su_Chung_Chi.xlsx',
    fileSize: '82 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_DU_AN}', '{TONG_SO_NHAN_SU}', '{DANH_SACH_CHI_TIET}']
  },
  {
    id: 'tmpl-16',
    code: 'BM-DSTB-16',
    name: 'Danh sách máy dò & phương tiện rà phá',
    category: 'danh_sach_thiet_bi',
    description: 'Bảng thống kê toàn bộ máy dò, ô tô chở vật nổ cấp cho dự án kèm hạn đăng kiểm',
    format: 'xlsx',
    version: '2.2',
    uploadedBy: 'Đại úy Trần Quốc Tuấn',
    uploadedDate: '2026-07-17',
    fileName: 'Danh_Sach_Thiet_Bi_Du_An.xlsx',
    fileSize: '78 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_DU_AN}', '{TONG_SO_THIET_BI}', '{DANH_SACH_MAY_DO}']
  },
  {
    id: 'tmpl-17',
    code: 'BM-HSNT-17',
    name: 'Hồ sơ đề nghị thanh toán đợt / giai đoạn',
    category: 'ho_so_de_nghi_thanh_toan',
    description: 'Hồ sơ đề nghị thanh toán tạm ứng, nghiệm thu đợt kèm bảng tính giá trị VND',
    format: 'docx',
    version: '2.4',
    uploadedBy: 'Thượng tá Nguyễn Văn Hùng',
    uploadedDate: '2026-07-25',
    fileName: 'Ho_So_De_Nghi_Thanh_Toan.docx',
    fileSize: '88 KB',
    isSystemDefault: true,
    placeholders: ['{TEN_DU_AN}', '{DOT_THANH_TOAN}', '{GIA_TRI_DE_NGHI}', '{TAI_KHOAN_NHAN}']
  }
];
