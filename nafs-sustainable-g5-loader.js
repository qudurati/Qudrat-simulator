(()=>{
  if(window.__NAFS_G45_SUSTAINABLE_BOOT)return;
  window.__NAFS_G45_SUSTAINABLE_BOOT=true;

  const fixWhatsApp=()=>{
    const links=[...document.querySelectorAll('a[href*="wa.me/966509599798"],a[href*="api.whatsapp.com"]')];
    links.forEach(a=>{
      a.innerHTML='<svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16.04 4C9.42 4 4.04 9.3 4.04 15.83c0 2.3.68 4.54 1.96 6.45L4 28l5.92-1.93a12.1 12.1 0 0 0 6.11 1.66h.01c6.62 0 12-5.3 12-11.83C28.04 9.3 22.66 4 16.04 4Zm6.99 16.73c-.3.83-1.77 1.58-2.43 1.67-.62.09-1.4.13-2.26-.14-.52-.17-1.2-.39-2.06-.76-3.62-1.54-5.98-5.13-6.16-5.37-.18-.24-1.47-1.93-1.47-3.68 0-1.75.93-2.61 1.26-2.97.33-.36.72-.45.96-.45.24 0 .48 0 .69.01.22.01.52-.08.81.61.3.71 1.02 2.46 1.11 2.64.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.38.47-.54.63-.18.18-.37.38-.16.74.21.36.94 1.53 2.02 2.48 1.39 1.22 2.56 1.6 2.92 1.78.36.18.57.15.78-.09.21-.24.9-1.04 1.14-1.4.24-.36.48-.3.81-.18.33.12 2.1.98 2.46 1.16.36.18.6.27.69.42.09.15.09.86-.21 1.67Z"/></svg>';
      const css={position:'static',inset:'auto',left:'auto',right:'auto',top:'auto',bottom:'auto',transform:'none','z-index':'auto',display:'flex',width:'52px','min-width':'52px','max-width':'52px',height:'52px','min-height':'52px','max-height':'52px',padding:'0',margin:'18px 16px 8px auto','border-radius':'50%',background:'#25D366',color:'#fff','align-items':'center','justify-content':'center','box-shadow':'0 4px 12px rgba(37,211,102,.25)',overflow:'hidden'};
      Object.entries(css).forEach(([k,v])=>a.style.setProperty(k,v,'important'));
      const actions=document.querySelector('.actions');
      const target=actions?.closest('.card')||document.querySelector('.wrap .card')||document.querySelector('.wrap')||document.body;
      if(a.parentElement!==target)target.appendChild(a);
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
    sync();patchReport();fixWhatsApp();return true;
  };
  const observer=new MutationObserver(fixWhatsApp);observer.observe(document.documentElement,{childList:true,subtree:true});
  const load=(src,done)=>{const s=document.createElement('script');s.src=src;s.onload=done;document.head.appendChild(s)};
  load('nafs-g4-data.js?v=20261005-g4-sustainable',()=>{load('nafs-g5-data.js?v=20261005-g5-sustainable',()=>{addGrades();let tries=0;const timer=setInterval(()=>{addGrades();patchReport();fixWhatsApp();if(++tries>30)clearInterval(timer)},100);});});
})();