import {
  ExecutionArea,
  GridBlock,
  UXODailyExecutionLog,
  UXOSignalRecord,
  UXODiscoveryDossier,
  UXOQualityRecord,
  UXOSafetyRecord
} from '../types';

// 8.1 Khu vực thi công mẫu
export const INITIAL_EXECUTION_AREAS: ExecutionArea[] = [
  {
    id: 'area-101',
    code: 'KV-QT-01',
    name: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế (Km 12+000 - Km 35+500)',
    location: 'Xã Linh Trường, Huyện Gio Linh, Tỉnh Quảng Trị',
    coordinates: '16°52\'48.2"N 106°55\'12.4"E',
    areaHa: 45.0,
    terrain: 'Đồi núi thấp, rừng trồng cao su và keo lá tràm',
    pollutionLevel: 'rat_cao',
    surveyMethod: 'Dò kim loại nông 0.3m kết hợp Dò từ trường sâu 5m (Thiết bị Foerster FEREX & Vallon)',
    handoverDate: '2026-02-05',
    executionDate: '2026-02-10',
    status: 'dang_thi_cong',
    manager: 'Thượng tá Nguyễn Văn Hùng',
    mapFileUrl: 'https://drive.google.com/file/d/KV1_QUANGTRI_MAP/view',
    digitalMapLink: 'https://maps.google.com/?q=16.880055,106.920111',
    fieldPhotos: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop&q=80'
    ],
    notes: 'Khu vực có mật độ tín hiệu kim loại rất cao do chiến trường cũ. Yêu cầu tuân thủ quy trình đào kiểm tra 100%.'
  },
  {
    id: 'area-102',
    code: 'KV-QT-02',
    name: 'Khu vực 2 - Đoạn tuyến Km 20+000 đến Km 30+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế (Km 12+000 - Km 35+500)',
    location: 'Xã Gio An, Huyện Gio Linh, Tỉnh Quảng Trị',
    coordinates: '16°50\'12.1"N 106°57\'05.8"E',
    areaHa: 50.0,
    terrain: 'Đồng bằng trung du, ruộng lúa và vườn cây ăn quả',
    pollutionLevel: 'cao',
    surveyMethod: 'Dò nông kim loại 0.3m kết hợp Đào thu gom phế liệu',
    handoverDate: '2026-03-01',
    executionDate: '2026-03-15',
    status: 'cho_kiem_tra',
    manager: 'Đại úy Trần Văn Mạnh',
    mapFileUrl: 'https://drive.google.com/file/d/KV2_QUANGTRI_MAP/view',
    digitalMapLink: 'https://maps.google.com/?q=16.836694,106.951611',
    fieldPhotos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    notes: 'Đã hoàn thành thi công 100% diện tích mặt bằng, chuẩn bị kiểm tra xác xuất nội bộ.'
  },
  {
    id: 'area-103',
    code: 'KV-HG-01',
    name: 'Khu vực Cụm Công nghiệp Vị Xuyên - Lô A & B',
    projectId: 'proj-02',
    projectName: 'Rà phá bom mìn Khu công nghiệp Vị Xuyên - Hà Giang',
    location: 'Thị trấn Vị Xuyên, Huyện Vị Xuyên, Tỉnh Hà Giang',
    coordinates: '22°45\'30.0"N 104°59\'15.0"E',
    areaHa: 30.0,
    terrain: 'Đồi núi đá vôi bãi bồi ven sông Lô',
    pollutionLevel: 'trung_binh',
    surveyMethod: 'Dò kim loại nông 0.3m & Máy dò bom từ trường độ sâu 3.0m',
    handoverDate: '2026-04-10',
    executionDate: '2026-04-20',
    status: 'cho_nghiem_thu',
    manager: 'Thiếu tá Lê Minh Tuấn',
    mapFileUrl: 'https://drive.google.com/file/d/KV_HAGIANG_MAP/view',
    digitalMapLink: 'https://maps.google.com/?q=22.758333,104.987500',
    fieldPhotos: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80'
    ],
    notes: 'Đã hoàn thành và chờ Hội đồng nghiệm thu Bộ Tư lệnh Công binh ký biên bản giao đất sạch.'
  }
];

