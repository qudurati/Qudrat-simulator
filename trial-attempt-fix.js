(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('mode')!=='devquick') return;
  let claimed=false;
  let claiming=null;

  async function claimTrial(){
    if(claimed) return true;
    if(claiming) return claiming;
    claiming=(async()=>{
      try{
        const db=window.QudratAccess?.client;
        if(!db) return false;
        const {data,error}=await db.rpc('claim_free_trial',{p_kind:'mock'});
        if(error) throw error;
        const row=Array.isArray(data)?data[0]:data;
        if(row && row.allowed===false){
          alert('لقد استخدمت تجربتي المحاكاة المجانيتين. اشترك للاستمرار.');
          location.replace('dashboard.html');
          return false;
        }
        claimed=true;
        return true;
      }catch(e){
        console.error('free trial claim failed',e);
        return false;
      }finally{claiming=null;}
    })();
    return claiming;
  }

  function protectFinishButton(btn){
    if(!btn) return;
    btn.addEventListener('click',async function(e){
      if(claimed || btn.dataset.trialClaimPassed==='1') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const ok=await claimTrial();
      if(!ok) return;
      btn.dataset.trialClaimPassed='1';
      btn.click();
    },true);
  }

  protectFinishButton(document.getElementById('endTopBtn'));
  protectFinishButton(document.getElementById('endBottomBtn'));

  const next=document.getElementById('nextBtn');
  if(next){
    next.addEventListener('click',async function(e){
      if(claimed || next.dataset.trialClaimPassed==='1') return;
      const isLast=typeof questions!=='undefined' && typeof current!=='undefined' && current===questions.length-1;
      if(!isLast) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const ok=await claimTrial();
      if(!ok) return;
      next.dataset.trialClaimPassed='1';
      next.click();
    },true);
  }
})();