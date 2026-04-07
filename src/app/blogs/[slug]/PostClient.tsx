'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Eye, ArrowRight, ChevronLeft, Share2, Clock, Bookmark } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function PostClient({ post, relatedPosts }: { post: any, relatedPosts: any[] }) {
  useEffect(() => {
    // Increment view count via public API
    fetch(`/api/blogs/posts/${post.id}/views`, { method: 'POST' }).catch(() => {});
  }, [post.id]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden enlarge-text" dir="rtl">
      <Navigation />
      
      <main className="flex-grow pt-20 pb-20 relative">
        {/* Exact Home Page Background Replication */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
          <NextImage
            src="/images/government-services-bg.jpg"
            alt="Background"
            fill
            className="object-cover object-center scale-110"
            priority
            quality={60}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-teal-900/80 to-emerald-950/90"></div>
        </div>

        {/* Post Hero Section */}
        <section className="relative py-16 md:py-24 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <span className="px-6 py-2 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-sm font-black uppercase tracking-widest backdrop-blur-md">
                  مقال تقني
                </span>
                <div className="flex items-center gap-2 text-white/90 text-lg font-bold">
                  <Calendar size={20} className="text-emerald-400" />
                  <span>{new Date(post.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <h1 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[1.2] tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                {post.title}
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Post Content Area */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-30">
          <div className="flex flex-col gap-10">
            
            {/* Main Content Card - High Contrast & Large Text */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/20 p-10 md:p-20 text-right min-h-[60vh]"
            >
              {/* Post Breadcrumb */}
              <nav className="flex items-center text-sm font-black text-slate-500 mb-12 uppercase tracking-widest gap-3 flex-row-reverse justify-center md:justify-start">
                <Link href="/" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
                <ChevronLeft size={16} className="rotate-180" />
                <Link href="/blogs" className="hover:text-emerald-600 transition-colors">المدونة</Link>
                <ChevronLeft size={16} className="rotate-180" />
                <span className="text-emerald-600 truncate max-w-[300px]">{post.title}</span>
              </nav>

              <div 
                className="prose prose-2xl md:prose-3xl prose-slate max-w-4xl mx-auto text-slate-900 leading-[1.8] text-right font-medium
                prose-p:mb-8
                prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight prose-headings:mb-8
                prose-a:text-emerald-600 prose-a:font-black prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-12
                prose-blockquote:border-r-8 prose-blockquote:border-emerald-600 prose-blockquote:bg-emerald-50/50 prose-blockquote:py-8 prose-blockquote:px-12 prose-blockquote:rounded-l-3xl prose-blockquote:not-italic prose-blockquote:text-slate-900 prose-blockquote:font-bold"
                style={{ fontFamily: "inherit" }}
                dir="rtl"
              >
                {post.content.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </ReactMarkdown>
                )}
              </div>

              {/* Tags Section */}
              {post.tags?.length > 0 && (
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap items-center gap-4 flex-row-reverse">
                  <span className="text-slate-900 font-black text-sm ml-2">مواضيع تهمك:</span>
                  {post.tags.map((tag: any) => (
                    <span key={tag.id} className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-2xl text-sm font-bold border border-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-default">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Share & Actions Banner */}
              <div className="mt-16 bg-slate-50 rounded-3xl p-8 flex flex-col sm:flex-row-reverse items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-row-reverse text-right">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
                    <Share2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">شارك هذا المقال</h4>
                    <p className="text-slate-500 text-sm">ساعد الآخرين في الوصول للمعلومة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                    <Bookmark size={20} />
                    حفظ
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                  >
                    نسخ الرابط
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Sticky Sidebar (Desktop Only) */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-28 space-y-8">
                {/* Contact CTA */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-900/20 text-right">
                  <h3 className="text-2xl font-black mb-4">تحتاج خدمة حكومية؟</h3>
                  <p className="text-blue-100 mb-8 leading-relaxed">فريق البديل جاهز لمساعدتك في استخراج كافة أوراقك الرسمية بسرعة وأمان.</p>
                  <Link href="/services" className="block w-full py-4 bg-white text-blue-600 text-center font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg">
                    اطلب خدمتك الآن
                  </Link>
                </div>

                {/* Quick Info Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm text-right">
                  <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg flex-row-reverse">
                    <Eye size={20} className="text-blue-600" />
                    إحصائيات المقال
                  </h4>
                  <div className="space-y-4 text-sm text-slate-500">
                    <div className="flex justify-between items-center py-3 border-b border-slate-50 flex-row-reverse">
                      <span>عدد المشاهدات</span>
                      <span className="font-bold text-slate-900">{post.views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50 flex-row-reverse">
                      <span>وقت النشر</span>
                      <span className="font-bold text-slate-900">{new Date(post.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto px-4 max-w-5xl mt-24">
            <div className="flex items-center gap-4 mb-12 flex-row-reverse">
              <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">مقالات قد تهمك</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related: any) => (
                <Link href={`/blogs/${related.slug}`} key={related.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full text-right">
                  <div className="h-48 relative overflow-hidden">
                    {related.coverImage ? (
                      <NextImage 
                        src={related.coverImage} 
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <NextImage src="/logo.png" alt="Logo" width={80} height={80} className="opacity-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <h4 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-4 leading-snug">
                      {related.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-auto text-xs font-bold text-slate-400 uppercase flex-row-reverse">
                      <Calendar size={14} />
                      {new Date(related.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
