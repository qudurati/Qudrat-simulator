(()=>{
  const s=document.createElement('style');
  s.id='nafs-select-normalize';
  s.textContent=`select{color:#111827!important;-webkit-text-fill-color:#111827!important;font-size:16px!important;min-height:44px!important;padding-top:10px!important;padding-bottom:10px!important}`;
  document.head.appendChild(s);

  const normalizeText=(v)=>String(v||'')
    .replace(/العلوم الطبيعية/g,'العلوم')
    .replace(/الصف\s*الثالث\s*المتوسط\s*[\(（]?\s*(?:التاسع|9|٩)\s*[\)）]?/g,'الثالث متوسط')
    .replace(/الثالث\s*متوسط\s*[\(（]?\s*(?:التاسع|9|٩)\s*[\)）]?/g,'الثالث متوسط')
    .replace(/الثالث\s*المتوسط\s*[\(（]?\s*(?:التاسع|9|٩)\s*[\)）]?/g,'الثالث متوسط');

  const normalize=()=>{
    document.querySelectorAll('option').forEach(el=>{
      const t=normalizeText(el.textContent);
      if(el.textContent!==t) el.textContent=t;
    });
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0 && el.textContent){
        const t=normalizeText(el.textContent);
        if(el.textContent!==t) el.textContent=t;
      }
    });
  };

  normalize();
  new MutationObserver(normalize).observe(document.documentElement,{childList:true,subtree:true,characterData:true});

  const oldPrint=window.print;
  window.print=function(){normalize();return oldPrint.apply(window,arguments)};
})();