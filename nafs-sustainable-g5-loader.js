(()=>{
  if(window.__NAFS_G45_SUSTAINABLE_BOOT)return;
  window.__NAFS_G45_SUSTAINABLE_BOOT=true;
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
    return true;
  };
  const load=(src,done)=>{const s=document.createElement('script');s.src=src;s.onload=done;s.onerror=done;document.head.appendChild(s)};
  load('nafs-g4-data.js?v=20261005-g4',()=>{
    load('nafs-g5-data.js?v=20261005-2',()=>{
      addGrades();
      let tries=0;
      const timer=setInterval(()=>{addGrades();if(++tries>30)clearInterval(timer)},100);
    });
  });
})();