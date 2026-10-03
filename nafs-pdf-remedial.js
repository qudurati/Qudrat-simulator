/* Remedial PDF: explicit red theme */
window.NAFS_PDF_REMEDIAL={
 async ensureRenderer(){
  if(window.NAFS_PDF_TEST?.download) return;
  await new Promise((resolve,reject)=>{
   const s=document.createElement('script');
   s.src='nafs-pdf-test.js?v=402-a4-preview';
   s.onload=resolve;
   s.onerror=()=>reject(new Error('تعذر تحميل محرك التقرير'));
   document.head.appendChild(s);
  });
 },
 async download(el,name){
  await this.ensureRenderer();
  return window.NAFS_PDF_TEST.download(el,name||'خطة-نافس-العلاجية.pdf',{theme:'red'});
 }
};