export interface Fine {
  id: string;
  name: string;
  description?: string;
  amountCents: number;
  category: string;
}

export const PREDEFINED_FINES: Fine[] = [
  // غرامات
  {
    id: 'fine_001',
    name: 'حالة اجتماعية',
    description: 'غرامة حالة اجتماعية',
    amountCents: 5000, // 50 جنيه
    category: 'غرامات',
  },
  {
    id: 'fine_002',
    name: 'مهنة',
    description: 'غرامة مهنة',
    amountCents: 5000, // 50 جنيه
    category: 'غرامات',
  },
  {
    id: 'fine_003',
    name: 'انتهاء',
    description: 'غرامة انتهاء',
    amountCents: 5000, // 50 جنيه
    category: 'غرامات',
  },
  {
    id: 'fine_004',
    name: 'محضر فقد',
    description: 'محضر فقد - لا يضيف رسوم إجبارية',
    amountCents: 10000, // 100 جنيه
    category: 'غرامات',
  },
  {
    id: 'fine_005',
    name: 'عنوان',
    description: 'غرامة عنوان',
    amountCents: 5000, // 50 جنيه
    category: 'غرامات',
  },
  {
    id: 'fine_006',
    name: 'تالف',
    description: 'غرامة تالف',
    amountCents: 5000, // 50 جنيه
    category: 'غرامات',
  },
  {
    id: 'fine_007',
    name: 'تأخير',
    description: 'غرامة تأخير',
    amountCents: 5000, // 50 جنيه
    category: 'غرامات',
  },
  // خدمات
  {
    id: 'service_001',
    name: 'مصاريف غرامة',
    description: 'مصاريف غرامة إضافية - تلقائية',
    amountCents: 0, // سيتم حسابها تلقائياً
    category: 'خدمات اضافية',
  },
  {
    id: 'service_002',
    name: 'مصاريف ادارية',
    description: 'مصاريف ادارية - يدوية',
    amountCents: 0, // يدوية
    category: 'خدمات اضافية',
  },
  {
    id: 'service_003',
    name: 'مصاريف اضافية',
    description: 'مصاريف اضافية - يدوية',
    amountCents: 0, // يدوية
    category: 'خدمات اضافية',
  },
  {
    id: 'service_004',
    name: 'خدمات اضافية',
    description: 'خدمات اضافية - يدوية',
    amountCents: 0, // يدوية
    category: 'خدمات اضافية',
  },
];

// Helper functions
export const getFinesByCategory = (category: string): Fine[] => {
  return PREDEFINED_FINES.filter(fine => fine.category === category);
};

export const getFineById = (id: string): Fine | undefined => {
  return PREDEFINED_FINES.find(fine => fine.id === id);
};

export const calculateFinesTotal = (fineIds: string[]): number => {
  return fineIds.reduce((total, fineId) => {
    const fine = getFineById(fineId);
    return total + (fine ? fine.amountCents : 0);
  }, 0);
};

export const shouldAddMandatoryFee = (selectedFines: string[]): boolean => {
  // Add mandatory fee (10 جنيه) if any fine is selected except محضر فقد
  // Check if there are any fines other than محضر فقد
  const otherFines = selectedFines.filter(id => id !== 'fine_004');
  return otherFines.length > 0;
};

export const calculateMandatoryFeeAmount = (selectedFines: string[]): number => {
  // Calculate mandatory fee: 10 جنيه for each fine selected (except محضر فقد)
  const finesCount = selectedFines.filter(id => id !== 'fine_004').length;
  return finesCount * 1000; // 10 جنيه = 1000 سنت per fine
};

export const MANDATORY_FEE_AMOUNT = 1000; // 10 جنيه = 1000 سنت

// Calculate actual fine amounts (for display in مصاريف الغرامات)
export const calculateActualFineAmounts = (selectedFines: string[]): number => {
  // Only count actual fines (not services) and exclude محضر فقد
  const actualFines = selectedFines.filter(id => {
    const fine = PREDEFINED_FINES.find(f => f.id === id);
    return fine?.category === 'غرامات' && id !== 'fine_004';
  });

  return actualFines.reduce((total, fineId) => {
    const fine = getFineById(fineId);
    return total + (fine ? fine.amountCents : 0);
  }, 0);
};

// Calculate automatic fine expenses (10 جنيه per fine except محضر فقد) - hidden from display
export const calculateFineExpenses = (selectedFines: string[]): number => {
  // Only count actual fines (not services) and exclude محضر فقد
  const actualFines = selectedFines.filter(id => {
    const fine = PREDEFINED_FINES.find(f => f.id === id);
    return fine?.category === 'غرامات' && id !== 'fine_004';
  });

  return actualFines.length * 1000; // 10 جنيه = 1000 سنت per fine
};

// Calculate lost report amount (محضر فقد) for services - يضاف في مصاريف اضافية
export const calculateLostReportForServices = (selectedFines: string[]): number => {
  // Check if محضر فقد is selected
  if (selectedFines.includes('fine_004')) {
    const lostReport = getFineById('fine_004');
    return lostReport ? lostReport.amountCents : 0; // 100 جنيه - يضاف في مصاريف اضافية
  }
  return 0;
};