// 8.2 Lưới dò và phân khu mẫu
export const INITIAL_GRID_BLOCKS: GridBlock[] = [
  // Lô A1 thuộc Khu vực 1 - Quảng Trị
  {
    id: 'grid-001',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotCode: 'Lô A1',
    gridCode: 'Ô A1-01',
    areaM2: 2500, // 50m x 50m
    cornerCoordinates: 'A(16.8801, 106.9201); B(16.8806, 106.9201); C(16.8806, 106.9206); D(16.8801, 106.9206)',
    approvedDepthM: 5.0,
    executionDate: '2026-02-12',
    executionTeam: 'Tổ RPBM Số 1 - Đội 1',
    equipmentUsed: 'Vallon VMR3 + Foerster FEREX 4.034',
    status: 'da_nghiem_thu',
    inspector: 'Đại úy Trần Văn Mạnh',
    acceptanceResult: 'Đạt yêu cầu QCVN 01:2019/BQP. Đã xử lý hết 12 tín hiệu kim loại phế liệu.',
    asBuiltMapUrl: 'https://drive.google.com/file/d/GRID_A1_01_MAP/view',
    notes: 'Đã cọc mốc ranh giới màu xanh lá cây.'
  },
  {
    id: 'grid-002',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotCode: 'Lô A1',
    gridCode: 'Ô A1-02',
    areaM2: 2500,
    cornerCoordinates: 'A(16.8806, 106.9201); B(16.8811, 106.9201); C(16.8811, 106.9206); D(16.8806, 106.9206)',
    approvedDepthM: 5.0,
    executionDate: '2026-02-15',
    executionTeam: 'Tổ RPBM Số 1 - Đội 1',
    equipmentUsed: 'Vallon VMR3',
    status: 'da_hoan_thanh',
    inspector: 'Thượng úy Lê Hoàng Anh',
    acceptanceResult: 'Chờ kiểm tra xác suất chất lượng của Cán bộ Kỹ thuật.',
    asBuiltMapUrl: 'https://drive.google.com/file/d/GRID_A1_02_MAP/view'
  },
  {
    id: 'grid-003',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotCode: 'Lô A1',
    gridCode: 'Ô A1-03',
    areaM2: 2500,
    cornerCoordinates: 'A(16.8811, 106.9201); B(16.8816, 106.9201); C(16.8816, 106.9206); D(16.8811, 106.9206)',
    approvedDepthM: 5.0,
    executionDate: '2026-02-20',
    executionTeam: 'Tổ RPBM Số 2 - Đội 1',
    equipmentUsed: 'Minelab F3 + Foerster FEREX',
    status: 'dang_thuc_hien',
    inspector: 'Đại úy Trần Văn Mạnh',
    acceptanceResult: 'Đang triển khai dò tìm độ sâu 0.3m đến 3m.',
    notes: 'Đang cắm cờ đánh dấu 5 vị trí tín hiệu dị thường.'
  },
  {
    id: 'grid-004',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotCode: 'Lô A1',
    gridCode: 'Ô A1-04',
    areaM2: 2500,
    cornerCoordinates: 'A(16.8816, 106.9201); B(16.8821, 106.9201); C(16.8821, 106.9206); D(16.8816, 106.9206)',
    approvedDepthM: 5.0,
    executionDate: '2026-02-25',
    executionTeam: 'Tổ RPBM Số 2 - Đội 1',
    equipmentUsed: 'Vallon VMR3',
    status: 'cho_kiem_tra',
    inspector: 'Thiếu tá Lê Minh Tuấn',
    acceptanceResult: 'Đã hoàn tất dò nông, chuẩn bị kiểm tra xác suất độ sâu 3m.'
  },
  {
    id: 'grid-005',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotCode: 'Lô A1',
    gridCode: 'Ô A1-05',
    areaM2: 2500,
    cornerCoordinates: 'A(16.8821, 106.9201); B(16.8826, 106.9201); C(16.8826, 106.9206); D(16.8821, 106.9206)',
    approvedDepthM: 5.0,
    executionDate: '2026-03-01',
    executionTeam: 'Tổ RPBM Số 3',
    equipmentUsed: 'Minelab F3',
    status: 'chua_thuc_hien',
    inspector: 'Đại úy Trần Văn Mạnh',
    acceptanceResult: 'Chưa thi công theo kế hoạch tuần 3 tháng 3.'
  },
  {
    id: 'grid-006',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotCode: 'Lô A1',
    gridCode: 'Ô A1-06',
    areaM2: 2500,
    cornerCoordinates: 'A(16.8826, 106.9201); B(16.8831, 106.9201); C(16.8831, 106.9206); D(16.8826, 106.9206)',
    approvedDepthM: 5.0,
    executionDate: '2026-03-02',
    executionTeam: 'Tổ RPBM Số 3',
    equipmentUsed: 'Vallon VMR3',
    status: 'khong_dat',
    inspector: 'Thượng tá Nguyễn Văn Hùng',
    acceptanceResult: 'Yêu cầu dò tìm lại do sót 1 tín hiệu kim loại ở độ sâu 0.4m tại góc Tây Nam.',
    notes: 'Tổ thi công cần kiểm tra hiệu chỉnh máy dò trước khi làm lại.'
  }
];

