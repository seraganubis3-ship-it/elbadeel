if (!self.define) {
  let e,
    c = {};
  const s = (s, d) => (
    (s = new URL(s + '.js', d).href),
    c[s] ||
      new Promise(c => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = c), document.head.appendChild(e));
        } else ((e = s), importScripts(s), c());
      }).then(() => {
        let e = c[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (d, a) => {
    const i = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (c[i]) return;
    let r = {};
    const n = e => s(e, i),
      f = { module: { uri: i }, exports: r, require: n };
    c[i] = Promise.all(d.map(e => f[e] || n(e))).then(e => (a(...e), r));
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  (importScripts('/custom-sw.js'),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '1316a3cae8c88f08af3469edbdae0ef6' },
        {
          url: '/_next/static/chunks/2117-677cefb8ccb8bfec.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/29-59ef53f19f015cfe.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/2972-628063040b4b9db6.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/41ade5dc-01a393d16d1db2f1.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/562-0a8657b72deaf799.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/5878-9d9a1168dbd7a09c.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/5886-9143f50dc63e4c22.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/605-9f85376e9e357e7f.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/615-74310719b4689a09.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/7353-c13337ed0369ce5b.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/7634-e6888cd9c252b2f1.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/7694-3a955f97528da247.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/8685-5ca6dd2d11f99894.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/9064-b9093ff2f34fb975.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/9861-5d0e8c0fcce850ce.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-db988a7b0f51fb0a.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/about/page-4649ac0b00b3896c.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/analytics/page-7ea0c43f2e469f9f.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/categories/page-9a0455797b459e1a.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/collective-receipt/page-e7386367ac177490.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/create/page-d80bc89aab2a63fe.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/delegates/page-8fc2a17f684c2a15.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/faqs/page-075f18da5fd93b12.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/images/page-baf71033eff95711.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/inventory/page-6fd55578d07591f4.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/layout-6ffcce2c5db61354.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/login/page-c3e622aee77293bd.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/%5Bid%5D/page-c6a6a67c34e3a563.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/%5Bid%5D/receipt/page-748c8cc31b7ffecc.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/page-151daf58569be437.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/print-family-report/page-4cadae457fb243d3.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/print-id-card-signatures-report/page-1a87263802c17edb.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/print-official-documents-signature-report/page-70f4e3742b814031.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/print-phone-report/page-8cee949fed5a75d6.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/orders/print-translation-report/page-3271940c3de609d5.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/page-acb0dcb0d287313b.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/print/passport-authorization/page-83c6d2f083b55093.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/print/work-permit-authorization/page-5a3907fddf8ce28b.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/promo-codes/page-f8ac268f0d2b3abf.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/reports/page-9da5050feb534b93.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/roles/page-00e4de9dbc5ca9da.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/services/create/page-afe2515c5edd77be.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/services/edit/%5Bid%5D/page-57fb2a35caf54cd6.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/services/page-aa4bf0f4c3d272f3.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/settings/page-6fe7cd08ee5ebdbb.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/users/create/page-c7f9a6b79138423d.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/users/page-14f1ee5a451afe34.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/whatsapp/page-49ea74e38fc4be76.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/work-orders/%5Bid%5D/page-f25c903cb5e4fb05.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/work-orders/%5Bid%5D/print/page-efb6949e62b2cdb9.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/admin/work-orders/page-8cc57905dcfae8f0.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/category/%5Bslug%5D/page-d62661e3a4fec719.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/error-c82ecd92ae2929e9.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/faq/page-066d82376660c3d8.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/forgot-password/page-5ec8ac9d9764c196.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/global-error-99b488007fcd99b4.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/layout-02f8bc2659cf2fa2.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/loading-acc8eb1a265daa61.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/login/page-d387b965e69b83d7.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/not-found-c9ced7b49d298c4a.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/offline/page-aa5de53060b9bb12.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/order-success/page-29b46068bb6f2db9.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/order/%5Bid%5D/page-94aa0122e33aed8d.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/order/%5Bid%5D/payment-simple/page-a2a329ad4d158e3f.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/order/%5Bid%5D/payment/page-82caac0b7496fa61.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/orders/%5Bid%5D/page-d2134fdb56b0e0bd.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/orders/%5Bid%5D/payment/page-ab1c983ae7b08dd4.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/orders/page-9f2f278c5a036194.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/page-3850de4168366968.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/profile/change-password/page-2d90a722a7612d32.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/profile/page-5f9ea2cae3ab3249.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/register/page-20875c6d23a8c943.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/reset-password/page-6dc0347b0062bdc7.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/service/%5Bslug%5D/page-8c41ff5b25a613b0.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/services/page-62f0ebf0db0fd167.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/verify-code/page-606d92e75185a2e7.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/app/verify-email/page-6ef038f9226e5cf9.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/fd9d1056-270721ac51469ce4.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/framework-56dfd39ab9a08705.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/main-029a626bee84133e.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/main-app-b674ef0573dd9ff0.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/pages/_app-3c9ca398d360b709.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/pages/_error-cf5ca766ac8f493f.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-cbbe3cef69f35cec.js',
          revision: 'f31c2c0982091e66692f6f92cf23451c5d05c865',
        },
        { url: '/_next/static/css/822747d7cfaca3d6.css', revision: '822747d7cfaca3d6' },
        {
          url: '/_next/static/f31c2c0982091e66692f6f92cf23451c5d05c865/_buildManifest.js',
          revision: '6310079bf1ae7bebeb6a2135896e4564',
        },
        {
          url: '/_next/static/f31c2c0982091e66692f6f92cf23451c5d05c865/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/custom-sw.js', revision: '6f0d499c851d724a9ef290e71544b130' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/google14dde395751bc2a2.html', revision: 'b01ebb8c3dea428f4b134048ca8c9985' },
        {
          url: '/googlekoDjEJPIQLr8pn6D6kB38eWHm0tv-jSJNqR_popxUJc.html',
          revision: 'b30eb870e415d264d0620a28fcbdbb54',
        },
        { url: '/icons/icon-192x192.png', revision: 'c1a7bccf5c9a3551fb8d2362f6694263' },
        { url: '/icons/icon-512x512.png', revision: '39af7b6e1135971e77b8e4bb6a1bfe29' },
        { url: '/icons/icon.svg', revision: 'e8cf9fe1538ac760bd47f20bd9281741' },
        { url: '/images/12.jpg', revision: '77c48f9dd72c28bf6d2dadcc17cf4e15' },
        {
          url: '/images/egyptian-foreign-affairs.jpg',
          revision: '3edf72c967c6313bf9ca7ac807f0b58d',
        },
        {
          url: '/images/egyptian-foreign-affairs.png',
          revision: '42d5c2a101d44f40e5e9bf8d00cbba34',
        },
        { url: '/images/egyptnisr.png', revision: '4f01713d40ca9e1d14fc1ac09b8733c7' },
        { url: '/images/government-services-bg.jpg', revision: '2c2f13268c5fdd0c65a4d27648e931e4' },
        { url: '/images/government-services-bg.png', revision: '2bfd3f39b47eaaffa461b564973da614' },
        { url: '/images/national-id.jpg', revision: 'dc700489ce5fd3c1e81482f4eede1428' },
        { url: '/images/national-id.png', revision: '43c79cd13b0e3d21de4becad6988c294' },
        { url: '/images/nisr.png', revision: '690ad333222fca72fe3644d53f3fd3e5' },
        { url: '/images/official-documents.jpg', revision: '2f49e8f5036abde9f3348ec20f2d6422' },
        { url: '/images/official-documents.png', revision: '838ad38d35eee46c342b29a226933e99' },
        { url: '/images/passports.jpg', revision: 'afa3f9c5af114ce463e6bd8301d0c304' },
        { url: '/images/passports.png', revision: '3d05d80649c0cdcc2cb3fae0ae1f5d6d' },
        { url: '/images/report-footer.png', revision: 'af56720381fb32377e0e4f9a837148a3' },
        { url: '/images/report-header.png', revision: '319b75c2bc7d3a8f091c078c8db8a124' },
        { url: '/images/report-header2.png', revision: '28d68c31b30d43692d28b83f204456d7' },
        { url: '/images/service.png', revision: '9ea2b2c756016b42ecd72ad21474808a' },
        { url: '/images/who.jpeg', revision: 'fd2774f9243a41c5ccbbe405da6c3d61' },
        { url: '/logo.jpg', revision: '4ddcf13bb586f6c6e75428ceae19ba22' },
        { url: '/manifest.json', revision: 'de70233c12b4b322cad112ca996634e1' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/robots.txt', revision: 'be0a017b080b40eca39134ffdff892bb' },
        { url: '/schema.json', revision: '282a6f29e49f15ded023d7186cdd31e9' },
        { url: '/screenshot-desktop.png', revision: 'd5bb09ad9a8b756d8bd26f3f5dd4c221' },
        { url: '/screenshot-mobile.png', revision: '54296fbe3d2ba4f23660cd6a33e48f61' },
        {
          url: '/uploads/categories/1756921412385_passports.png',
          revision: '3d05d80649c0cdcc2cb3fae0ae1f5d6d',
        },
        {
          url: '/uploads/cmevqh0zg0001ezk4hhnpq3bb/1756405478724_535627028_783052254675390_9127647955669089041_n.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/cmevqps5t0003ezk4fpvuob0o/1756405887196_WhatsApp Image 2025-08-28 at 14.12.05_59f18631.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/cmevqt1la0001ezlwk1w5434h/1756406039381_WhatsApp Image 2025-08-28 at 14.12.05_59f18631.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/cmevqvplp0005ezlwwxv6rw4i/1756406163815_535627028_783052254675390_9127647955669089041_n.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/cmevqvplp0005ezlwwxv6rw4i/1756406163824_535627028_783052254675390_9127647955669089041_n.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/cmevqvplp0005ezlwwxv6rw4i/1756406163840_535627028_783052254675390_9127647955669089041_n.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/000004/document_cmkmqy9y5001nux1dirm2olt1_1769099137477.png',
          revision: '995d27cccb9823008d28b6a382a1a0eb',
        },
        {
          url: '/uploads/orders/000004/document_cmkmqy9y5001oux1d87gzf44u_1769099137780.png',
          revision: '995d27cccb9823008d28b6a382a1a0eb',
        },
        {
          url: '/uploads/orders/000004/document_cmkmqy9y5001pux1dpxhgfbh3_1769099137926.png',
          revision: '995d27cccb9823008d28b6a382a1a0eb',
        },
        {
          url: '/uploads/orders/000005/document_cmkmqy9y5001nux1dirm2olt1_1769099705216.png',
          revision: 'b215821c71d8690b97029bc5f79c6867',
        },
        {
          url: '/uploads/orders/000005/document_cmkmqy9y5001oux1d87gzf44u_1769099705507.png',
          revision: 'b215821c71d8690b97029bc5f79c6867',
        },
        {
          url: '/uploads/orders/000005/document_cmkmqy9y5001pux1dpxhgfbh3_1769099705653.png',
          revision: 'b215821c71d8690b97029bc5f79c6867',
        },
        {
          url: '/uploads/orders/000006/document_cmkmqy5xo000dux1dc9gvgbag_1769099769214.png',
          revision: 'b215821c71d8690b97029bc5f79c6867',
        },
        {
          url: '/uploads/orders/000007/document_cmkmqy5xo000cux1d8xwykb42_1769100126886.png',
          revision: 'b215821c71d8690b97029bc5f79c6867',
        },
        {
          url: '/uploads/orders/000007/document_cmkmqy5xo000cux1d8xwykb42_1769306758503.png',
          revision: '1f18c32c856c3ca52ebf4cc4eabf5a44',
        },
        {
          url: '/uploads/orders/000008/document_cmkmqy5xo000iux1db7cirkdd_1769101113877.png',
          revision: 'b215821c71d8690b97029bc5f79c6867',
        },
        {
          url: '/uploads/orders/000009/document_cmkmqy5xo000iux1db7cirkdd_1769101421528.pdf',
          revision: '41721da4e6ccff74f2fe7f6222500222',
        },
        {
          url: '/uploads/orders/000010/document_cmkmqy5xo000cux1d8xwykb42_1769103170414.png',
          revision: 'd1ada2ce29103574eb309eeab1ebb790',
        },
        {
          url: '/uploads/orders/000010/document_cmktuhsnv0027jj2hwkyl9hd8_1769364842288.png',
          revision: '9613c841ce79ab70a5b5b80101cb9ab8',
        },
        {
          url: '/uploads/orders/000011/document_cmktuhsnv0027jj2hwkyl9hd8_1769364855497.png',
          revision: 'd49d2c1c330745bfef9324a529d9c0c8',
        },
        {
          url: '/uploads/orders/000065/document_cmktag8rr000n7wymymi6qx1m_1770773261810.png',
          revision: '8c9682ef05d997872edb627fec92bcd7',
        },
        {
          url: '/uploads/orders/000066/document_cmlcskouy002iawng3v6z2hz7_1770826741889.png',
          revision: 'e6e4bc2e8371c8444858cf4d6df37710',
        },
        {
          url: '/uploads/orders/000066/document_cmlcskp8h002kawng8ulthm4p_1770826742561.png',
          revision: 'e6e4bc2e8371c8444858cf4d6df37710',
        },
        {
          url: '/uploads/orders/000066/document_cmlcsksn70032awngz1pcebba_1770826743228.png',
          revision: '1e1afe37d96cfa0badaae0032ed03b07',
        },
        {
          url: '/uploads/orders/2026161351/document_sdoc_001_1767521161496.png',
          revision: 'c61f6fb581e14f93ff2f9600cb852856',
        },
        {
          url: '/uploads/orders/2026161351/document_sdoc_002_1767521161835.jpeg',
          revision: 'e93d47951e289d6e49c3b54017030921',
        },
        {
          url: '/uploads/orders/2026631235/document_sdoc_001_1767520631537.png',
          revision: '694229e91ba59e4147699de4fc747e0e',
        },
        {
          url: '/uploads/orders/2026631235/document_sdoc_002_1767520631844.png',
          revision: 'c61f6fb581e14f93ff2f9600cb852856',
        },
        {
          url: '/uploads/orders/2026635589/document_sdoc_001_1767520635803.png',
          revision: '694229e91ba59e4147699de4fc747e0e',
        },
        {
          url: '/uploads/orders/2026635589/document_sdoc_002_1767520636249.png',
          revision: 'c61f6fb581e14f93ff2f9600cb852856',
        },
        {
          url: '/uploads/orders/cmevy3ys80001ez04wxf96443/document_cmevthh8x000cezz41xhmnyx4_1756418306285.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmevy3ys80001ez04wxf96443/document_cmevthh8x000dezz4yi201w2h_1756418306296.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/orders/cmevy3ys80001ez04wxf96443/document_cmevthh8x000eezz4o9m5mgod_1756418306405.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/orders/cmevzntsg000aez04phf811fm/document_cmevthh8x000cezz41xhmnyx4_1756420912546.png',
          revision: 'f77bdbd85f322ba2321536956db61ff1',
        },
        {
          url: '/uploads/orders/cmevzntsg000aez04phf811fm/document_cmevthh8x000dezz4yi201w2h_1756420912557.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmevzntsg000aez04phf811fm/document_cmevthh8x000eezz4o9m5mgod_1756420912572.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmewuyb2d0001ezssezkfl9qe/document_cmevthh8x000cezz41xhmnyx4_1756473469580.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/orders/cmewuyb2d0001ezssezkfl9qe/document_cmevthh8x000dezz4yi201w2h_1756473469591.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmewuyb2d0001ezssezkfl9qe/document_cmevthh8x000eezz4o9m5mgod_1756473469602.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/orders/cmewxxw000002ez6czhz3uwe2/document_cmevthh8x000cezz41xhmnyx4_1756478488902.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmewxxw000002ez6czhz3uwe2/document_cmevthh8x000dezz4yi201w2h_1756478488910.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmewxxw000002ez6czhz3uwe2/document_cmevthh8x000eezz4o9m5mgod_1756478488919.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmexc6syr0001ez4w4xcilx0t/document_cmevthh8x000cezz41xhmnyx4_1756502419509.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmexc6syr0001ez4w4xcilx0t/document_cmevthh8x000dezz4yi201w2h_1756502419520.png',
          revision: 'f77bdbd85f322ba2321536956db61ff1',
        },
        {
          url: '/uploads/orders/cmexc6syr0001ez4w4xcilx0t/document_cmevthh8x000eezz4o9m5mgod_1756502419533.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmexclm6x0009ez4w1sv8ye05/document_cmevthh8x000cezz41xhmnyx4_1756503110569.png',
          revision: '76a88b3624a5481a15dc6a06206c51e6',
        },
        {
          url: '/uploads/orders/cmexclm6x0009ez4w1sv8ye05/document_cmevthh8x000dezz4yi201w2h_1756503110590.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/orders/cmexclm6x0009ez4w1sv8ye05/document_cmevthh8x000eezz4o9m5mgod_1756503110722.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmeye8org0001ezqkdgq1q4mf/document_cmevthh8x000cezz41xhmnyx4_1756566332771.png',
          revision: 'd981956aebdd3c397f0d037dcba816c9',
        },
        {
          url: '/uploads/orders/cmeye8org0001ezqkdgq1q4mf/document_cmevthh8x000dezz4yi201w2h_1756566332781.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/orders/cmeye8org0001ezqkdgq1q4mf/document_cmevthh8x000eezz4o9m5mgod_1756566332790.jpg',
          revision: '4ddcf13bb586f6c6e75428ceae19ba22',
        },
        {
          url: '/uploads/orders/cmeyq76he0001lgu3m9zv2exl/document_sdoc_001_1756586417819.jpg',
          revision: '993304d1b07cc2ae1d888e213adffeb9',
        },
        {
          url: '/uploads/orders/cmeyq76he0001lgu3m9zv2exl/document_sdoc_002_1756586417834.png',
          revision: 'd981956aebdd3c397f0d037dcba816c9',
        },
        {
          url: '/uploads/orders/cmf05r8gl00013xyj8red30ln/document_sdoc_001_1756673013918.png',
          revision: '085bc41bca563d7e212412712d2b9a2d',
        },
        {
          url: '/uploads/orders/cmf05r8gl00013xyj8red30ln/document_sdoc_002_1756673013928.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/orders/cmf128px8000112otot6ojn9n/document_sdoc_001_1756727577416.png',
          revision: '085bc41bca563d7e212412712d2b9a2d',
        },
        {
          url: '/uploads/orders/cmf128px8000112otot6ojn9n/document_sdoc_002_1756727577425.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/orders/cmf12u2m7000110rqfzzi27ud/document_sdoc_001_1756728573644.png',
          revision: '085bc41bca563d7e212412712d2b9a2d',
        },
        {
          url: '/uploads/orders/cmf12u2m7000110rqfzzi27ud/document_sdoc_002_1756728573654.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/orders/cmf133wxi000710rqcwtomuet/document_sdoc_001_1756729032825.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/orders/cmf133wxi000710rqcwtomuet/document_sdoc_002_1756729032831.png',
          revision: '68c78e568117c8090b39b412bdf0455e',
        },
        {
          url: '/uploads/orders/cmf1395ur00017ftgfdvwwppa/document_sdoc_001_1756729277677.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/orders/cmf1395ur00017ftgfdvwwppa/document_sdoc_002_1756729277685.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/orders/cmf1396gz00077ftgaen948f7/document_sdoc_001_1756729278471.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/orders/cmf1396gz00077ftgaen948f7/document_sdoc_002_1756729278476.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/orders/cmf17vphx000113x2lzorz4sd/document_sdoc_001_1756737048049.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/orders/cmf17vphx000113x2lzorz4sd/document_sdoc_002_1756737048055.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/orders/cmf2jhvk50001xdzl7r2advkx/document_sdoc_001_1756817024272.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/orders/cmf2jhvk50001xdzl7r2advkx/document_sdoc_002_1756817024281.png',
          revision: '0ea05331a32db112841f1f8fa08cd74a',
        },
        {
          url: '/uploads/orders/cmf2jm9p00009xdzl92oxhi0u/document_sdoc_001_1756817229215.png',
          revision: '085bc41bca563d7e212412712d2b9a2d',
        },
        {
          url: '/uploads/orders/cmf2jm9p00009xdzl92oxhi0u/document_sdoc_002_1756817229224.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/orders/cmf46c3q00001vqfo4f7wy6wb/document_cmf45bd290003jfi7wcisone3_1756915852589.png',
          revision: '68c78e568117c8090b39b412bdf0455e',
        },
        {
          url: '/uploads/orders/cmf46ss5d000bvqfod7n4y6is/document_cmf46rim50009vqfohonmeke2_1756916630740.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/orders/cmf47of6t00014l5gqrz059i9/document_cmf46rim50009vqfohonmeke2_1756918107270.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/payments/payment_1756729312609.png',
          revision: '0ea05331a32db112841f1f8fa08cd74a',
        },
        {
          url: '/uploads/payments/payment_1756737063037.png',
          revision: '085bc41bca563d7e212412712d2b9a2d',
        },
        {
          url: '/uploads/payments/payment_1756817038315.png',
          revision: '68c78e568117c8090b39b412bdf0455e',
        },
        {
          url: '/uploads/payments/payment_1756817237959.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/services/1756914137908_Ù_Ø¶Ù_-transformed.png',
          revision: '75e40a6d20aeaf288a8c3f8935439428',
        },
        {
          url: '/uploads/services/1756916567496_mosaql3.png',
          revision: '939d6b879f7bbf7060d6a720d50223d4',
        },
        {
          url: '/uploads/services/1756921512454_passports.png',
          revision: '3d05d80649c0cdcc2cb3fae0ae1f5d6d',
        },
        {
          url: '/uploads/services/1756921529839_passports.png',
          revision: '3d05d80649c0cdcc2cb3fae0ae1f5d6d',
        },
        {
          url: '/uploads/services/1768699531433_unnamed (1).jpg',
          revision: '2c2f13268c5fdd0c65a4d27648e931e4',
        },
        {
          url: '/uploads/services/1768789592950_btaka.png',
          revision: '23539e10aea387d1cf5d9082d4727462',
        },
        {
          url: '/uploads/services/1769348556600_shada.png',
          revision: 'c126063c2e6a0dbfdcf879b5dd346a9f',
        },
        {
          url: '/uploads/services/1769348567017_content.png',
          revision: 'c126063c2e6a0dbfdcf879b5dd346a9f',
        },
        {
          url: '/uploads/services/1769348735961_.png',
          revision: '29b0df14cd67170fdc711824ddae28a5',
        },
        {
          url: '/uploads/services/1769349494345_zwag.png',
          revision: 'f608fa5067f94cccd95c8cfc5583e67d',
        },
        {
          url: '/uploads/services/1769349543046_wfah.png',
          revision: 'f4eac00572b21313f1efebe0dcb40261',
        },
        {
          url: '/uploads/services/1769349616780_5arg.png',
          revision: '20d947a8bfb63e4063ea49b5723fc763',
        },
        {
          url: '/uploads/services/1769349787111_Untitleddesign2.png',
          revision: '227104adcd4ed0c936e129cefffdc3e1',
        },
        {
          url: '/uploads/services/1769349930295_Untitleddesign3.png',
          revision: '049519c50d4fc89663b1502f5de3e4a9',
        },
        {
          url: '/uploads/services/1769349998019_shada.png',
          revision: 'c126063c2e6a0dbfdcf879b5dd346a9f',
        },
        {
          url: '/uploads/services/1769350273288_Untitleddesign4.png',
          revision: '16cf5b184fcdc44a2b19b0088a04d8cc',
        },
        {
          url: '/uploads/services/1769350275648_Untitleddesign4.png',
          revision: '16cf5b184fcdc44a2b19b0088a04d8cc',
        },
        {
          url: '/uploads/services/1769350304476_wfah.png',
          revision: 'f4eac00572b21313f1efebe0dcb40261',
        },
        {
          url: '/uploads/services/1769350320859_shada.png',
          revision: 'c126063c2e6a0dbfdcf879b5dd346a9f',
        },
        {
          url: '/uploads/services/1769350518932_Untitleddesign5.png',
          revision: 'b187e1f694a4c1ee3a6a119296aa595e',
        },
        {
          url: '/uploads/services/1769350530684_Untitleddesign5.png',
          revision: 'b187e1f694a4c1ee3a6a119296aa595e',
        },
        {
          url: '/uploads/services/1769350574753_Untitleddesign6.png',
          revision: '6f5914a2a1c22b0326503ebcc57cd0bc',
        },
        {
          url: '/uploads/services/1769350711787_zwag.png',
          revision: 'f608fa5067f94cccd95c8cfc5583e67d',
        },
        {
          url: '/uploads/services/1769350823780_Untitleddesign7.png',
          revision: 'b1bed87382c95f8bfdd66db947ba3d03',
        },
        {
          url: '/uploads/services/1769350843772_Untitleddesign7.png',
          revision: 'b1bed87382c95f8bfdd66db947ba3d03',
        },
        {
          url: '/uploads/services/1769351249851_58ae8d5d-aa41-47e8-bab3-e6cb1479000f.png',
          revision: '73d9fdeb4b21dca2e6e2b5eb7981066c',
        },
        {
          url: '/uploads/services/1769351277236_Untitleddesign5.png',
          revision: 'b187e1f694a4c1ee3a6a119296aa595e',
        },
        {
          url: '/uploads/services/1769351508471_logo3.png',
          revision: '9350c8af6d86e8a0a4c2566c1ad4bf62',
        },
        {
          url: '/uploads/services/1769351909817_Untitleddesign4.png',
          revision: '16cf5b184fcdc44a2b19b0088a04d8cc',
        },
        {
          url: '/uploads/services/1769351981505_4311c60c-0667-4860-acb2-52ae79a8dd8c.png',
          revision: '395d7ca175dfebe05ccf0427cdec5ac7',
        },
        {
          url: '/uploads/services/1769354785460_Untitleddesign5.png',
          revision: 'b187e1f694a4c1ee3a6a119296aa595e',
        },
        {
          url: '/uploads/services/1769356472725_GeminiGeneratedImage4q677w4q677w4q67.png',
          revision: '65df6ff2649f1524170a430dc440b382',
        },
        {
          url: '/uploads/services/1769356712792_unnamed2.jpg',
          revision: '0b2fd47339e4a82093ba379bc99ac85c',
        },
        {
          url: '/uploads/services/1769356746944_unnamed2.jpg',
          revision: '0b2fd47339e4a82093ba379bc99ac85c',
        },
        {
          url: '/uploads/services/1769356768699_unnamed2.jpg',
          revision: '0b2fd47339e4a82093ba379bc99ac85c',
        },
        {
          url: '/uploads/services/1769356986963_GeminiGeneratedImage4q677w4q677w4q67.png',
          revision: 'ddc12f53de881caa5a487961d3c7dae3',
        },
        {
          url: '/uploads/services/1769357017578_GeminiGeneratedImagevogmmuvogmmuvogm.png',
          revision: '65df6ff2649f1524170a430dc440b382',
        },
        {
          url: '/uploads/services/1769357163332_GeminiGeneratedImagecsrvngcsrvngcsrv.png',
          revision: '074b18541946e505c44cc50c1514a2af',
        },
        {
          url: '/uploads/services/1769357216913_GeminiGeneratedImagecsrvngcsrvngcsrv.png',
          revision: '074b18541946e505c44cc50c1514a2af',
        },
        {
          url: '/uploads/services/1769357276301_WhatsAppImage2026-01-25at6.05.47PM.jpeg',
          revision: '5a9e90fd3618840fec96f32d71c66e84',
        },
        {
          url: '/uploads/services/1769357432571_f4cc0439-cd8a-4355-80ab-9283a198c72e.png',
          revision: '71d99d5d88930b70ec3fe6cad8550c82',
        },
        {
          url: '/uploads/services/1769357641135_GeminiGeneratedImage23ae4823ae4823ae.png',
          revision: '241985d8ab53cf049683f94cb46dceb0',
        },
        {
          url: '/uploads/services/1769357665115_GeminiGeneratedImage23ae4823ae4823ae.png',
          revision: '241985d8ab53cf049683f94cb46dceb0',
        },
        {
          url: '/uploads/services/1769357801423_GeminiGeneratedImageyjolwvyjolwvyjol.png',
          revision: '83eccab69c38c0e00397e3ce5f6b4841',
        },
        {
          url: '/uploads/services/1769357830772_GeminiGeneratedImageyjolwvyjolwvyjol.png',
          revision: '83eccab69c38c0e00397e3ce5f6b4841',
        },
        {
          url: '/uploads/services/1769358576167_Untitleddesign11.png',
          revision: 'f5ed95ac8216985ef2f7223fd36c211e',
        },
        {
          url: '/uploads/services/1769358635118_Untitleddesign10.png',
          revision: 'c01db9155d63778fde8bb49855db1584',
        },
        {
          url: '/uploads/services/1769358774930_Untitleddesign10.png',
          revision: 'c01db9155d63778fde8bb49855db1584',
        },
        {
          url: '/uploads/services/1769358830361_Untitleddesign8.png',
          revision: 'f43648f65636d7b7d0578f6fa1147d56',
        },
        {
          url: '/uploads/services/1769358935136_Untitleddesign8.png',
          revision: 'f43648f65636d7b7d0578f6fa1147d56',
        },
        {
          url: '/uploads/services/1769358993887_Untitleddesign9.png',
          revision: 'cc8744edab5a378883edae67fa7a4a12',
        },
        {
          url: '/uploads/services/1769359022132_Untitleddesign9.png',
          revision: 'cc8744edab5a378883edae67fa7a4a12',
        },
        {
          url: '/uploads/services/1769359622786_.jpg',
          revision: '8a5d305b47c647b739f82162836507e2',
        },
        {
          url: '/uploads/services/1769360275717_.png',
          revision: 'e0c4327328c6e2d6373c1e1e4d2c8fa7',
        },
        {
          url: '/uploads/services/1769360670195_mjCqNvn1400x400.jpg',
          revision: 'eec9abcbf307194e1b2ecdb7da77525c',
        },
        {
          url: '/uploads/services/1769360823122_1685614234944--.png',
          revision: '9613c841ce79ab70a5b5b80101cb9ab8',
        },
        { url: '/uploads/services/services.rar', revision: '2436d84d6f61982d327db5b75c140818' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: c, event: s, state: d }) =>
              c && 'opaqueredirect' === c.type
                ? new Response(c.body, { status: 200, statusText: 'OK', headers: c.headers })
                : c,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const c = e.pathname;
        return !c.startsWith('/api/auth/') && !!c.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ));
});
