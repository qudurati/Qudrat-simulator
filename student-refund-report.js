function printStudent(id){
  const s=students.find(x=>x.user_id===id); if(!s)return;
  const w=window.open('','_blank','width=760,height=900');
  if(!w){alert('اسمح بالنوافذ المنبثقة لطباعة التقرير.');return}
  const dt=v=>v?new Intl.DateTimeFormat('en-GB-u-ca-gregory',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'Asia/Riyadh'}).format(new Date(v)):'—';
  const refundStatus=v=>({pending:'قيد المراجعة',approved:'مقبول',rejected:'مرفوض',cancelled:'ملغي'})[v]||v||'—';
  const referral=s.referral_marketer?`المسوّق: ${s.referral_marketer}${s.referral_code?' ('+s.referral_code+')':''}`:(s.acquisition_source&&s.acquisition_source!=='direct'?`المصدر: ${s.acquisition_source}`:'مباشر');
  const refundRows=s.refund_requested_at?`
    <div class="section">بيانات طلب الاسترجاع</div>
    <div class="row"><div class="label">تاريخ طلب الاسترجاع</div><div class="value">${dt(s.refund_requested_at)}</div></div>
    <div class="row"><div class="label">حالة الطلب</div><div class="value">${esc(refundStatus(s.refund_status))}</div></div>
    <div class="row"><div class="label">تاريخ القرار</div><div class="value">${dt(s.refund_decided_at)}</div></div>
    <div class="row"><div class="label">سبب القرار</div><div class="value">${esc(s.refund_decision_reason||'—')}</div></div>`:`
    <div class="section">بيانات طلب الاسترجاع</div>
    <div class="row"><div class="label">طلب الاسترجاع</div><div class="value">لا يوجد طلب استرجاع مسجل</div></div>`;
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير الطالب</title><style>
  body{font-family:Arial,Tahoma,sans-serif;color:#173866;margin:40px}h1{text-align:center;margin-bottom:6px}.sub{text-align:center;color:#718096;margin-bottom:28px}.box{border:1px solid #d8e3ef;border-radius:16px;padding:22px}.section{font-size:16px;font-weight:bold;background:#f3f7fb;padding:10px 12px;border-radius:9px;margin:16px 0 3px}.section:first-child{margin-top:0}.row{display:grid;grid-template-columns:165px 1fr;padding:11px 0;border-bottom:1px solid #edf2f7}.label{color:#718096;font-weight:bold}.value{font-weight:bold;word-break:break-word}.foot{text-align:center;color:#8a98aa;font-size:12px;margin-top:28px}@media print{body{margin:18mm}}
  </style></head><body><h1>محاكي القدرات</h1><div class="sub">تقرير اشتراك وانتفاع واسترجاع الطالب</div><div class="box">
  <div class="section">بيانات الطالب والاشتراك</div>
  <div class="row"><div class="label">اسم الطالب</div><div class="value">${esc(s.full_name||'—')}</div></div>
  <div class="row"><div class="label">رقم الجوال</div><div class="value" dir="ltr">${esc(s.phone||'—')}</div></div>
  <div class="row"><div class="label">البريد الإلكتروني</div><div class="value">${esc(s.email||'—')}</div></div>
  <div class="row"><div class="label">الإحالة</div><div class="value">${esc(referral)}</div></div>
  <div class="row"><div class="label">حالة الاشتراك</div><div class="value">${statusName(s.subscription_status)}</div></div>
  <div class="row"><div class="label">الباقة</div><div class="value">${planName(s.plan)}</div></div>
  <div class="row"><div class="label">تاريخ البداية</div><div class="value">${fmt(s.starts_at)}</div></div>
  <div class="row"><div class="label">أول انتفاع</div><div class="value">${fmtUse(s.first_paid_use_at)}</div></div>
  <div class="row"><div class="label">تاريخ الانتهاء</div><div class="value">${fmt(s.ends_at)}</div></div>
  ${refundRows}</div><div class="foot">تاريخ استخراج التقرير: ${dt(new Date())}</div><script>window.onload=()=>setTimeout(()=>window.print(),200)<\/script></body></html>`);
  w.document.close();
}

(()=>{
  function referralLabel(s){
    if(s.referral_marketer) return `المسوّق: ${s.referral_marketer}`;
    if(s.referral_code) return `إحالة: ${s.referral_code}`;
    if(s.acquisition_source && s.acquisition_source!=='direct') return `المصدر: ${s.acquisition_source}`;
    return 'مباشر';
  }
  function decorateReferrals(){
    const table=document.querySelector('.tableWrap table');
    if(!table)return;
    const head=table.querySelector('thead tr');
    if(head&&!head.querySelector('[data-ref-head]')){
      const th=document.createElement('th'); th.dataset.refHead='1'; th.textContent='الإحالة';
      head.insertBefore(th,head.lastElementChild);
    }
    const visible=students.filter(s=>{
      const q=document.getElementById('search')?.value.trim().toLowerCase()||'', qDigits=q.replace(/\D/g,'');
      return !q||String(s.full_name||'').toLowerCase().includes(q)||String(s.email||'').toLowerCase().includes(q)||(qDigits&&String(s.phone||'').includes(qDigits));
    });
    [...document.querySelectorAll('#rows tr')].forEach((tr,i)=>{
      const s=visible[i]; if(!s||tr.querySelector('[data-ref-cell]'))return;
      const td=document.createElement('td'); td.dataset.refCell='1';
      const label=referralLabel(s); td.innerHTML=`<span class="badge ${s.referral_marketer?'active':'free'}">${esc(label)}</span>`;
      tr.insertBefore(td,tr.lastElementChild);
    });
  }
  const baseRender=render;
  render=function(){baseRender();decorateReferrals()};
  setTimeout(decorateReferrals,700);
})();