// 8.3 Nhật ký thi công hằng ngày mẫu
export const INITIAL_DAILY_LOGS: UXODailyExecutionLog[] = [
  {
    id: 'log-801',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế (Km 12+000 - Km 35+500)',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    logDate: '2026-07-28',
    weatherCondition: 'Nắng nhẹ, nhiệt độ 31°C, gió Đông Nam cấp 2. Thời tiết thuận lợi thi công.',
    personnelCount: 16,
    personnelList: 'Thượng tá Nguyễn Văn Hùng (Chỉ huy), Đại úy Trần Văn Mạnh (Kỹ thuật), 14 KTV & Chiến sĩ',
    equipmentUsed: '08 Máy dò kim loại Vallon VMR3, 02 Máy dò từ trường Foerster, 01 Xe chỉ huy, 01 Thiết bị y tế',
    startTime: '06:30',
    endTime: '17:00',
    executedAreaHa: 1.25,
    executedVolume: 'Dò nông 0.3m: 1.25 ha; Dò sâu 5m: 0.8 ha; Đào kiểm tra 18 vị trí',
    signalsDetectedCount: 18,
    checkedLocationsCount: 18,
    incidents: 'Không có sự cố mất an toàn. Máy dò số VMR3-04 bị nhiễu nguồn cần sạc bổ sung.',
    processingContent: 'Đã đào đào kiểm tra 18 tín hiệu: 16 vị trí phế liệu sắt gỉ; 02 vị trí phát hiện đạn pháo 105mm gỉ sét không ngòi nổ.',
    technicalOpinion: 'Kỹ thuật thi công đúng quy trình QCVN 01:2019/BQP. Tín hiệu thu gom an toàn.',
    supervisorOpinion: 'Giám sát thống nhất nhật ký. Cho phép chuyển sang thi công ô A1-04 ngày tiếp theo.',
    fieldPhotos: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop&q=80'
    ],
    signedLogFileUrl: 'https://drive.google.com/file/d/LOG_20260728_SIGNED_PDF/view'
  },
  {
    id: 'log-802',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế (Km 12+000 - Km 35+500)',
    areaId: 'area-101',
    areaName: 'Khu vực 1 - Đoạn tuyến Km 12+000 đến Km 20+000',
    logDate: '2026-07-27',
    weatherCondition: 'Nắng gắt, nhiệt độ 36°C, trưa có giông nhẹ.',
    personnelCount: 16,
    personnelList: 'Đại úy Trần Văn Mạnh (Cán bộ chỉ huy trực), 15 KTV & Chiến sĩ',
    equipmentUsed: '08 Máy dò Vallon, 02 Máy dò Foerster',
    startTime: '06:00',
    endTime: '16:30',
    executedAreaHa: 1.10,
    executedVolume: 'Dò nông 0.3m: 1.10 ha; Đào kiểm tra 12 vị trí',
    signalsDetectedCount: 12,
    checkedLocationsCount: 12,
    incidents: 'Không có',
    processingContent: 'Đã xử lý 12 tín hiệu kim loại, thu gom 15kg phế liệu sắt thép gỉ.',
    technicalOpinion: 'Đạt yêu cầu an toàn kỹ thuật.',
    supervisorOpinion: 'Đồng ý nghiệm thu khối lượng ngày 27/07.',
    signedLogFileUrl: 'https://drive.google.com/file/d/LOG_20260727_SIGNED_PDF/view'
  }
];

