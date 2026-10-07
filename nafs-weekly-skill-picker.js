/* Weekly multi-domain skill picker for NAFS remedial/sustainable plans */
(()=>{
  const MODE=document.title.includes('العلاجية')?'remedial':'sustainable';
  /* Exact semester-plan row mapping. Semester plan itself is NOT modified.
     Reserved semester rows: weeks 1, 16, 18 only. Weeks 3 and 4 are training
     rows in the currently published semester plan and must remain in sequence. */
  /* EXACTLY mirrors the ACTIVE semester plan (nafs-semester-plan-v3-core.html -> build18):
     every subject is distributed over all 18 weeks with sk[i % 18].
     Do not reserve/remap weeks here. */
  const $=id=>document.getElementById(id);
  const splitPath=v=>{const p=String(v||'').split(' — ');return{domain:p[0]||'',sub:p.slice(1).join(' — ')||''}};
  function catalog(){
    const rs=typeof data==='function'?data($('subject')?.value,$('grade')?.value):[];
    const out=[];
    rs.forEach(r=>(r[2]||[]).forEach(skill=>{
      const s=String(skill||'').trim(); if(!s)return;
      const p=splitPath(r[0]);
      out.push({skill:s,domain:p.domain,sub:p.sub||p.domain,outcome:r[1]||''});
    }));
    return out;
  }
  function semesterWeekEntries(){
    const all=catalog();
    if(!all.length)return [];
    const groups=Array.from({length:18},()=>[]);
    const subject=$('subject')?.value||'';
    /* Mirror ACTIVE semester build18 exactly, including review weeks.
       Reading subjects with fewer than 18 skills insert spaced review weeks;
       skills after a review must NOT shift into that review week. */
    if(subject==='reading'&&all.length>0&&all.length<18){
      const reviewCount=18-all.length,reviewWeeks=new Set();
      for(let r=1;r<=reviewCount;r++){
        let idx=Math.round((r*18)/(reviewCount+1))-1;
        while(reviewWeeks.has(idx)&&idx<17)idx++;
        reviewWeeks.add(idx);
      }
      let pos=0;
      for(let week=0;week<18;week++){
        if(!reviewWeeks.has(week)&&pos<all.length)groups[week].push(all[pos++]);
      }
    }else{
      all.forEach((x,i)=>groups[i%18].push(x));
    }
    const sel=$('nafsPlanWeek');
    const w=sel?Number(sel.value):0;
    return Number.isInteger(w)&&w>=0&&w<18 ? groups[w] : [];
  }
  function weekEntries(){return semesterWeekEntries();}
  function esc2(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function renderWeekSkills(){
    const box=$('indicators'); if(!box)return;
    const list=weekEntries();
    box.innerHTML=list.length?list.map((x,i)=>`<label class="check" style="align-items:flex-start"><input type="checkbox" value="${i}" checked><span><b>${esc2(x.skill)}</b><small style="display:block;color:#667085;font-weight:400;margin-top:2px">${esc2(x.domain)}${x.sub&&x.sub!==x.domain?' ← '+esc2(x.sub):''}</small></span></label>`).join(''):'<div class="empty">هذا الأسبوع مخصص للاختبار أو المراجعة العامة ولا توجد مهارات موزعة عليه.</div>';
  }
  function install(){
    const subject=$('subject'); if(!subject||$('nafsPlanWeek'))return false;
    const field=subject.closest('.f')||subject.parentElement;
    const w=document.createElement('div');w.className='f';w.innerHTML='<label>الأسبوع من الخطة الفصلية</label><select id="nafsPlanWeek">'+Array.from({length:18},(_,i)=>`<option value="${i}">الأسبوع ${i+1}</option>`).join('')+'</select>';
    field.insertAdjacentElement('afterend',w);
    ['domain','sub','outcome'].forEach(id=>{const e=$(id);if(e){const f=e.closest('.f');if(f)f.style.display='none'}});
    const lab=$('indicators')?.closest('.f')?.querySelector('label');if(lab)lab.textContent='مهارات الأسبوع — جميعها محددة تلقائيًا ويمكن استبعاد أي مهارة';
    $('nafsPlanWeek').addEventListener('change',renderWeekSkills);
    const oldLS=window.loadSubjects,oldLD=window.loadDomains;
    window.loadSubjects=function(){const r=oldLS?.apply(this,arguments);setTimeout(renderWeekSkills,0);return r};
    window.loadDomains=function(){const r=oldLD?.apply(this,arguments);setTimeout(renderWeekSkills,0);return r};
    setTimeout(renderWeekSkills,0);
    return true;
  }
  function selectedEntries(){
    const list=weekEntries();
    return [...document.querySelectorAll('#indicators input:checked')].map(x=>list[+x.value]).filter(Boolean);
  }
  function pathHtml(items){
    const seen=new Set(),paths=[];
    items.forEach(x=>{const k=x.domain+'|||'+x.sub;if(seen.has(k))return;seen.add(k);paths.push('<span style="display:inline-block;margin:2px 5px;padding:3px 7px;border:1px solid rgba(80,80,80,.12);border-radius:7px"><b>'+esc2(x.domain)+'</b>'+(x.sub&&x.sub!==x.domain?' ← '+esc2(x.sub):'')+'</span>')});
    return '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2px;line-height:1.25">'+paths.join('')+'</div>';
  }
  function installPdf(){
    if(!install())return;
    setTimeout(()=>{
      const prior=window.pdf;if(typeof prior!=='function')return;
      window.pdf=async function(){
        await window.NAFS_GUARD_READY;
        const items=selectedEntries();
        const isReviewWeek=weekEntries().length===0;
        if(!items.length&&!isReviewWeek)return alert('اختر مهارة واحدة على الأقل من مهارات الأسبوع');
        const skills=isReviewWeek?['مراجعة وتثبيت المهارات السابقة']:items.map(x=>x.skill),subjectCode=$('subject').value;
        const g=$('grade').selectedOptions[0]?.text||'',s=$('subject').selectedOptions[0]?.text||'',sc=$('school').value,t=$('teacher').value,p=$('principal').value,dy=$('day').value,dt=typeof hdate==='function'?hdate():'',week=+$('nafsPlanWeek').value+1;
        $('metaCards').innerHTML=`<div class="metaCard"><b>المدرسة</b>${esc2(sc||'—')}</div><div class="metaCard"><b>الصف</b>${esc2(g)}</div><div class="metaCard"><b>المادة</b>${esc2(s)}</div><div class="metaCard"><b>الأسبوع</b>${week}</div><div class="metaCard"><b>التاريخ</b>${esc2(dt)}</div>`;
        const skillHtml='<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px">'+items.map(x=>`<div style="padding:4px 7px;border-radius:7px;background:rgba(255,255,255,.62);border:1px solid rgba(80,80,80,.12);font-size:12px;line-height:1.3"><b>${esc2(x.skill)}</b></div>`).join('')+'</div>';
        if(MODE==='sustainable'){
          const q=profiles(skills,subjectCode);
          const acts=[...document.querySelectorAll('#activityChoices input:checked')].map(x=>x.value),tools=[...document.querySelectorAll('#toolChoices input:checked')].map(x=>x.value);
          if(!acts.length)return alert('اختر إجراءً أو نشاطًا واحدًا على الأقل');if(!tools.length)return alert('اختر أداة قياس ومتابعة واحدة على الأقل');
          q.act=acts.join(' • ');q.tools=tools.join(' • ');
          $('reportBody').innerHTML=sec('','مجالات ومسارات مهارات الأسبوع',isReviewWeek?'مراجعة عامة وتثبيت المهارات السابقة':pathHtml(items))+sec('','المهارات المستهدفة للاستدامة',isReviewWeek?'<div style="text-align:center;font-weight:700">مراجعة وتثبيت المهارات السابقة</div>':skillHtml,'skillHero')+`<div class="two">${sec('','هدف الاستدامة',esc2(q.goal))}${sec('','مهارات التفكير العليا',q.hot)}</div>`+sec('','إجراءات وأنشطة الاستدامة',esc2(q.act))+sec('','مؤشر النجاح',esc2(q.success))+sec('','أدوات القياس والمتابعة',esc2(q.tools))+`<div class="sig"><div>الاسم<br><b>${esc2(t||'........................')}</b></div><div>الإدارة المدرسية<br><b>${esc2(p||'........................')}</b></div></div><div class="footer">خطة نافس المستدامة • الأسبوع ${week} • تقرير يجمع مهارات الأسبوع المختارة</div>`;
          if(!window.NAFS_PDF_TEST)return alert('جاري تحميل عارض التقرير، أعد المحاولة بعد لحظة');
          return await NAFS_PDF_TEST.download($('pdfReport'),'خطة-نافس-المستدامة-الأسبوع-'+week+'.pdf');
        }else{
          const q=profile(skills,subjectCode);
          const acts=[...document.querySelectorAll('#remedialActions input:checked')].map(x=>x.value),tools=[...document.querySelectorAll('#remedialTools input:checked')].map(x=>x.value);
          if(acts.length)q.action=acts.join(' • ');if(tools.length)q.tools=tools.join(' • ');
          $('reportBody').innerHTML=sec('','مجالات ومسارات مهارات الأسبوع',isReviewWeek?'مراجعة عامة وتثبيت المهارات السابقة':pathHtml(items))+sec('','المهارات المستهدفة بالعلاج',isReviewWeek?'<div style="text-align:center;font-weight:700">مراجعة وتثبيت المهارات السابقة</div>':skillHtml,'skillHero')+`<div class="two">${sec('','الهدف العلاجي',esc2(q.goal))}${sec('','الاستراتيجيات العلاجية',esc2(q.strategy))}</div>`+sec('','إجراءات التنفيذ',esc2(q.action))+sec('','مؤشر النجاح',esc2(q.success))+sec('','أدوات القياس والمتابعة',esc2(q.tools))+`<div class="sig"><div>الاسم<br><b>${esc2(t||'........................')}</b></div><div>الإدارة المدرسية<br><b>${esc2(p||'........................')}</b></div></div><div class="footer">خطة نافس العلاجية • الأسبوع ${week} • تقرير يجمع مهارات الأسبوع المختارة</div>`;
          return await NAFS_PDF_REMEDIAL.download($('pdfReport'),'خطة-نافس-العلاجية-الأسبوع-'+week+'.pdf');
        }
      };
    },350);
  }
  const timer=setInterval(()=>{if(typeof window.pdf==='function'&&$('indicators')){clearInterval(timer);installPdf()}},40);
})();