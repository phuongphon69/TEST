import { LegalDocument } from '../types';

export const INITIAL_LEGAL_DOCUMENTS_FULL: LegalDocument[] = [
  {
    id: 'leg-01',
    code: 'VBPL-RPBM-001',
    docNumberSymbol: 'QCVN 01:2022/BQP',
    title: 'Quy chuẩn Kỹ thuật Quốc gia về Rà phá Bom mìn Vật nổ',
    issuingAgency: 'Bộ Quốc phòng',
    docType: 'Quy chuẩn (QCVN)',
    type: 'QCVN',
    issuedDate: '2022-09-15',
    effectiveDate: '2022-11-01',
    expiryDate: '',
    fields: ['Rà phá bom mìn, vật nổ', 'Tiêu chuẩn, quy chuẩn và hướng dẫn kỹ thuật', 'Quản lý chất lượng', 'An toàn lao động'],
    category: 'Rà phá bom mìn, vật nổ',
    keywords: ['QCVN 01:2022', 'độ sâu rà phá', '0.3m', '3m', '5m', 'hủy nổ bom mìn', 'tín hiệu từ', 'khoảng cách an toàn', 'nghiệm thu đất sạch'],
    replacingDoc: '',
    replacedDoc: 'QCVN 01:2019/BQP',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-qcvn01-2022/view',
    pdfFileName: 'QCVN_01_2022_BQP_Quy_Chuan_RPBM.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/qcvn-01-2022-bqp',
    driveUrl: 'https://drive.google.com/file/d/sample-qcvn01-2022/view',
    notes: 'Văn bản quy chuẩn kỹ thuật cốt lõi bắt buộc áp dụng cho mọi dự án RPBM trên toàn quốc.',
    summary: 'Quy định các tiêu chuẩn kỹ thuật bắt buộc: độ sâu rà phá (trên mặt đất 0.3m, đến 3m, 5m, rà phá dưới nước đến 5m nước), mật độ tín hiệu, khoảng cách an toàn hủy nổ và quy trình kiểm tra xác xuất nghiệm thu đất sạch.',
    keyPoints: [
      'Điều 2.1: Độ sâu rà phá chuẩn 0.3m cho mặt bằng nông, 3m và 5m cho công trình sâu.',
      'Điều 4.2: Khoảng cách an toàn tối thiểu khi hủy nổ bom lớn phải >= 300m - 500m đối với dân cư.',
      'Điều 6.1: Nghiệm thu xác suất tối thiểu 1% - 3% diện tích đã thi công.',
      'Trách nhiệm đơn vị thi công: Đảm bảo an toàn tuyệt đối cho người và phương tiện, lập nhật ký tín hiệu đầy đủ.'
    ],
    fullContent: `QUY CHUẨN KỸ THUẬT QUỐC GIA QCVN 01:2022/BQP VỀ RÀ PHÁ BOM MÌN VẬT NỔ
Chương I. QUY ĐỊNH CHUNG
- Mục đích: Quy định bắt buộc về trình tự, phương pháp và tiêu chuẩn kỹ thuật rà phá bom mìn vật nổ (RPBM) tại Việt Nam.
- Phạm vi áp dụng: Tất cả các dự án ĐTXD, dự án rà phá bom mìn dùng ngân sách nhà nước hoặc xã hội hóa.

Chương II. TIÊU CHUẨN KỸ THUẬT RÀ PHÁ
- Độ sâu rà phá đến 0,3m: Sử dụng máy dò nông (Vallon, Minelab) rà phát hiện tín hiệu kim loại màu và sắt từ.
- Độ sâu rà phá đến 3m và 5m: Sử dụng máy dò từ trường sâu (Foerster, Vallon EL1302) và đào kiểm tra tín hiệu.
- Rà phá dưới nước: Áp dụng cho sông, hồ, biển nông đến độ sâu 5m nước với đội thợ lặn chuyên trách có chứng chỉ Cấp 2 trở lên.

Chương III. QUY TRÌNH HỦY NỔ VẬT NỔ VÀ AN TOÀN
- Khoảng cách an toàn hủy nổ: Bom đạn nhỏ >= 150m; Bom lớn trên 250kg >= 500m; có hầm chắn sóng nổ và che chắn mảnh văng.
- Đơn vị hủy nổ phải lập Kế hoạch hủy nổ được Bộ Tư lệnh Quân khu hoặc Binh chủng Công binh phê duyệt.

Chương IV. NGHIỆM THU VÀ BÀN GIAO ĐẤT SẠCH
- Đơn vị giám sát tiến hành kiểm tra xác suất tối thiểu 1% - 3% diện tích trên ô lưới ngẫu nhiên.
- Tỷ lệ sạch tín hiệu yêu cầu: 100% không còn vật nổ nguy hiểm.`
  },
  {
    id: 'leg-02',
    code: 'VBPL-RPBM-002',
    docNumberSymbol: 'Nghị định 18/2019/NĐ-CP',
    title: 'Nghị định về Quản lý và Thực hiện Hoạt động Khắc phục Hậu quả Bom mìn Vật nổ Sau Chiến tranh',
    issuingAgency: 'Chính phủ',
    docType: 'Nghị định',
    type: 'Nghị định',
    issuedDate: '2019-02-01',
    effectiveDate: '2019-03-20',
    expiryDate: '',
    fields: ['Quản lý dự án', 'Rà phá bom mìn, vật nổ', 'Đầu tư xây dựng', 'Lưu trữ hồ sơ'],
    category: 'Rà phá bom mìn, vật nổ',
    keywords: ['Nghị định 18/2019', 'chủ đầu tư', 'cơ quan phê duyệt', 'chứng chỉ năng lực', 'bàn giao đất sạch', 'VNMAC'],
    replacingDoc: '',
    replacedDoc: 'Quyết định 96/2006/QĐ-TTg',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-nd18-2019/view',
    pdfFileName: 'Nghi_Dinh_18_2019_ND_CP_Quan_Ly_RPBM.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/nghi-dinh-18-2019-nd-cp',
    driveUrl: 'https://drive.google.com/file/d/sample-nd18-2019/view',
    notes: 'Khung pháp lý cao nhất về quản lý nhà nước và trình tự thực hiện các hoạt động RPBM.',
    summary: 'Quy định thẩm quyền phê duyệt dự án, điều kiện năng lực của tổ chức đơn vị thi công RPBM, trách nhiệm của Chủ đầu tư, Bộ Quốc phòng, VNMAC và UBND cấp tỉnh trong quản lý bàn giao đất sạch.',
    keyPoints: [
      'Điều 5: Thẩm quyền phê duyệt phương án thi công và dự toán RPBM (Bộ Quốc phòng, Quân khu, Bộ Tư lệnh).',
      'Điều 12: Điều kiện cấp chứng chỉ năng lực hành nghề RPBM cho doanh nghiệp quân đội và tổ chức xã hội.',
      'Điều 18: Trình tự nghiệm thu bàn giao hồ sơ hoàn công đất sạch bom mìn.',
      'Trách nhiệm Chủ đầu tư: Đảm bảo nguồn vốn và tổ chức nghiệm thu đúng trình tự.'
    ],
    fullContent: `NGHỊ ĐỊNH 18/2019/NĐ-CP CỦA CHÍNH PHỦ VỀ QUẢN LÝ VÀ THỰC HIỆN HOẠT ĐỘNG KHẮC PHỤC HẬU QUẢ BOM MÌN VẬT NỔ
Chương I. QUY ĐỊNH CHUNG
- Điều 1. Phạm vi điều chỉnh: Nghị định này quy định về điều kiện năng lực, trình tự thủ tục phê duyệt, thực hiện, kiểm tra nghiệm thu các chương trình, dự án rà phá bom mìn vật nổ.
- Điều 3. Giải thích từ ngữ: "Diện tích đất sạch" là diện tích đã được dò tìm, gom hủy hết bom mìn vật nổ theo đúng tiêu chuẩn kỹ thuật QCVN 01:2022/BQP.

Chương II. QUẢN LÝ NĂNG LỰC TỔ CHỨC VÀ NHÂN SỰ
- Điều 8. Tổ chức tham gia thi công RPBM phải có Giấy phép đăng ký năng lực do Bộ Quốc phòng / Bộ Tổng Tham mưu cấp.
- Điều 10. Cán bộ chỉ huy công trường phải có chứng chỉ Chỉ huy trưởng RPBM; Kỹ thuật viên phải có chứng chỉ hành nghề Cấp 1, Cấp 2 hoặc Cấp 3 còn hiệu lực.

Chương III. THỦ TỤC VÀ PHÊ DUYỆT HỒ SƠ
- Điều 15. Hồ sơ đề nghị thẩm định PAKTTC & Dự toán gồm: Tờ trình, Bản vẽ phạm vi khảo sát, Dự toán chi tiết theo Thông tư 195/2019/TT-BQP.
- Điều 20. Bàn giao kết quả: Sau khi nghiệm thu xong, lập 04 bộ Hồ sơ hoàn công lưu trữ tại Chủ đầu tư, Đơn vị thi công, Quân khu và Trung tâm VNMAC.`
  },
  {
    id: 'leg-03',
    code: 'VBPL-RPBM-003',
    docNumberSymbol: 'Thông tư 195/2019/TT-BQP',
    title: 'Thông tư Quy định Định mức Kinh tế - Kỹ thuật Rà phá Bom mìn Vật nổ',
    issuingAgency: 'Bộ Quốc phòng',
    docType: 'Thông tư',
    type: 'Thông tư',
    issuedDate: '2019-12-20',
    effectiveDate: '2020-02-15',
    expiryDate: '',
    fields: ['Thanh toán và quyết toán', 'Rà phá bom mìn, vật nổ', 'Quản lý trang thiết bị', 'Hợp đồng'],
    category: 'Thanh toán và quyết toán',
    keywords: ['Thông tư 195/2019', 'định mức kinh tế kỹ thuật', 'dự toán RPBM', 'đơn giá máy dò', 'nhân công công binh', 'chi phí hủy nổ'],
    replacingDoc: '',
    replacedDoc: 'Thông tư 154/2013/TT-BQP',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-tt195-2019/view',
    pdfFileName: 'Thong_Tu_195_2019_TT_BQP_Dinh_Muc_RPBM.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/thong-tu-195-2019-tt-bqp',
    driveUrl: 'https://drive.google.com/file/d/sample-tt195-2019/view',
    notes: 'Căn cứ pháp lý để lập, thẩm định và phê duyệt dự toán, thanh quyết toán khối lượng RPBM.',
    summary: 'Bộ định mức kinh tế kỹ thuật chi tiết quy định khối lượng lao động (ngày công), ca máy dò nông, máy dò sâu, vật tư tiêu hao (thuốc nổ, kíp nổ, dây cháy chậm) và hệ số địa hình cho từng loại diện tích.',
    keyPoints: [
      'Định mức nhân công: Phân cấp theo bậc thợ công binh và chứng chỉ kỹ thuật.',
      'Định mức máy thiết bị: Ca sử dụng máy dò Vallon, Foerster, máy toàn đạc GPS.',
      'Hệ số điều chỉnh: Địa hình đồi núi cao, rừng rậm hệ số K = 1.2 - 1.4.',
      'Quy trình lập dự toán và thanh quyết toán khối lượng thi công thực tế.'
    ],
    fullContent: `THÔNG TƯ 195/2019/TT-BQP CỦA BỘ QUỐC PHÒNG QUY ĐỊNH ĐỊNH MỨC KINH TẾ - KỸ THUẬT RÀ PHÁ BOM MÌN VẬT NỔ
Chương I. ĐỊNH MỨC LAO ĐỘNG VÀ THIẾT BỊ
- Định mức diện tích 1 ha mặt bằng đất cấp 1: Cần 24-32 ngày công kỹ thuật viên.
- Định mức ca máy: 1 ha máy dò nông tính 12 ca máy; 1 ha máy dò sâu đến 3m tính 28 ca máy từ trường.

Chương II. CHI PHÍ THUỐC NỔ VÀ HỦY VẬT NỔ
- Vật tư tiêu hao hủy nổ 1 quả bom MK-82: 5kg thuốc nổ TNT/C4, 2 kíp nổ số 8, 10m dây nổ.
- Chi phí bảo vệ hiện trường và rào chắn cảnh báo an toàn được tính vào chi phí trực tiếp.`
  },
  {
    id: 'leg-04',
    code: 'VBPL-QLDA-001',
    docNumberSymbol: 'Luật 22/2023/QH15',
    title: 'Luật Đấu thầu năm 2023',
    issuingAgency: 'Quốc hội',
    docType: 'Luật',
    type: 'Luật',
    issuedDate: '2023-06-23',
    effectiveDate: '2024-01-01',
    expiryDate: '',
    fields: ['Đấu thầu', 'Quản lý dự án', 'Hợp đồng', 'Thanh toán và quyết toán'],
    category: 'Đấu thầu',
    keywords: ['Luật Đấu thầu 2023', 'chỉ định thầu', 'đấu thầu qua mạng', 'hồ sơ mời thầu', 'chỉ định thầu RPBM', 'quân đội'],
    replacingDoc: '',
    replacedDoc: 'Luật Đấu thầu 43/2013/QH13',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-luat-dauthau-2023/view',
    pdfFileName: 'Luat_Dau_Thau_22_2023_QH15.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/luat-22-2023-qh15',
    driveUrl: 'https://drive.google.com/file/d/sample-luat-dauthau-2023/view',
    notes: 'Quy định các trường hợp chỉ định thầu đặc thù đối với nhiệm vụ an ninh quốc phòng và rà phá bom mìn.',
    summary: 'Quy định quản lý nhà nước về hoạt động đấu thầu, các hình thức lựa chọn nhà thầu, hồ sơ mời thầu, quy trình xét thầu qua mạng VNEPS và quy định chỉ định thầu cho gói thầu RPBM quốc phòng.',
    keyPoints: [
      'Điều 23.1.e: Cho phép chỉ định thầu gói thầu rà phá bom mìn phục vụ quốc phòng an ninh cấp bách.',
      'Điều 42: Quy trình đấu thầu qua mạng rộng rãi trên Hệ thống Mạng đấu thầu Quốc gia.',
      'Điều 73: Quyền và trách nhiệm của Chủ đầu tư trong phê duyệt HSMT và kết quả lựa chọn nhà thầu.'
    ],
    fullContent: `LUẬT ĐẤU THẦU SỐ 22/2023/QH15
Điều 23. Các trường hợp chỉ định thầu:
- Gói thầu rà phá bom mìn, vật nổ để chuẩn bị mặt bằng thi công dự án đầu tư công khẩn cấp hoặc dự án thuộc nhiệm vụ an ninh, quốc phòng được áp dụng hình thức chỉ định thầu rút gọn hoặc chỉ định thầu thông thường theo quyết định của Người có thẩm quyền.`
  },
  {
    id: 'leg-05',
    code: 'VBPL-XD-001',
    docNumberSymbol: 'Nghị định 15/2021/NĐ-CP',
    title: 'Nghị định Quy định Chi tiết một số Nội dung về Quản lý Dự án Đầu tư Xây dựng',
    issuingAgency: 'Chính phủ',
    docType: 'Nghị định',
    type: 'Nghị định',
    issuedDate: '2021-03-03',
    effectiveDate: '2021-03-03',
    expiryDate: '',
    fields: ['Đầu tư xây dựng', 'Quản lý dự án', 'Quản lý chất lượng', 'Lưu trữ hồ sơ'],
    category: 'Đầu tư xây dựng',
    keywords: ['Nghị định 15/2021', 'thẩm định báo cáo kinh tế kỹ thuật', 'điều kiện khởi công', 'giấy phép xây dựng', 'hồ sơ pháp lý'],
    replacingDoc: '',
    replacedDoc: 'Nghị định 59/2015/NĐ-CP',
    amendingDoc: 'Nghị định 35/2023/NĐ-CP',
    validityStatus: 'sua_doi_bo_sung',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-nd15-2021/view',
    pdfFileName: 'Nghi_Dinh_15_2021_ND_CP_Quan_Ly_Du_An.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/nghi-dinh-15-2021-nd-cp',
    driveUrl: 'https://drive.google.com/file/d/sample-nd15-2021/view',
    notes: 'Quy định hồ sơ điều kiện khởi công công trình và phân cấp thẩm định dự án.',
    summary: 'Quy định lập, thẩm định, phê duyệt dự án ĐTXD; quản lý điều kiện năng lực tổ chức tư vấn; điều kiện khởi công công trình xây dựng (bao gồm biên bản bàn giao mặt bằng sạch bom mìn).',
    keyPoints: [
      'Điều 107: Điều kiện khởi công công trình bắt buộc phải có Biên bản Bàn giao mặt bằng sạch bom mìn vật nổ.',
      'Điều 32: Phân cấp thẩm định Báo cáo nghiên cứu khả thi và Báo cáo kinh tế - kỹ thuật.',
      'Sửa đổi bổ sung bởi Nghị định 35/2023/NĐ-CP về đơn giản hóa thủ tục hành chính.'
    ],
    fullContent: `NGHỊ ĐỊNH 15/2021/NĐ-CP VỀ QUẢN LÝ DỰ ÁN ĐẦU TƯ XÂY DỰNG
Điều 107. Điều kiện khởi công công trình xây dựng:
1. Có mặt bằng xây dựng để bàn giao toàn bộ hoặc từng phần theo tiến độ dự án.
2. Đã hoàn thành công tác rà phá bom mìn vật nổ đạt tiêu chuẩn an toàn mặt bằng theo quy định của Bộ Quốc phòng.`
  },
  {
    id: 'leg-06',
    code: 'VBPL-CL-001',
    docNumberSymbol: 'Nghị định 06/2021/NĐ-CP',
    title: 'Nghị định Quy định Chi tiết một số Nội dung về Quản lý Chất lượng, Thi công Xây dựng và Bảo trì Công trình Xây dựng',
    issuingAgency: 'Chính phủ',
    docType: 'Nghị định',
    type: 'Nghị định',
    issuedDate: '2021-01-26',
    effectiveDate: '2021-01-26',
    expiryDate: '',
    fields: ['Quản lý chất lượng', 'An toàn lao động', 'Đầu tư xây dựng', 'Lưu trữ hồ sơ'],
    category: 'Quản lý chất lượng',
    keywords: ['Nghị định 06/2021', 'quản lý chất lượng', 'nhật ký thi công', 'nghiệm thu hoàn thành', 'hồ sơ hoàn công'],
    replacingDoc: '',
    replacedDoc: 'Nghị định 46/2015/NĐ-CP',
    amendingDoc: 'Nghị định 35/2023/NĐ-CP',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-nd06-2021/view',
    pdfFileName: 'Nghi_Dinh_06_2021_ND_CP_Chat_Luong.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/nghi-dinh-06-2021-nd-cp',
    driveUrl: 'https://drive.google.com/file/d/sample-nd06-2021/view',
    notes: 'Quy chuẩn bắt buộc về nhật ký thi công, bản vẽ hoàn công và nghiệm thu hạng mục công trình.',
    summary: 'Quy định chi tiết về giám sát thi công, nghiệm thu công việc, nghiệm thu giai đoạn, lập hồ sơ hoàn thành công trình và quản lý an toàn lao động trong thi công xây dựng.',
    keyPoints: [
      'Điều 13: Trách nhiệm của nhà thầu thi công trong việc lập nhật ký thi công hàng ngày.',
      'Điều 21: Quy trình nghiệm thu công việc xây dựng và nghiệm thu hoàn thành hạng mục.',
      'Phụ lục VI: Danh mục danh mục hồ sơ hoàn thành công trình bắt buộc phải lưu trữ.'
    ],
    fullContent: `NGHỊ ĐỊNH 06/2021/NĐ-CP VỀ QUẢN LÝ CHẤT LƯỢNG CÔNG TRÌNH XÂY DỰNG
Điều 21. Nghiệm thu công việc xây dựng:
- Căn cứ nghiệm thu: Phiếu yêu cầu nghiệm thu, Nhật ký thi công, Bản vẽ thi công đã phê duyệt và Kết quả kiểm tra xác suất hiện trường.`
  },
  {
    id: 'leg-07',
    code: 'VBPL-AT-001',
    docNumberSymbol: 'Thông tư 16/2021/TT-BXD',
    title: 'Thông tư Ban hành QCVN 18:2021/BXD Quy chuẩn Kỹ thuật Quốc gia về An toàn trong Thi công Xây dựng',
    issuingAgency: 'Bộ Xây dựng',
    docType: 'Thông tư',
    type: 'Thông tư',
    issuedDate: '2021-12-20',
    effectiveDate: '2022-06-20',
    expiryDate: '',
    fields: ['An toàn lao động', 'Quản lý trang thiết bị', 'Rà phá bom mìn, vật nổ'],
    category: 'An toàn lao động',
    keywords: ['Thông tư 16/2021', 'QCVN 18:2021', 'an toàn lao động', 'trang bị bảo hộ PPE', 'biển cảnh báo nguy hiểm'],
    replacingDoc: '',
    replacedDoc: 'QCVN 18:2014/BXD',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-tt16-2021/view',
    pdfFileName: 'Thong_Tu_16_2021_TT_BXD_An_Toan.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/thong-tu-16-2021-tt-bxd',
    driveUrl: 'https://drive.google.com/file/d/sample-tt16-2021/view',
    notes: 'Tiêu chuẩn bắt buộc đối với trang bị bảo hộ lao động cá nhân và rào chắn khu vực nguy hiểm.',
    summary: 'Quy chuẩn an toàn thi công toàn diện: phương tiện bảo vệ cá nhân (mũ bảo hiểm, áo giáp chống mảnh văng, giày bảo hộ), rào chắn cảnh báo khu vực có nguy cơ cháy nổ, sơ cấp cứu tại chỗ.',
    keyPoints: [
      'Mục 2.1: Trang bị đầy đủ áo giáp, mũ bảo hộ, bộ đàm liên lạc cho kỹ thuật viên ngoài hiện trường.',
      'Mục 3.4: Lập rào chắn mềm và cắm biển cảnh báo "KHU VỰC CÓ BOM MÌN NGUY HIỂM - CẤM VÀO".',
      'Mục 5.2: Phải có túi cứu thương và phương án cấp cứu y tế liên kết với bệnh viện tuyến huyện gần nhất.'
    ],
    fullContent: `QCVN 18:2021/BXD VỀ AN TOÀN THI CÔNG XÂY DỰNG
- Đơn vị thi công phải phổ biến nội quy an toàn lao động đầu giờ hàng ngày cho 100% cán bộ chiến sĩ thi công trước khi ra hiện trường.`
  },
  {
    id: 'leg-08',
    code: 'VBPL-HD-001',
    docNumberSymbol: 'Nghị định 37/2015/NĐ-CP',
    title: 'Nghị định Quy định Chi tiết về Hợp đồng Xây dựng',
    issuingAgency: 'Chính phủ',
    docType: 'Nghị định',
    type: 'Nghị định',
    issuedDate: '2015-04-22',
    effectiveDate: '2015-06-15',
    expiryDate: '',
    fields: ['Hợp đồng', 'Thanh toán và quyết toán', 'Quản lý dự án'],
    category: 'Hợp đồng',
    keywords: ['Nghị định 37/2015', 'hợp đồng trọn gói', 'tạm ứng hợp đồng', 'bảo lãnh thực hiện hợp đồng', 'phạt vi phạm tiến độ'],
    replacingDoc: '',
    replacedDoc: 'Nghị định 48/2010/NĐ-CP',
    amendingDoc: 'Nghị định 50/2021/NĐ-CP',
    validityStatus: 'sua_doi_bo_sung',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-nd37-2015/view',
    pdfFileName: 'Nghi_Dinh_37_2015_ND_CP_Hop_Dong.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/nghi-dinh-37-2015-nd-cp',
    driveUrl: 'https://drive.google.com/file/d/sample-nd37-2015/view',
    notes: 'Khung pháp lý ký kết và thực hiện hợp đồng thi công rà phá bom mìn.',
    summary: 'Quy định các loại hợp đồng (trọn gói, theo đơn giá cố định, theo đơn giá điều chỉnh), tỷ lệ tạm ứng tối thiểu (15% - 30%), phạt chậm tiến độ và điều kiện thanh toán từng đợt.',
    keyPoints: [
      'Điều 18: Mức tạm ứng hợp đồng thi công tối thiểu 15% và tối đa 50% giá trị hợp đồng.',
      'Điều 16: Bảo lãnh thực hiện hợp đồng từ 2% đến 10% giá trị hợp đồng.',
      'Điều 34: Phạt vi phạm hợp đồng không quá 12% giá trị phần hợp đồng bị vi phạm.'
    ],
    fullContent: `NGHỊ ĐỊNH 37/2015/NĐ-CP VỀ HỢP ĐỒNG XÂY DỰNG
Điều 18. Tạm ứng hợp đồng: Viêc tạm ứng hợp đồng chỉ được thực hiện sau khi hợp đồng xây dựng có hiệu lực và Bên giao thầu nhận được bảo lãnh tạm ứng hợp đồng.`
  },
  {
    id: 'leg-09',
    code: 'VBPL-LT-001',
    docNumberSymbol: 'Nghị định 30/2020/NĐ-CP',
    title: 'Nghị định về Công tác Văn thư và Lưu trữ Hồ sơ',
    issuingAgency: 'Chính phủ',
    docType: 'Nghị định',
    type: 'Nghị định',
    issuedDate: '2020-03-05',
    effectiveDate: '2020-03-05',
    expiryDate: '',
    fields: ['Lưu trữ hồ sơ', 'Quản lý tài sản', 'Quản lý dự án'],
    category: 'Lưu trữ hồ sơ',
    keywords: ['Nghị định 30/2020', 'công tác văn thư', 'lưu trữ hồ sơ', 'mã định danh văn bản', 'thời hạn bảo quản', 'vĩnh viễn'],
    replacingDoc: '',
    replacedDoc: 'Nghị định 110/2004/NĐ-CP',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-nd30-2020/view',
    pdfFileName: 'Nghi_Dinh_30_2020_ND_CP_Van_Thu.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/nghi-dinh-30-2020-nd-cp',
    driveUrl: 'https://drive.google.com/file/d/sample-nd30-2020/view',
    notes: 'Quy định lưu trữ vĩnh viễn đối với Hồ sơ hoàn công nghiệm thu rà phá bom mìn.',
    summary: 'Quy định thể thức văn bản, ký số điện tử, lập hồ sơ hiện hành, nộp lưu hồ sơ vào Kho Lưu trữ cơ quan và thời hạn bảo quản tài liệu công trình quốc phòng.',
    keyPoints: [
      'Điều 14: Quy chuẩn thể thức trình bày văn bản hành chính và văn bản chuyên ngành quân sự.',
      'Điều 26: Hồ sơ nghiệm thu dự án quốc phòng & bom mìn thuộc danh mục lưu trữ VĨNH VIỄN.',
      'Điều 30: Sử dụng mã QR và số hóa tài liệu scan lưu trữ dữ liệu điện tử song song với bản giấy.'
    ],
    fullContent: `NGHỊ ĐỊNH 30/2020/NĐ-CP VỀ CÔNG TÁC VĂN THƯ LƯU TRỮ
- Hồ sơ hoàn thành công trình rà phá bom mìn vật nổ là tài liệu quan trọng quốc gia, phải lập danh mục và bảo quản vĩnh viễn trong kho lưu trữ chuyên dụng.`
  },
  {
    id: 'leg-10',
    code: 'VBPL-TB-001',
    docNumberSymbol: 'Thông tư 23/2023/TT-BTC',
    title: 'Thông tư Hướng dẫn Chế độ Quản lý, Tính Hao mòn, Khấu hao Tài sản Cố định tại Cơ quan, Đơn vị',
    issuingAgency: 'Bộ Tài chính',
    docType: 'Thông tư',
    type: 'Thông tư',
    issuedDate: '2023-04-25',
    effectiveDate: '2023-06-10',
    expiryDate: '',
    fields: ['Quản lý trang thiết bị', 'Quản lý tài sản', 'Thanh toán và quyết toán'],
    category: 'Quản lý trang thiết bị',
    keywords: ['Thông tư 23/2023', 'tài sản cố định', 'máy dò bom mìn', 'khấu hao tài sản', 'thanh lý thiết bị'],
    replacingDoc: '',
    replacedDoc: 'Thông tư 45/2018/TT-BTC',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-tt23-2023/view',
    pdfFileName: 'Thong_Tu_23_2023_TT_BTC_Tai_San.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/thong-tu-23-2023-tt-btc',
    driveUrl: 'https://drive.google.com/file/d/sample-tt23-2023/view',
    notes: 'Căn cứ tính khấu hao và kiểm kê tài sản máy dò, xe chuyên dụng RPBM.',
    summary: 'Quy định danh mục tài sản cố định, thời gian sử dụng và tỷ lệ hao mòn đối với máy móc thiết bị chuyên dùng quân sự, phương tiện vận tải và máy dò kim loại.',
    keyPoints: [
      'Máy dò rà phá bom mìn có thời gian khấu hao 5 - 8 năm.',
      'Xe ô tô tải chở trang thiết bị công binh khấu hao 10 năm.',
      'Quy trình kiểm kê đánh giá lại giá trị tài sản định kỳ vào ngày 31/12 hàng năm.'
    ],
    fullContent: `THÔNG TƯ 23/2023/TT-BTC QUẢN LÝ TÀI SẢN CỐ ĐỊNH
- Quy định việc ghi sổ theo dõi mã tài sản, số serial và tình trạng kỹ thuật của từng máy dò bom mìn chuyên dụng.`
  },
  {
    id: 'leg-11',
    code: 'VBPL-TC-001',
    docNumberSymbol: 'TCVN 10299-1:2014',
    title: 'Tiêu chuẩn quốc gia TCVN 10299-1:2014 về Khắc phục Hậu quả Bom mìn Vật nổ - Phần 1: Yêu cầu Chung',
    issuingAgency: 'Bộ Khoa học và Công nghệ',
    docType: 'Tiêu chuẩn (TCVN)',
    type: 'TCVN',
    issuedDate: '2014-12-30',
    effectiveDate: '2014-12-30',
    expiryDate: '',
    fields: ['Tiêu chuẩn, quy chuẩn và hướng dẫn kỹ thuật', 'Rà phá bom mìn, vật nổ', 'Quản lý chất lượng'],
    category: 'Tiêu chuẩn, quy chuẩn và hướng dẫn kỹ thuật',
    keywords: ['TCVN 10299-1:2014', 'phân loại vật nổ', 'mìn cá nhân', 'đạn pháo', 'xác suất an toàn 99.9%'],
    replacingDoc: '',
    replacedDoc: '',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    status: 'con_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-tcvn10299/view',
    pdfFileName: 'TCVN_10299_1_2014_Khac_Phuc_Bom_Min.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/tcvn-10299-1-2014',
    driveUrl: 'https://drive.google.com/file/d/sample-tcvn10299/view',
    notes: 'Tiêu chuẩn kỹ thuật phân loại bom đạn và đánh giá mức độ an toàn đất sạch.',
    summary: 'Quy định thuật ngữ, định nghĩa phân loại bom, mìn, đạn pháo, vật nổ tự chế, ngòi nổ và tiêu chuẩn đất sạch đạt xác suất an toàn 99,9%.',
    keyPoints: [
      'Mục 3.1: Định nghĩa chi tiết 5 nhóm bom mìn vật nổ chính.',
      'Mục 5.2: Tiêu chuẩn nghiệm thu mặt bằng đất sạch đạt xác suất an toàn 99,9%.'
    ],
    fullContent: `TCVN 10299-1:2014 TIÊU CHUẨN KHẮC PHỤC HẬU QUẢ BOM MÌN VẬT NỔ
- Yêu cầu về đăng ký theo dõi tín hiệu và hủy nổ an toàn tuyệt đối.`
  },
  {
    id: 'leg-12',
    code: 'VBPL-OLD-001',
    docNumberSymbol: 'QCVN 01:2012/BQP',
    title: 'Quy chuẩn Kỹ thuật Quốc gia về Rà phá Bom mìn Vật nổ (Cũ - Đã hết hiệu lực)',
    issuingAgency: 'Bộ Quốc phòng',
    docType: 'Quy chuẩn (QCVN)',
    type: 'QCVN',
    issuedDate: '2012-05-10',
    effectiveDate: '2012-07-01',
    expiryDate: '2019-11-01',
    fields: ['Tiêu chuẩn, quy chuẩn và hướng dẫn kỹ thuật', 'Rà phá bom mìn, vật nổ'],
    category: 'Tiêu chuẩn, quy chuẩn và hướng dẫn kỹ thuật',
    keywords: ['QCVN 01:2012', 'hết hiệu lực', 'thay thế bởi QCVN 01:2019'],
    replacingDoc: 'QCVN 01:2019/BQP',
    replacedDoc: '',
    amendingDoc: '',
    validityStatus: 'het_hieu_luc',
    status: 'het_hieu_luc',
    pdfFileUrl: 'https://drive.google.com/file/d/sample-qcvn01-2012/view',
    pdfFileName: 'QCVN_01_2012_BQP_Het_Hieu_Luc.pdf',
    sourceUrl: 'https://vanban.chinhphu.vn/qcvn-01-2012-bqp',
    driveUrl: 'https://drive.google.com/file/d/sample-qcvn01-2012/view',
    notes: 'Văn bản đã HẾT HIỆU LỰC do đã được thay thế hoàn toàn bởi QCVN 01:2019/BQP từ ngày 01/11/2019.',
    summary: 'Quy chuẩn cũ năm 2012 đã hết hiệu lực thi hành.',
    keyPoints: [
      'Đã bị thay thế bởi QCVN 01:2019/BQP.'
    ],
    fullContent: `QCVN 01:2012/BQP - VĂN BẢN ĐÃ HẾT HIỆU LỰC`
  }
];