// 8.4 Sổ theo dõi tín hiệu mẫu
export const INITIAL_SIGNAL_RECORDS: UXOSignalRecord[] = [
  {
    id: 'sig-001',
    signalCode: 'TH-QT-2026-0101',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotOrGridCode: 'Lô A1 / Ô A1-03',
    coordinates: '16°52\'49.1"N 106°55\'13.2"E',
    detectionDate: '2026-07-28',
    detectionEquipment: 'Foerster FEREX 4.034 (Từ trường)',
    detectorPerson: 'Trung úy Nguyễn Hoàng Nam',
    estimatedDepthM: 1.8,
    initialClassification: 'Tín hiệu từ trường sâu - Nghi kim loại lớn',
    inspectionStatus: 'da_kiem_tra',
    inspectionResult: 'Mảnh vỏ bom MK-82 phế liệu không chứa độc hại hay chất nổ.',
    fieldPhotos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    relatedMinutes: 'Biên bản kiểm tra tín hiệu số 14/BB-KTTH',
    approver: 'Thượng tá Nguyễn Văn Hùng',
    notes: 'Đã hoàn tất lập biên bản và thu gom vào kho lưu trữ phế liệu công trường.'
  },
  {
    id: 'sig-002',
    signalCode: 'TH-QT-2026-0102',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotOrGridCode: 'Lô A1 / Ô A1-03',
    coordinates: '16°52\'50.0"N 106°55\'14.0"E',
    detectionDate: '2026-07-28',
    detectionEquipment: 'Vallon VMR3 (Kim loại nông)',
    detectorPerson: 'Thượng úy Lê Hoàng Anh',
    estimatedDepthM: 0.4,
    initialClassification: 'Tín hiệu kim loại nông nhỏ',
    inspectionStatus: 'da_kiem_tra',
    inspectionResult: 'Mảnh đạn pháo 105mm gỉ sét phế liệu.',
    approver: 'Đại úy Trần Văn Mạnh'
  },
  {
    id: 'sig-003',
    signalCode: 'TH-QT-2026-0103',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    lotOrGridCode: 'Lô A1 / Ô A1-04',
    coordinates: '16°52\'51.5"N 106°55\'15.1"E',
    detectionDate: '2026-07-28',
    detectionEquipment: 'Foerster FEREX 4.034',
    detectorPerson: 'Trung úy Nguyễn Hoàng Nam',
    estimatedDepthM: 2.5,
    initialClassification: 'Tín hiệu độ sâu >2.0m',
    inspectionStatus: 'dang_kiem_tra',
    inspectionResult: 'Đang tiến hành đào đất mở rộng kích thước 1.5m x 1.5m theo đúng phương án an toàn.',
    approver: 'Đại úy Trần Văn Mạnh'
  }
];

