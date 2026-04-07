'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Calendar, Search, Clock, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';

export default function BlogsClient({ 
  initialPosts, 
  initialTotal, 
  currentPage 
}: { 
  initialPosts: any[], 
  initialTotal: number, 
  currentPage: number 
}) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(initialTotal);
  
  const limit = 9;

  useEffect(() => {
    // Only fetch if it's not the initial load or if searchTerm changed
    if (searchTerm !== '') {
      const fetchPosts = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/blogs?page=${currentPage}&limit=${limit}&search=${searchTerm}`);
          const data = await res.json();
          setPosts(data.posts || []);
          setTotal(data.total || 0);
        } catch (error) {
          console.error('Failed to fetch posts:', error);
        } finally {
          setLoading(false);
        }
      };
      const delayDebounceFn = setTimeout(() => {
        fetchPosts();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
       setPosts(initialPosts);
       setTotal(initialTotal);
    }
  }, [currentPage, searchTerm, initialPosts, initialTotal]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden enlarge-text" dir="rtl">
      <Navigation />
      
      <main className="flex-grow pt-20 relative">
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

        {/* Hero Section */}
        <section className="relative py-24 md:py-36 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-sm font-black mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                مرحباً بك في مدونة البديل
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                اكتشف <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300">عالم الخدمات</span> الحكومية ببساطة
              </h1>
              <p className="text-2xl text-emerald-50/80 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
                دليلك الشامل لاستخراج الأوراق الرسمية، متابعة القوانين الجديدة، ونصائح الخبراء لتسهيل معاملاتك في مصر.
              </p>

              {/* Advanced Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-emerald-300/50">
                  <Search size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder="ابحث عن مقال معين..."
                  className="w-full h-20 pr-16 pl-8 bg-white/10 border border-white/20 rounded-[2rem] text-white placeholder-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-xl transition-all text-xl text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Posts Grid Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white/90 rounded-[3rem] h-[550px] animate-pulse border border-white/20 shadow-xl"></div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/20 p-20 text-center max-w-2xl mx-auto"
              >
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
                  <Search size={40} className="opacity-50" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">لم نجد أي مقالات</h3>
                <p className="text-slate-500 text-xl font-medium">جرب البحث بكلمات مختلفة أو عد لاحقاً.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link 
                      href={`/blogs/${post.slug}`} 
                      className="group flex flex-col bg-white rounded-[3rem] shadow-2xl hover:shadow-emerald-600/20 hover:-translate-y-4 transition-all duration-500 border border-slate-100 overflow-hidden h-full text-right"
                    >
                      <div className="relative h-72 w-full overflow-hidden">
                        {post.coverImage ? (
                          <NextImage 
                            src={post.coverImage} 
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition duration-1000 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-200">
                            <NextImage src="/logo.png" alt="Logo" width={120} height={120} className="opacity-10" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6">
                            <span className="px-5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md text-emerald-600 text-sm font-black shadow-lg flex items-center gap-2">
                                <Clock size={16} />
                                {Math.ceil(post.content.length / 500)} دقائق قراءة
                            </span>
                        </div>
                      </div>
                      
                      <div className="p-10 md:p-12 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-8 text-sm font-black text-emerald-600 tracking-wider uppercase flex-row-reverse">
                          <Calendar size={18} />
                          <span>{new Date(post.createdAt).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        
                        <h2 className="text-3xl font-black text-slate-900 mb-6 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-[1.3] tracking-tight">
                          {post.title}
                        </h2>
                        
                        <p className="text-slate-500 text-xl font-medium mb-10 line-clamp-3 flex-grow leading-relaxed">
                          {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').substring(0, 180)}
                        </p>
                        
                        <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-[-8px] transition-transform flex-row-reverse w-fit ml-auto gap-2">
                          <ArrowRight size={20} />
                          <span>اقرأ المزيد</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination with Premium Style */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-24 gap-4">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Link
                    key={i}
                    href={`/blogs?page=${i + 1}`}
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 shadow-sm ${
                      currentPage === i + 1 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-blue-400'
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter/CTO Section */}
        <section className="py-20 bg-white border-t border-slate-100 mt-20 text-center">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">كن أول من يعرف بالقوانين الجديدة</h2>
            <p className="text-slate-600 mb-8 text-lg">اشترك بالنشرة البريدية ليصلك كل جديد عن الخدمات الحكومية والمدونة.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input type="email" placeholder="البريد الإلكتروني" className="flex-grow h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-right" dir="rtl" />
              <button className="h-14 px-10 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">اشترك الآن</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
