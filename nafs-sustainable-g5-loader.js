(()=>{
  if(window.__NAFS_G45_SUSTAINABLE_BOOT)return;
  window.__NAFS_G45_SUSTAINABLE_BOOT=true;

  const fixWhatsApp=()=>{
    const links=[...document.querySelectorAll('a[href*="wa.me/966509599798"],a[href*="api.whatsapp.com"]')];
    links.forEach(a=>{
      a.style.setProperty('position','static','important');
      a.style.setProperty('inset','auto','important');
      a.style.setProperty('left','auto','important');
      a.style.setProperty('right','auto','important');
      a.style.setProperty('top','auto','important');
      a.style.setProperty('bottom','auto','important');
      a.style.setProperty('transform','none','important');
      a.style.setProperty('z-index','auto','important');
      a.style.setProperty('display','flex','important');
      a.style.setProperty('width','100%','important');
      a.style.setProperty('max-width','320px','important');
      a.style.setProperty('margin','18px auto 0','important');
      a.style.setProperty('justify-content','center','important');
      const card=document.querySelector('.wrap .card');
      if(card&&a.parentElement!==card)card.appendChild(a);
    });
  };

  const patchReport=()=>{
    if(window.__NAFS_G45_DOMAIN_REPORT_FIX||typeof window.sec!=='function')return;
    const originalSec=window.sec;
    window.sec=function(i,t,c,cl=''){
      const grade=document.getElementById('grade')?.value;
      if(t==='المجال والمسار'&&['g4','g5'].includes(grade)){
        const domain=document.getElementById('domain')?.value||'';
        return originalSec.call(this,i,t,typeof window.esc==='function'?window.esc(domain):domain,cl);
      }
      return originalSec.call(this,i,t,c,cl);
    };
    window.__NAFS_G45_DOMAIN_REPORT_FIX=true;
  };

  const addGrades=()=>{
    const grade=document.getElementById('grade');
    if(!grade)return false;
    if(![...grade.options].some(o=>o.value==='g4')){
      const opt=new Option('الصف الرابع الابتدائي','g4');
      const g5=[...grade.options].find(o=>o.value==='g5');
      const g6=[...grade.options].find(o=>o.value==='g6');
      grade.insertBefore(opt,g5||g6||null);
    }
    if(![...grade.options].some(o=>o.value==='g5')){
      const opt=new Option('الصف الخامس الابتدائي','g5');
      const g6=[...grade.options].find(o=>o.value==='g6');
      grade.insertBefore(opt,g6||null);
    }
    const sub=document.getElementById('sub'), outcome=document.getElementById('outcome');
    const subWrap=sub?.closest('.f'), outcomeWrap=outcome?.closest('.f'), note=document.querySelector('.note');
    const sync=()=>{
      const direct=['g4','g5'].includes(grade.value);
      if(subWrap)subWrap.style.display=direct?'none':'';
      if(outcomeWrap)outcomeWrap.style.display=direct?'none':'';
      if(note)note.textContent=direct?'اختر المجال ثم المهارات مباشرة، وبعدها إجراءات وأنشطة الاستدامة وأدوات القياس والمتابعة.':'اختر المهارات ثم إجراءات وأنشطة الاستدامة وأدوات القياس والمتابعة التي تريد ظهورها في التقرير.';
    };
    if(!grade.dataset.g45sync){grade.dataset.g45sync='1';grade.addEventListener('change',()=>setTimeout(sync,0));}
    sync();
    patchReport();
    fixWhatsApp();
    return true;
  };
  const observer=new MutationObserver(fixWhatsApp);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  const load=(src,done)=>{const s=document.createElement('script');s.src=src;s.onload=done;document.head.appendChild(s)};
  load('nafs-g4-data.js?v=20261005-g4-sustainable',()=>{
    load('nafs-g5-data.js?v=20261005-g5-sustainable',()=>{
      addGrades();
      let tries=0;
      const timer=setInterval(()=>{addGrades();patchReport();fixWhatsApp();if(++tries>30)clearInterval(timer)},100);
    });
  });
})();