// 8.5 Hồ sơ phát hiện vật thể và vật nổ mẫu
export const INITIAL_DISCOVERY_DOSSIERS: UXODiscoveryDossier[] = [
  {
    id: 'disc-001',
    dossierCode: 'HS-VT-2026-01',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    location: 'Khu vực 1 - Lô A1 - Ô A1-03 (Tọa độ: 16°52\'49.1"N 106°55\'13.2"E)',
    detectionDate: '2026-07-28',
    objectType: 'Đạn pháo 105mm (Kích thước: Đường kính 105mm, dài 480mm, gỉ sét toàn thân)',
    quantity: 2,
    condition: 'Đã bị gỉ sét hư hỏng nặng, không ngòi nổ, đủ điều kiện thu gom vận chuyển an toàn.',
    receivingOrDisposalUnit: 'Bộ CHQS Tỉnh Quảng Trị / Ban Công binh',
    handoverTime: '2026-07-28 16:00',
    handoverMinutesUrl: 'https://drive.google.com/file/d/BB_BG_20260728_BCHQS_PDF/view',
    disposalMinutesUrl: 'https://drive.google.com/file/d/BB_XL_20260728_BCHQS_PDF/view',
    fieldPhotos: [
      'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop&q=80'
    ],
    preparer: 'Đại úy Trần Văn Mạnh (Cán bộ Kỹ thuật)',
    inspector: 'Thiếu tá Lê Minh Tuấn (Giám sát)',
    approver: 'Thượng tá Nguyễn Văn Hùng (Chỉ huy trưởng)',
    status: 'da_ban_giao'
  },
  {
    id: 'disc-002',
    dossierCode: 'HS-VT-2026-02',
    projectId: 'proj-02',
    projectName: 'Rà phá bom mìn Khu công nghiệp Vị Xuyên - Hà Giang',
    location: 'Khu vực Lô A2 - Thị trấn Vị Xuyên',
    detectionDate: '2026-05-14',
    objectType: 'Mìn cá nhân M14 (Bằng nhựa, đường kính 56mm)',
    quantity: 1,
    condition: 'Đã được cơ quan chuyên môn niêm phong an toàn và bàn giao xử lý theo quy định.',
    receivingOrDisposalUnit: 'Bộ CHQS Tỉnh Hà Giang',
    handoverTime: '2026-05-15 10:30',
    handoverMinutesUrl: 'https://drive.google.com/file/d/BB_BG_HAGIANG_PDF/view',
    preparer: 'Thiếu tá Lê Minh Tuấn',
    inspector: 'Đại úy Trần Văn Mạnh',
    approver: 'Thượng tá Nguyễn Văn Hùng',
    status: 'da_luu_ho_so'
  }
];

// 8.6 Quản lý chất lượng mẫu
export const INITIAL_QUALITY_RECORDS: UXOQualityRecord[] = [
  {
    id: 'qual-001',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    inspectionPlan: 'Kế hoạch kiểm tra chất lượng định kỳ tháng 07/2026 (KH-KTCL-07)',
    inspectionType: 'xac_suat',
    inspectionDate: '2026-07-20',
    inspectionResult: 'dat',
    nonConformities: 'Không có điểm không phù hợp về sót tín hiệu kim loại. Độ sâu rà phá đạt 100% chỉ tiêu 5.0m.',
    correctiveActions: 'Duy trì chế độ kiểm định định kỳ hằng tuần cho máy dò Vallon & Foerster.',
    responsiblePerson: 'Đại úy Trần Văn Mạnh',
    correctionDeadline: '2026-07-25',
    reInspectionResult: 'Tất cả các máy dò hoạt động ổn định.',
    acceptanceMinutesUrl: 'https://drive.google.com/file/d/BB_NT_CL_072026/view',
    asBuiltDossierUrl: 'https://drive.google.com/file/d/HS_HOANCONG_072026/view',
    inspector: 'Thiếu tá Lê Minh Tuấn (Giám sát trưởng)',
    status: 'da_nghiem_thu'
  },
  {
    id: 'qual-002',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    inspectionPlan: 'Kiểm tra xác suất nội bộ đột xuất Ô A1-06 (Lô A1)',
    inspectionType: 'noi_bo',
    inspectionDate: '2026-07-25',
    inspectionResult: 'can_khac_phuc',
    nonConformities: 'Phát hiện sót 01 tín hiệu kim loại mảnh gỉ sét ở độ sâu 0.4m gần cọc mốc Tây Nam.',
    correctiveActions: 'Yêu cầu Tổ thi công số 3 tiến hành dò rà lại 100% diện tích Ô A1-06.',
    responsiblePerson: 'Thượng úy Lê Hoàng Anh (Tổ trưởng Tổ 3)',
    correctionDeadline: '2026-07-29',
    inspector: 'Thượng tá Nguyễn Văn Hùng',
    status: 'cho_khac_phuc'
  }
];

