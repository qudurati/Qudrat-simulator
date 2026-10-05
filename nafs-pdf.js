/* Main sustainable PDF now matches experimental renderer */
(()=>{
 function neutralize(){
  const teacher=document.getElementById('teacher'),principal=document.getElementById('principal');
  if(teacher){const l=teacher.closest('.f')?.querySelector('label');if(l)l.textContent='الاسم';const n=sessionStorage.getItem('nafsTeacherName');if(n){teacher.value=n;teacher.readOnly=true;teacher.style.background='#f2f4f7';teacher.style.color='#475467';teacher.style.fontWeight='700';teacher.title='الاسم مرتبط باشتراك نافس ولا يمكن تغييره'}}
  if(principal){const l=principal.closest('.f')?.querySelector('label');if(l)l.textContent='إدارة المدرسة'}
 }
 function patchReport(el){const body=el?.querySelector('#reportBody')||document.getElementById('reportBody');if(!body)return;body.innerHTML=body.innerHTML.replace(/المعلمة<br>/g,'إعداد<br>').replace(/مديرة المدرسة<br>/g,'إدارة المدرسة<br>')}
 function restoreGrade4(){
  if(!/nafs-sustainable-2026\.html$/i.test(location.pathname))return;
  const install=()=>{
   const grade=document.getElementById('grade');
   if(!grade)return setTimeout(install,50);
   if(![...grade.options].some(o=>o.value==='g4')){
    const opt=new Option('الصف الرابع الابتدائي','g4');
    const g5=[...grade.options].find(o=>o.value==='g5');
    const g6=[...grade.options].find(o=>o.value==='g6');
    grade.insertBefore(opt,g5||g6||null);
   }
   if(!grade.dataset.g4sustainable){
    grade.dataset.g4sustainable='1';
    grade.addEventListener('change',()=>{
     const direct=['g4','g5'].includes(grade.value);
     const sub=document.getElementById('sub')?.closest('.f');
     const outcome=document.getElementById('outcome')?.closest('.f');
     if(sub)sub.style.display=direct?'none':'';
     if(outcome)outcome.style.display=direct?'none':'';
    });
   }
  };
  const s=document.createElement('script');
  s.src='nafs-g4-data.js?v=20261005-restore4';
  s.onload=install;s.onerror=install;document.head.appendChild(s);
 }
 if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',neutralize);document.addEventListener('DOMContentLoaded',restoreGrade4)}else{neutralize();restoreGrade4()}
 window.NAFS_PDF={async download(el,name){neutralize();patchReport(el);if(!window.NAFS_PDF_TEST)throw Error('experimental renderer not loaded');return window.NAFS_PDF_TEST.download(el,name||'خطة-نافس-المستدامة.pdf')}};
})();