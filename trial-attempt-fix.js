(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('mode')!=='devquick') return;

  async function claimTrialOnStart(){
    try{
      const db=window.QudratAccess?.client;
      if(!db) throw new Error('تعذر الاتصال بحساب المستخدم');

      const {data,error}=await db.rpc('claim_free_trial',{p_kind:'simulation'});
      if(error) throw error;

      const row=Array.isArray(data)?data[0]:data;
      if(row && row.allowed===false){
        alert('لقد استخدمت تجربتي المحاكاة المجانيتين. اشترك للاستمرار.');
        location.replace('dashboard.html');
        return;
      }

      window.__QUDRAT_FREE_MOCK_CLAIMED__=true;
    }catch(e){
      console.error('free trial start claim failed',e);
      alert('تعذر التحقق من المحاولة المجانية. حاول مرة أخرى.');
      location.replace('dashboard.html');
    }
  }

  claimTrialOnStart();
})();