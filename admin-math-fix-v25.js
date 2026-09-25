// Admin math renderer fix v25: use non-numeric hold keys so Arabic digit conversion cannot corrupt placeholders.
renderAdminMath=function(raw){
  let s=String(raw??'');
  const frac=(a,b)=>`<span dir="ltr" style="display:inline-flex;vertical-align:middle;flex-direction:column;align-items:center;line-height:1.05;margin:0 .15em"><span style="padding:0 .18em;border-bottom:1.5px solid currentColor">${esc(arDigits(a))}</span><span style="padding:0 .18em">${esc(arDigits(b))}</span></span>`;
  const sqrt=x=>`<span dir="ltr" style="display:inline-flex;align-items:flex-start;vertical-align:middle"><span style="font-size:1.15em;line-height:1">√</span><span style="border-top:1.5px solid currentColor;padding:0 .14em">${esc(arDigits(x))}</span></span>`;
  const pow=(a,b)=>`<span dir="ltr" style="display:inline-block;white-space:nowrap"><span>${esc(arDigits(a))}</span><sup style="font-size:.72em;line-height:0">${esc(arDigits(b))}</sup></span>`;
  const holds=[];
  const hold=h=>{const k='\uE000'+String.fromCharCode(0xE100+holds.length)+'\uE001';holds.push([k,h]);return k};
  s=s.replace(/\{\{\s*frac\s*:\s*([^}:]+)\s*:\s*([^}]+)\}\}/gi,(_,a,b)=>hold(frac(a,b)))
     .replace(/\{\{\s*([^}:]+)\s*:\s*([^}:]+)\s*:\s*frac\s*\}\}/gi,(_,a,b)=>hold(frac(a,b)))
     .replace(/\{\{\s*sqrt\s*:\s*([^}]+)\}\}/gi,(_,x)=>hold(sqrt(x)))
     .replace(/\{\{\s*([^}:]+)\s*:\s*sqrt\s*\}\}/gi,(_,x)=>hold(sqrt(x)))
     .replace(/\{\{\s*pow\s*:\s*([^}:]+)\s*:\s*([^}]+)\}\}/gi,(_,a,b)=>hold(pow(a,b)))
     .replace(/\{\{\s*([^}:]+)\s*:\s*([^}:]+)\s*:\s*pow\s*\}\}/gi,(_,a,b)=>hold(pow(a,b)))
     .replace(/([0-9٠-٩]+)\s*\/\s*([0-9٠-٩]+)/g,(_,a,b)=>hold(frac(a,b)))
     .replace(/√\s*([0-9٠-٩]+)/g,(_,x)=>hold(sqrt(x)))
     .replace(/([0-9٠-٩]+)\s*\^\s*([0-9٠-٩]+)/g,(_,a,b)=>hold(pow(a,b)));
  s=esc(arDigits(s));holds.forEach(([k,h])=>{s=s.split(k).join(h)});return s;
};

