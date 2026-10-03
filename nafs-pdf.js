/* Main sustainable PDF now matches experimental renderer */
(()=>{
 function neutralize(){
  const teacher=document.getElementById('teacher'),principal=document.getElementById('principal');
  if(teacher){const l=teacher.closest('.f')?.querySelector('label');if(l)l.textContent='الاسم';const n=sessionStorage.getItem('nafsTeacherName');if(n){teacher.value=n;teacher.readOnly=true;teacher.style.background='#f2f4f7';teacher.style.color='#475467';teacher.style.fontWeight='700';teacher.title='الاسم مرتبط باشتراك نافس ولا يمكن تغييره'}}
  if(principal){const l=principal.closest('.f')?.querySelector('label');if(l)l.textContent='إدارة المدرسة'}
 }
 function patchReport(el){const body=el?.querySelector('#reportBody')||document.getElementById('reportBody');if(!body)return;body.innerHTML=body.innerHTML.replace(/المعلمة<br>/g,'إعداد<br>').replace(/مديرة المدرسة<br>/g,'إدارة المدرسة<br>')}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',neutralize);else neutralize();
 window.NAFS_PDF={async download(el,name){neutralize();patchReport(el);if(!window.NAFS_PDF_TEST)throw Error('experimental renderer not loaded');return window.NAFS_PDF_TEST.download(el,name||'خطة-نافس-المستدامة.pdf')}};
})();