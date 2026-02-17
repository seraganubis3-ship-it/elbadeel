import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  editable?: boolean;
  type?: 'text' | 'number';
}

interface Section {
  title: string;
  columns: Column[];
  data: any[];
  defaultRowData?: any;
}

interface EditReportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any[] | any, reportDate?: string) => void;
  initialData?: any[] | undefined; // Legacy
  columns?: Column[] | undefined; // Legacy
  sections?: Section[] | undefined; // New multi-section support
  title: string;
  initialReportDate?: string | undefined;
}

export default function EditReportDataModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  columns,
  sections,
  title,
  initialReportDate,
}: EditReportDataModalProps) {
  // We store data as a flat array of sections, or a single section if legacy
  const [reportSections, setReportSections] = useState<Section[]>([]);
  const [reportDate, setReportDate] = useState(initialReportDate || '');

  useEffect(() => {
    if (isOpen) {
      setReportDate(initialReportDate || '');
      if (sections && sections.length > 0) {
        setReportSections(sections);
      } else if (initialData && columns) {
        // Fallback for legacy usage
        setReportSections([{ title: '', columns, data: initialData }]);
      }
    }
  }, [isOpen, initialData, columns, sections, initialReportDate]);

  const handleChange = (sectionIndex: number, rowIndex: number, key: string, value: any) => {
    const newSections = [...reportSections];
    const section = newSections[sectionIndex];
    if (!section) return;

    const newData = [...section.data];
    newData[rowIndex] = { ...newData[rowIndex], [key]: value };

    newSections[sectionIndex] = { ...section, data: newData };
    setReportSections(newSections);
  };

  const handleDelete = (sectionIndex: number, rowIndex: number) => {
    const newSections = [...reportSections];
    const section = newSections[sectionIndex];
    if (!section) return;

    const newData = section.data.filter((_, i) => i !== rowIndex);
    newSections[sectionIndex] = { ...section, data: newData };
    setReportSections(newSections);
  };

  const handleAddRow = (sectionIndex: number) => {
    const newSections = [...reportSections];
    const originalSection = newSections[sectionIndex];
    if (!originalSection) return;

    const section = { ...originalSection }; // Shallow copy section
    const newData = [...section.data]; // Shallow copy data array
    const newRow: any = { ...(section.defaultRowData || {}) };

    // Initialize other columns
    section.columns.forEach(col => {
      // Only set if not already present in defaultRowData to avoid overwriting
      if (newRow[col.key] === undefined) {
        newRow[col.key] = col.type === 'number' ? 1 : '';
      }
    });

    newData.push(newRow);
    section.data = newData;
    newSections[sectionIndex] = section;
    setReportSections(newSections);
  };

  const formatDateInput = (value: string) => {
    // Remove non-numeric characters
    const digits = value.replace(/\D/g, '');
    let formatted = digits;

    if (digits.length > 2) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    if (digits.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }

    return formatted.slice(0, 10);
  };

  const handleConfirm = () => {
    // Prepend day name automatically if it's just a date
    let finalReportDate = reportDate;
    if (reportDate && reportDate.includes('/') && !reportDate.includes('-')) {
      try {
        const [day, month, year] = reportDate.split('/').map(Number);
        if (day && month && year && year > 1000) {
          const dateObj = new Date(year, month - 1, day);
          if (!isNaN(dateObj.getTime())) {
            const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
            const dayName = dateObj.toLocaleDateString('ar-EG', options);
            finalReportDate = `${dayName} - ${reportDate}`;
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    if (sections && sections.length > 0) {
      // Return grouped data structure if input was sections
      // Or flatten it? The parent expects flat data usually, BUT
      // printReport expects a list of orders.
      // Let's return the FLATTENED list of all rows from all sections.
      const allRows = reportSections.flatMap(s => s.data);
      onConfirm(allRows, finalReportDate);
    } else {
      // Legacy behavior
      onConfirm(reportSections[0]?.data || [], finalReportDate);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-6xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
            <div className='flex items-center gap-2 mt-1'>
              <span className='text-sm font-bold text-gray-500'>تاريخ الكشف:</span>
              <input
                type='text'
                value={reportDate}
                onChange={e => setReportDate(formatDateInput(e.target.value))}
                placeholder='17/02/2026'
                className='text-sm font-black text-blue-600 border-none bg-blue-50/50 rounded-md px-2 py-0.5 focus:ring-1 focus:ring-blue-300 outline-none w-32'
              />
            </div>
          </div>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-500 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-hidden flex flex-col flex-1 bg-gray-50/50'>
          <div className='flex-1 overflow-y-auto pr-2'>
            {reportSections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className='mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100'
              >
                {section.title && (
                  <h4 className='text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2'>
                    <span className='w-2 h-6 bg-blue-500 rounded-full inline-block'></span>
                    {section.title}
                  </h4>
                )}

                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='py-3.5 pl-4 pr-3 text-right text-sm font-bold text-gray-900 sm:pr-6 w-12'
                        >
                          #
                        </th>
                        {section.columns.map(col => (
                          <th
                            key={col.key}
                            scope='col'
                            className='px-3 py-3.5 text-right text-sm font-bold text-gray-700 whitespace-nowrap'
                          >
                            {col.label}
                          </th>
                        ))}
                        <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6 w-10'>
                          <span className='sr-only'>حذف</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 bg-white'>
                      {section.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className='hover:bg-gray-50/50 transition-colors'>
                          <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pr-6'>
                            {rowIndex + 1}
                          </td>
                          {section.columns.map(col => (
                            <td
                              key={`${rowIndex}-${col.key}`}
                              className='whitespace-nowrap px-2 py-2 text-sm text-gray-500 relative min-w-[150px]'
                            >
                              {col.editable !== false ? (
                                <input
                                  type={col.type || 'text'}
                                  value={row[col.key] ?? ''}
                                  onChange={e =>
                                    handleChange(sectionIndex, rowIndex, col.key, e.target.value)
                                  }
                                  className='block w-full rounded-lg border-gray-200 py-1.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm sm:leading-6 px-3 text-right shadow-sm'
                                />
                              ) : (
                                <span>{row[col.key]}</span>
                              )}
                            </td>
                          ))}
                          <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-left text-sm font-medium sm:pr-6'>
                            <button
                              type='button'
                              className='text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50'
                              onClick={() => handleDelete(sectionIndex, rowIndex)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className='mt-4 flex'>
                  <button
                    type='button'
                    onClick={() => handleAddRow(sectionIndex)}
                    className='inline-flex items-center gap-x-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 transition-colors'
                  >
                    <Plus className='h-4 w-4' aria-hidden='true' />
                    إضافة صف جديد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t bg-white rounded-b-2xl flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20'>
          <button
            type='button'
            className='flex-1 justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition-all hover:shadow-blue-200 active:scale-[0.98]'
            onClick={handleConfirm}
          >
            تأكيد وطباعة
          </button>
          <button
            type='button'
            className='flex-1 justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all hover:text-gray-900 border-b-2 border-gray-200 active:border-b-0 active:translate-y-[2px]'
            onClick={onClose}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