// 8.7 Quản lý an toàn mẫu
export const INITIAL_SAFETY_RECORDS: UXOSafetyRecord[] = [
  {
    id: 'safe-001',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    safetyPlanTitle: 'Kế hoạch An toàn Lao động & An toàn Bom mìn Công trường Quảng Trị (KH-AT-2026)',
    briefedPersonnelList: '100% cán bộ, kỹ thuật viên và chiến sĩ công trường (16/16 người đã ký cam kết)',
    trainingMinutesUrl: 'https://drive.google.com/file/d/BB_HUANLUYEN_ANTOAN_PDF/view',
    dailyChecklist: [
      {
        date: '2026-07-28',
        ppeChecked: true,
        warningSignageChecked: true,
        medicalEquipmentChecked: true,
        communicationChecked: true,
        inspectorName: 'Đại úy Trần Văn Mạnh',
        passed: true,
        notes: 'Mũ bảo hộ, giày chuyên dụng, cờ cảnh báo ranh giới đầy đủ.'
      },
      {
        date: '2026-07-27',
        ppeChecked: true,
        warningSignageChecked: true,
        medicalEquipmentChecked: true,
        communicationChecked: true,
        inspectorName: 'Đại úy Trần Văn Mạnh',
        passed: true
      }
    ],
    ppeTrackingNotes: 'Mỗi cá nhân được trang bị: 01 Mũ bảo hộ chống mảnh văng, 01 Giày dò kim loại chống đinh, 01 Áo phản quang, 01 Găng tay da, 01 Bộ đàm cá nhân.',
    dangerAndRestrictedZones: 'Khu vực Lô A1 - Ô A1-03 và Ô A1-04 cắm cờ đỏ cảnh báo "KHU VỰC ĐANG DÒ TÌM RPBM - KHÔNG LẠI GẦN".',
    incidents: [
      {
        id: 'inc-01',
        incidentDate: '2026-06-10',
        description: 'Sạt lở nhẹ ta-luy bờ đồi do mưa rào lớn đêm trước, gây nghiêng 1 biển cảnh báo an toàn.',
        severity: 'nhe',
        correctiveAction: 'Đã gia cố cọc sắt chống biển cảnh báo và thông quang tuyến đi lại. Không có thiệt hại về người và thiết bị.',
        reportFileUrl: 'https://drive.google.com/file/d/BC_SUCO_0610_PDF/view'
      }
    ],
    emergencyDrills: [
      {
        title: 'Diễn tập Phương án Cấp cứu Y tế & Sơ cứu Thương binh tại Công trường RPBM',
        drillDate: '2026-02-15',
        responsePlan: 'Phương án di tản khẩn cấp bằng xe cứu thương dã chiến về Bệnh viện Đa khoa Tỉnh Quảng Trị.',
        participantsCount: 16
      }
    ],
    emergencyContacts: [
      { title: 'Chỉ huy trưởng Công trường', phone: '0983.123.456', unitName: 'Thượng tá Nguyễn Văn Hùng' },
      { title: 'Cán bộ Y tế Công trường', phone: '0912.345.678', unitName: 'Đại úy Lê Văn Nam' },
      { title: 'Ban Chỉ huy Quân sự Huyện Gio Linh', phone: '0233.3825.111', unitName: 'Bộ CHQS Tỉnh Quảng Trị' },
      { title: 'Công an Huyện Gio Linh', phone: '0233.3825.113', unitName: 'Công an Tỉnh Quảng Trị' }
    ],
    nearbyMedicalFacilities: [
      { name: 'Trung tâm Y tế Huyện Gio Linh', address: 'Thị trấn Gio Linh, Huyện Gio Linh, Quảng Trị', distanceKm: 8.5, phone: '0233.3825.222' },
      { name: 'Bệnh viện Đa khoa Tỉnh Quảng Trị', address: '268 Hùng Vương, TP. Đông Hà, Quảng Trị', distanceKm: 22.0, phone: '0233.3852.333' }
    ]
  }
];
