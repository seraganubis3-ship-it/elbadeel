import { Customer, FormData } from '../../types';

interface CustomerInfoSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;

  // Customer Search
  customer: Customer | null;
  searching: boolean;
  suggestedUser: Customer | null;
  searchResults: Customer[];
  showSearchDropdown: boolean;
  setShowSearchDropdown: (show: boolean) => void;
  searchCustomer: (term: string) => void;
  selectCustomer: (customer: Customer) => void;
  handleUpdateCustomerName: () => void;
  handleNationalIdChange: (id: string) => void;

  // Dependent Search
  searchingDependent: boolean;
  suggestedDependent: { id: string; name: string } | null;
  dependentSearchResults: { id: string; name: string }[];
  showDependentDropdown: boolean;
  setShowDependentDropdown: (show: boolean) => void;
  searchDependent: (term: string) => void;
  selectDependent: (dependent: { id: string; name: string }) => void;
  saveNewDependent: (name: string) => void;

  // Modal Triggers
  showAddressModal: boolean;
  setShowAddressModal: (show: boolean) => void;

  // Suggestion
  suggestion?: string;
  handleKeyDown?: (e: React.KeyboardEvent) => void;
}

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  formData,
  setFormData,
  customer,
  searching,
  suggestedUser,
  searchResults,
  showSearchDropdown,
  setShowSearchDropdown,
  searchCustomer,
  selectCustomer,
  handleUpdateCustomerName,
  handleNationalIdChange,
  searchingDependent,
  suggestedDependent,
  dependentSearchResults,
  showDependentDropdown,
  setShowDependentDropdown,
  searchDependent,
  selectDependent,
  saveNewDependent,
  showAddressModal,
  setShowAddressModal,
  suggestion,
  handleKeyDown,
}) => {
  return (
    <div
      id='customer-info'
      className='bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] group'
    >
      <div className='bg-gradient-to-r from-slate-50/50 to-white/50 border-b border-slate-100/80 p-8 flex items-center gap-5 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2'></div>
        <div className='w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(59,130,246,0.15)] border border-blue-100/50 text-3xl relative z-10 group-hover:scale-110 transition-transform duration-500'>
          👤
        </div>
        <div className='relative z-10'>
          <h2 className='text-2xl font-black text-slate-900 leading-none mb-1.5 tracking-tight'>
            بيانات العميل
          </h2>
          <p className='text-slate-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2'>
            <span className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse'></span>
            البيانات الشخصية والرسمية
          </p>
        </div>
      </div>

      <div className='p-8 space-y-8'>
        {/* Main Search Area */}
        <div className='space-y-3 relative z-10'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            البحث والاستعلام
          </label>
          <div className='relative group/search'>
            <div className='absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl transition-opacity duration-500 opacity-0 group-hover/search:opacity-100'></div>

            {/* Ghost Text Suggestion */}
            {suggestion && (
              <div
                className='absolute inset-x-0 top-0 bottom-0 pr-14 pl-12 py-5 bg-transparent pointer-events-none flex items-center'
                aria-hidden='true'
              >
                <p className='font-bold text-lg text-slate-300 truncate w-full' dir='rtl'>
                  {suggestion}
                </p>
              </div>
            )}

            <input
              type='text'
              value={formData.customerName}
              onChange={e => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, customerName: value }));
                searchCustomer(value);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSearchDropdown(true)}
              className='relative w-full pl-12 pr-14 py-5 bg-white/20 border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm group-hover/search:border-slate-200 z-10'
              placeholder='ابحث بالاسم أو الرقم...'
              autoComplete='off'
            />

            <div className='absolute right-5 top-1/2 -translate-y-1/2 text-slate-400'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>

            {customer && (
              <div className='absolute left-14 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100/50 animate-in zoom-in shadow-sm'>
                <span className='w-1.5 h-1.5 bg-blue-500 rounded-full'></span>
                <span className='text-[10px] font-black tracking-wide'>عميل مسجل</span>
                <svg className='w-3.5 h-3.5' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
            )}

            <div className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-300'>
              {searching ? (
                <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <div className='w-1.5 h-1.5 bg-slate-200 rounded-full'></div>
              )}
            </div>

            {/* Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className='absolute top-full left-0 right-0 mt-4 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2'>
                <div className='max-h-[350px] overflow-y-auto p-2'>
                  {searchResults.map(result => (
                    <div
                      key={result.id}
                      onClick={() => selectCustomer(result)}
                      className='p-4 hover:bg-slate-50 rounded-xl cursor-pointer transition-all hover:scale-[0.99] group/item border border-transparent hover:border-slate-100'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg group-hover/item:bg-blue-50 group-hover/item:text-blue-500 transition-colors'>
                          👤
                        </div>
                        <div>
                          <div className='font-bold text-slate-900 text-sm group-hover/item:text-blue-700 transition-colors'>
                            {result.name}
                          </div>
                          <div className='text-[10px] text-slate-400 mt-1 flex items-center gap-3 font-semibold'>
                            <span className='flex items-center gap-1'>
                              <span className='text-slate-300'>📞</span> {result.phone}
                            </span>
                            {result.governorate && (
                              <span className='flex items-center gap-1'>
                                <span className='text-slate-300'>📍</span> {result.governorate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Fields */}
        <div className='space-y-6'>
          <div className='flex items-center gap-3 pb-2 border-b border-slate-100'>
            <span className='text-xs font-black text-slate-400 uppercase tracking-widest'>
              المعلومات الأساسية
            </span>
            <div className='h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent'></div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                الرقم القومي
              </label>
              <div className='relative group/input'>
                <input
                  type='text'
                  value={formData.idNumber}
                  onChange={e => handleNationalIdChange(e.target.value)}
                  maxLength={14}
                  className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-mono font-bold tracking-widest text-slate-700 shadow-sm group-hover/input:bg-slate-50'
                  placeholder='--- --- --- -----'
                />
                <div className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-mono'>
                  14 رقم
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80 flex items-center justify-between'>
                <span>رقم الهاتف</span>
                <span className='text-[9px] text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md font-black'>
                  مطلوب
                </span>
              </label>
              <input
                type='tel'
                value={formData.customerPhone}
                onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='01xxxxxxxxx'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                تاريخ الميلاد
              </label>
              <input
                type='text'
                value={formData.birthDate}
                onChange={e => {
                  let v = e.target.value.replace(/\s/g, '/');
                  if (v.length === 2 || v.length === 5) v += '/';
                  setFormData(prev => ({ ...prev, birthDate: v }));
                }}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='DD / MM / YYYY'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                العمر الحالي
              </label>
              <div className='relative'>
                <input
                  type='number'
                  value={formData.age}
                  readOnly
                  className='w-full px-5 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-500 font-bold cursor-not-allowed text-center'
                />
                <span className='absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400'>
                  سنة
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className='space-y-6 pt-2'>
          <div className='flex items-center gap-3 pb-2 border-b border-slate-100'>
            <span className='text-xs font-black text-slate-400 uppercase tracking-widest'>
              بيانات العائلة والعمل
            </span>
            <div className='h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent'></div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                اسم الأم
              </label>
              <input
                type='text'
                value={formData.motherName}
                onChange={e => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='اسم الوالدة ثلاثي'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                المهنة / الوظيفة
              </label>
              <input
                type='text'
                value={formData.profession}
                onChange={e => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='اكتب المهنة هنا...'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                الجنسية
              </label>
              <input
                type='text'
                value={formData.nationality}
                onChange={e => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='مصر'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                اسم الأب <span className='text-[9px] font-normal opacity-50'>(اختياري)</span>
              </label>
              <input
                type='text'
                value={formData.fatherName}
                onChange={e => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='اسم الوالد'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 pt-2'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                اسم الزوج / الزوجة
              </label>
              <input
                type='text'
                value={formData.wifeName}
                onChange={e => setFormData(prev => ({ ...prev, wifeName: e.target.value }))}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='اسم الزوج / الزوجة'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                والدة الزوج / الزوجة
              </label>
              <input
                type='text'
                value={formData.wifeMotherName}
                onChange={e => setFormData(prev => ({ ...prev, wifeMotherName: e.target.value }))}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='اسم والدة الزوج / الزوجة'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                تاريخ الزواج
              </label>
              <input
                type='text'
                value={formData.marriageDate}
                onChange={e => {
                  let v = e.target.value.replace(/\s/g, '/');
                  if (v.length === 2 || v.length === 5) v += '/';
                  setFormData(prev => ({ ...prev, marriageDate: v }));
                }}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='DD / MM / YYYY'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                تاريخ الطلاق
              </label>
              <input
                type='text'
                value={formData.divorceDate}
                onChange={e => {
                  let v = e.target.value.replace(/\s/g, '/');
                  if (v.length === 2 || v.length === 5) v += '/';
                  setFormData(prev => ({ ...prev, divorceDate: v }));
                }}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='DD / MM / YYYY'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                تاريخ الوفاة
              </label>
              <input
                type='text'
                value={formData.deathDate}
                onChange={e => {
                  let v = e.target.value.replace(/\s/g, '/');
                  if (v.length === 2 || v.length === 5) v += '/';
                  setFormData(prev => ({ ...prev, deathDate: v }));
                }}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                placeholder='DD / MM / YYYY'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 pt-2'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                العنوان التفصيلي
              </label>
              <button
                type='button'
                onClick={() => setShowAddressModal(true)}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/30 transition-all text-right font-bold text-slate-700 flex justify-between items-center group/btn'
              >
                <div className='flex items-center gap-3 overflow-hidden'>
                  <div className='w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm group-hover/btn:bg-blue-200 group-hover/btn:text-blue-700 transition-colors'>
                    📍
                  </div>
                  <span className='truncate text-sm opacity-80 group-hover/btn:opacity-100 transition-opacity'>
                    {formData.governorate
                      ? `${formData.governorate}, ${formData.city}`
                      : 'اضغط لتحديد العنوان...'}
                  </span>
                </div>
                <span className='text-[10px] font-black text-blue-500 bg-blue-100 px-2 py-1 rounded-lg group-hover/btn:bg-blue-500 group-hover/btn:text-white transition-all'>
                  تعديل
                </span>
              </button>
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                تابع لعميل آخر؟
              </label>
              <div className='relative group/dependent'>
                <input
                  type='text'
                  value={formData.customerFollowUp}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, customerFollowUp: e.target.value }));
                    searchDependent(e.target.value);
                  }}
                  className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm'
                  placeholder='ابحث عن العميل الأساسي...'
                />
                {showDependentDropdown && dependentSearchResults.length > 0 && (
                  <div className='absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-[100] max-h-40 overflow-y-auto font-bold text-sm p-1'>
                    {dependentSearchResults.map(d => (
                      <div
                        key={d.id}
                        onClick={() => selectDependent(d)}
                        className='p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-700'
                      >
                        {d.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
