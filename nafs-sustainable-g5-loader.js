(()=>{
  const load=()=>{
    if(window.__NAFS_G5_SUSTAINABLE_LOADED)return;
    window.__NAFS_G5_SUSTAINABLE_LOADED=true;
    const s=document.createElement('script');
    s.src='nafs-g5-data.js?v=20261005';
    s.onload=()=>{
      const grade=document.getElementById('grade');
      if(!grade)return;
      if(![...grade.options].some(o=>o.value==='g5')){
        const opt=new Option('الصف الخامس الابتدائي','g5');
        const g6=[...grade.options].find(o=>o.value==='g6');
        grade.insertBefore(opt,g6||null);
      }
      const sub=document.getElementById('sub');
      const outcome=document.getElementById('outcome');
      const subWrap=sub?.closest('.f');
      const outcomeWrap=outcome?.closest('.f');
      const note=document.querySelector('.note');
      const sync=()=>{
        const is5=grade.value==='g5';
        if(subWrap)subWrap.style.display=is5?'none':'';
        if(outcomeWrap)outcomeWrap.style.display=is5?'none':'';
        if(note)note.textContent=is5?'اختر المجال ثم المهارات مباشرة، وبعدها إجراءات وأنشطة الاستدامة وأدوات القياس والمتابعة.':'اختر المهارات ثم إجراءات وأنشطة الاستدامة وأدوات القياس والمتابعة التي تريد ظهورها في التقرير.';
      };
      grade.addEventListener('change',()=>setTimeout(sync,0));
      sync();
    };
    document.head.appendChild(s);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();