// Results table: add clear headers, student name, and a mobile card layout.
(()=>{
  const style=document.createElement('style');
  style.textContent=`#resultsView table{min-width:900px}#resultsView th{white-space:nowrap}#resultsView td{vertical-align:middle}@media(max-width:760px){#resultsView .tableWrap{overflow:visible}#resultsView table,#resultsView tbody,#resultsView tr,#resultsView td{display:block;width:100%;min-width:0}#resultsView thead{display:none}#resultsView tr{background:#fff;border:1px solid #e2e7ef;border-radius:14px;padding:8px 13px;margin-bottom:12px;box-shadow:0 2px 8px rgba(23,32,51,.04)}#resultsView td{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:9px 2px;border-bottom:1px solid #edf0f4;text-align:left}#resultsView td:last-child{border-bottom:0}#resultsView td:before{content:attr(data-label);font-weight:800;color:#667085;text-align:right}#resultsView td:first-child b{color:#17345f}}`;
  document.head.appendChild(style);
  function ensureHead(){const table=document.querySelector('#resultsView table');if(!table)return;if(!table.tHead){const h=table.createTHead(),r=h.insertRow();['اسم الطالب','التاريخ','الاختبار / التدريب','الإجمالي','الكمي','اللفظي','الحالة'].forEach(x=>{const th=document.createElement('th');th.textContent=x;r.appendChild(th)})}}
  window.loadResults=async function(){
    ensureHead();
    const [attemptRes,studentRes]=await Promise.all([db.from('exam_attempts').select('*').order('started_at',{ascending:false}).limit(100),db.rpc('admin_list_students')]);
    if(attemptRes.error){toast('تعذر تحميل النتائج');return}
    const studentMap=new Map((studentRes.data||[]).map(s=>[String(s.user_id),s]));
    const rows=attemptRes.data||[];
    $('resultsTable').innerHTML=rows.map(r=>{const uid=r.user_id??r.student_id??r.profile_id??r.auth_user_id;const student=studentMap.get(String(uid));const name=student?.full_name||r.student_name||r.full_name||student?.email||'غير معروف';return `<tr><td data-label="اسم الطالب"><b>${esc(name)}</b></td><td data-label="التاريخ">${formatDate(r.started_at)}</td><td data-label="الاختبار / التدريب">${examTypeLabel(r.exam_type)}</td><td data-label="الإجمالي"><b>${r.score==null?'—':`${Math.round(r.score)}%`}</b></td><td data-label="الكمي">${r.quantitative_score==null?'—':`${Math.round(r.quantitative_score)}%`}</td><td data-label="اللفظي">${r.verbal_score==null?'—':`${Math.round(r.verbal_score)}%`}</td><td data-label="الحالة"><span class="pill ${r.completed_at?'completed':'inProgress'}">${r.completed_at?'مكتملة':'غير مكتملة'}</span></td></tr>`}).join('');
    $('resultsEmpty').hidden=rows.length>0;
  };
  const btn=document.getElementById('refreshResults');if(btn)btn.onclick=window.loadResults;
  document.addEventListener('DOMContentLoaded',ensureHead);setTimeout(()=>{ensureHead();if(document.body.classList.contains('authenticated'))window.loadResults()},700);
})();

// Load the owner-only question-bank API bridge after the legacy admin code.
(()=>{const s=document.createElement('script');s.src='admin-secure-questions.js?v=20260919-1';s.onload=()=>{if(document.body.classList.contains('authenticated')){loadSkills();loadQuestions();}};document.head.appendChild(s)})();

// Add a dedicated owner page that previews every question and explanation exactly like the student training UI.
(()=>{function addPreviewLinks(){const nav=document.querySelector('.sidebar nav');if(nav&&!nav.querySelector('[data-question-preview]')){const a=document.createElement('a');a.className='navItem';a.href='admin-question-preview.html';a.dataset.questionPreview='1';a.style.textDecoration='none';a.textContent='معاينة جميع الأسئلة';const q=[...nav.children].find(x=>x.textContent.includes('بنك الأسئلة'));q?q.after(a):nav.appendChild(a)}const home=document.querySelector('.ownerHome');if(home&&!home.querySelector('[data-question-preview]')){const a=document.createElement('a');a.className='ownerTile';a.href='admin-question-preview.html';a.dataset.questionPreview='1';a.innerHTML='<span class="tileIcon">👁️</span><span><b>معاينة جميع الأسئلة</b><small>السؤال والخيارات والإجابة الصحيحة والشرح كما تظهر للطالب</small></span>';home.appendChild(a)}}document.addEventListener('DOMContentLoaded',addPreviewLinks);setTimeout(addPreviewLinks,500)})();

// Load affiliate marketers management module.
(()=>{const s=document.createElement('script');s.src='admin-affiliates.js?v=20260925-5';document.head.appendChild(s)})();