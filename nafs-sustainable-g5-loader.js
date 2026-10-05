(()=>{
  if(window.__NAFS_G5_SUSTAINABLE_BOOT)return;
  window.__NAFS_G5_SUSTAINABLE_BOOT=true;
  const addGrade=()=>{
    const grade=document.getElementById('grade');
    if(!grade)return false;
    if(![...grade.options].some(o=>o.value==='g5')){
      const opt=new Option('الصف الخامس الابتدائي','g5');
      const g6=[...grade.options].find(o=>o.value==='g6');
      grade.insertBefore(opt,g6||null);
    }
    const sub=document.getElementById('sub'), outcome=document.getElementById('outcome');
    const subWrap=sub?.closest('.f'), outcomeWrap=outcome?.closest('.f'), note=document.querySelector('.note');
    const sync=()=>{
      const is5=grade.value==='g5';
      if(subWrap)subWrap.style.display=is5?'none':'';
      if(outcomeWrap)outcomeWrap.style.display=is5?'none':'';
      if(note)note.textContent=is5?'اختر المجال ثم المهارات مباشرة، وبعدها إجراءات وأنشطة الاستدامة وأدوات القياس والمتابعة.':'اختر المهارات ثم إجراءات وأنشطة الاستدامة وأدوات القياس والمتابعة التي تريد ظهورها في التقرير.';
    };
    if(!grade.dataset.g5sync){grade.dataset.g5sync='1';grade.addEventListener('change',()=>setTimeout(sync,0));}
    sync();
    return true;
  };
  const start=()=>{
    const s=document.createElement('script');
    s.src='nafs-g5-data.js?v=20261005-2';
    s.onload=()=>{
      addGrade();
      let tries=0;
      const timer=setInterval(()=>{addGrade();if(++tries>30)clearInterval(timer)},100);
    };
    document.head.appendChild(s);
  };
  start();
})();