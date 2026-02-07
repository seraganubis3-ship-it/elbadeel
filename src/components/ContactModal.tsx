'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: any;
}

export default function ContactModal({ isOpen, onClose, settings }: ContactModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4'
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className='bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative'
            >
              {/* Header */}
              <div className='bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center relative overflow-hidden'>
                <button
                  onClick={onClose}
                  className='absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
                <div className='relative z-10'>
                  <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30'>
                    <Phone className='w-8 h-8 text-white' />
                  </div>
                  <h2 className='text-3xl font-black text-white mb-2'>تواصل معنا</h2>
                  <p className='text-emerald-100 font-medium'>
                    فريق خدمة العملاء جاهز للرد على استفساراتك
                  </p>
                </div>
                {/* Decorative Circles */}
                <div className='absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-10 -translate-y-10'></div>
                <div className='absolute bottom-0 right-0 w-32 h-32 bg-teal-500/30 rounded-full blur-2xl translate-x-10 translate-y-10'></div>
              </div>

              {/* Content */}
              <div className='p-8 space-y-6'>
                {/* Hotlines */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-black text-slate-400 uppercase tracking-widest'>
                    أرقام التواصل
                  </h3>
                  <div className='grid gap-4'>
                    <a
                      href={`tel:${settings?.contactPhone || '01021606893'}`}
                      className='flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group'
                    >
                      <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform'>
                        <Phone className='w-5 h-5' />
                      </div>
                      <div>
                        <div className='font-black text-slate-800 text-lg'>{settings?.contactPhone || '01021606893'}</div>
                        <div className='text-xs text-slate-500 font-bold'>الخط الساخن 1</div>
                      </div>
                    </a>
                    
                    {settings?.additionalPhone && (
                      <a
                        href={`tel:${settings.additionalPhone}`}
                        className='flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group'
                      >
                        <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform'>
                          <Phone className='w-5 h-5' />
                        </div>
                        <div>
                          <div className='font-black text-slate-800 text-lg'>{settings.additionalPhone}</div>
                          <div className='text-xs text-slate-500 font-bold'>الخط الساخن 2</div>
                        </div>
                      </a>
                    )}

                    <a
                      href={`https://wa.me/${settings?.whatsappPhone?.replace(/^0/, '2') || '201021606893'}`}
                      target='_blank'
                      rel='noreferrer'
                      className='flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all group'
                    >
                      <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-500 group-hover:scale-110 transition-transform'>
                        <MessageCircle className='w-5 h-5' />
                      </div>
                      <div>
                        <div className='font-black text-slate-800 text-lg'>{settings?.whatsappPhone || '01021606893'}</div>
                        <div className='text-xs text-slate-500 font-bold'>واتساب 1</div>
                      </div>
                    </a>
                    
                    {settings?.secondaryWhatsappPhone && (
                      <a
                        href={`https://wa.me/${settings.secondaryWhatsappPhone.replace(/^0/, '2')}`}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all group'
                      >
                        <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-500 group-hover:scale-110 transition-transform'>
                          <MessageCircle className='w-5 h-5' />
                        </div>
                        <div>
                          <div className='font-black text-slate-800 text-lg'>{settings.secondaryWhatsappPhone}</div>
                          <div className='text-xs text-slate-500 font-bold'>واتساب 2</div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-4 bg-amber-50 rounded-2xl border border-amber-100'>
                    <div className='flex items-center gap-2 mb-2 text-amber-600'>
                      <Clock className='w-5 h-5' />
                      <span className='font-black text-sm'>مواعيد العمل</span>
                    </div>
                    <p className='text-sm text-slate-700 font-bold leading-relaxed'>
                      يومياً من 9 ص - 10 م
                      <br />
                      ماعدا الجمعة
                    </p>
                  </div>
                  <div className='p-4 bg-blue-50 rounded-2xl border border-blue-100'>
                    <div className='flex items-center gap-2 mb-2 text-blue-600'>
                      <MapPin className='w-5 h-5' />
                      <span className='font-black text-sm'>العنوان</span>
                    </div>
                    <p className='text-sm text-slate-700 font-bold leading-relaxed'>
                      {settings?.address || 'فيصل، الجيزة'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className='p-6 bg-slate-50 border-t border-slate-100 text-center'>
                <p className='text-xs text-slate-400 font-bold'>
                  نسعد دائماً بخدمتكم في منصة البديل
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
