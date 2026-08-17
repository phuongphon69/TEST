import { ProjectMilestone, ProjectDossierItem, Project, ProjectFinancialInstallment } from '../types';

export const STANDARD_MILESTONE_NAMES = [
  'Khảo sát hiện trường',
  'Lập phương án kỹ thuật',
  'Phê duyệt phương án',
  'Bàn giao mặt bằng',
  'Huy động nhân lực và thiết bị',
  'Thi công dò tìm',
  'Đào kiểm tra tín hiệu',
  'Xử lý vật nổ',
  'Nghiệm thu nội bộ',
  'Nghiệm thu giai đoạn',
  'Nghiệm thu hoàn thành',
  'Bàn giao mặt bằng đất sạch',
  'Hoàn thiện hồ sơ',
  'Thanh toán',
  'Quyết toán'
];

export const STANDARD_DOSSIER_CATEGORIES = [
  'Quyết định phê duyệt dự án.',
  'Quyết định giao nhiệm vụ của BQP hoặc BTL.',
  'Hồ sơ khảo sát.',
  'Phương án KTTC - Dự toán.',
  'Kết quả thông báo thẩm định.',
  'HSĐX, nếu có.',
  'Quyết định phê duyệt PAKT-DT.',
  'Quyết định chỉ định thầu.',
  'Thương thảo HĐ.',
  'Hợp đồng.',
  'Phụ lục hợp đồng.',
  'Hồ sơ hoàn công.',
  'Hồ sơ thanh - quyết toán.'
];

export function generateDefaultMilestones(startDate: string, endDate: string, commanderName: string): ProjectMilestone[] {
  const start = new Date(startDate || Date.now());
  const end = new Date(endDate || Date.now() + 180 * 24 * 3600 * 1000);
  const totalDays = Math.max(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const daysPerStep = Math.floor(totalDays / STANDARD_MILESTONE_NAMES.length);

  return STANDARD_MILESTONE_NAMES.map((name, index) => {
    const stepStart = new Date(start.getTime() + index * daysPerStep * 24 * 3600 * 1000);
    const stepEnd = new Date(stepStart.getTime() + Math.max(3, daysPerStep - 1) * 24 * 3600 * 1000);

    const isPast = stepEnd < new Date();
    const isCurrent = stepStart <= new Date() && stepEnd >= new Date();

    return {
      id: `ms-${index + 1}`,
      name,
      planStartDate: stepStart.toISOString().split('T')[0],
      planEndDate: stepEnd.toISOString().split('T')[0],
      actualStartDate: isPast || isCurrent ? stepStart.toISOString().split('T')[0] : undefined,
      actualEndDate: isPast ? stepEnd.toISOString().split('T')[0] : undefined,
      inCharge: commanderName || 'Chỉ huy trưởng công trường',
      progressPercent: isPast ? 100 : isCurrent ? 50 : 0,
      plannedQuantity: index === 5 ? '100% diện tích' : index === 6 ? '100% tín hiệu' : '1.0',
      actualQuantity: isPast ? (index === 5 ? '100% diện tích' : '1.0') : isCurrent ? '50%' : '0',
      delayReason: '',
      correctiveAction: ''
    };
  });
}

export function generateDefaultDossiers(projectCode: string, isCompleted: boolean = false): ProjectDossierItem[] {
  return STANDARD_DOSSIER_CATEGORIES.map((cat, index) => {
    let status: ProjectDossierItem['status'] = 'chua_co';
    if (isCompleted) {
      status = 'da_co';
    } else {
      if (index < 4) status = 'da_co';
      else if (index < 8) status = 'dang_bo_sung';
      else status = 'chua_co';
    }

    return {
      id: `dos-${index + 1}`,
      category: cat,
      status,
      documentCode: `${index + 1 > 9 ? index + 1 : '0' + (index + 1)}/${projectCode || 'HS'}`,
      issueDate: '2026-03-15',
      note: isCompleted ? 'Đã nghiệm thu đầy đủ' : 'Theo dõi theo quy định',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Ban Quản lý Dự án'
    };
  });
}

export function ensureProjectDefaults(project: Partial<Project>): Project {
  const p = { ...project } as Project;
  if (!p.milestones || p.milestones.length === 0) {
    p.milestones = generateDefaultMilestones(p.startDate, p.endDate, p.commanderName);
  }
  if (!p.dossiers || p.dossiers.length === 0) {
    p.dossiers = generateDefaultDossiers(p.code, p.status === 'hoan_thanh' || p.status === 'da_hoan_thanh');
  }

  const contractVal = p.contractValue || p.budgetVnd || 0;
  if (p.contractValue === undefined) p.contractValue = contractVal;
  if (p.totalInvestment === undefined) p.totalInvestment = Math.round(contractVal * 1.15);
  if (p.rpbmValue === undefined) p.rpbmValue = Math.round(contractVal * 0.85);

  if (p.advancePaid === undefined) p.advancePaid = Math.round(contractVal * 0.3);
  if (p.executedValue === undefined) p.executedValue = Math.round((contractVal * (p.progressPercent || 0)) / 100);
  if (p.acceptedValue === undefined) p.acceptedValue = Math.round((contractVal * (p.progressPercent || 0) * 0.95) / 100);
  if (p.paidValue === undefined) p.paidValue = p.advancePaid;
  if (p.requestedPaymentValue === undefined) p.requestedPaymentValue = Math.max(0, p.acceptedValue - p.paidValue);
  if (p.remainingValue === undefined) p.remainingValue = Math.max(0, contractVal - p.paidValue);
  if (p.disbursementRate === undefined) {
    p.disbursementRate = contractVal > 0 ? Math.round((p.paidValue / contractVal) * 100) : 0;
  }
  if (p.debt === undefined) p.debt = Math.max(0, p.acceptedValue - p.paidValue);
  if (p.warrantyPeriod === undefined) p.warrantyPeriod = '12 tháng kể từ ngày ký bàn giao mặt bằng';

  if (!p.financialInstallments || p.financialInstallments.length === 0) {
    p.financialInstallments = [
      {
        id: 'inst-1',
        installmentName: 'Tạm ứng hợp đồng (30%)',
        type: 'tam_ung',
        amount: p.advancePaid,
        date: p.contractSigningDate || p.startDate,
        documentRef: `Phụ lục TƯ/${p.contractNumber || p.code}`,
        status: 'da_thuc_hien',
        notes: 'Đã tạm ứng theo quy định hợp đồng'
      },
      {
        id: 'inst-2',
        installmentName: 'Nghiệm thu khối lượng Đợt 1 (50% diện tích)',
        type: 'nghiem_thu',
        amount: Math.round(contractVal * 0.45),
        date: '2026-05-20',
        documentRef: `Biên bản NT01/${p.code}`,
        status: 'da_thuc_hien',
        notes: 'Nghiệm thu giai đoạn thi công 1'
      }
    ];
  }

  return p;
}
