(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('mode')!=='devquick') return;

  function showInlineMessage(message){
    const questionText=document.getElementById('questionText');
    const answers=document.getElementById('answers');
    const status=document.getElementById('status');
    if(questionText) questionText.textContent='٨ أسئلة للتجربة المجانية';
    if(answers) answers.innerHTML='';
    if(status){
      status.textContent=message;
      status.style.display='block';
      status.style.marginTop='24px';
      status.style.padding='18px';
      status.style.border='1px solid #d8e0ea';
      status.style.borderRadius='12px';
      status.style.background='#fff';
      status.style.color='#b42318';
      status.style.fontSize='18px';
      status.style.lineHeight='1.8';
      status.style.textAlign='center';
    }
  }

  async function claimTrialOnStart(){
    try{
      const db=window.QudratAccess?.client;
      if(!db) throw new Error('تعذر الاتصال بحساب المستخدم');

      const {data,error}=await db.rpc('claim_free_trial',{p_kind:'simulation'});
      if(error) throw error;

      const row=Array.isArray(data)?data[0]:data;
      if(row && row.allowed===false){
        window.__QUDRAT_FREE_MOCK_BLOCKED__=true;
        showInlineMessage('لقد استخدمت تجربتي المحاكاة المجانيتين. اشترك للاستمرار في المحاكاة.');
        return;
      }

      window.__QUDRAT_FREE_MOCK_CLAIMED__=true;
    }catch(e){
      console.error('free trial start claim failed',e);
      window.__QUDRAT_FREE_MOCK_BLOCKED__=true;
      showInlineMessage('تعذر التحقق من المحاولة المجانية. حاول مرة أخرى.');
    }
  }

  claimTrialOnStart();
})();