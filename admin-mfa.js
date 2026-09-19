(()=>{
  const card=()=>document.querySelector('#authScreen .authCard');
  function showBox(html){
    document.body.classList.remove('authenticated');
    document.getElementById('authScreen').hidden=false;
    document.getElementById('app').hidden=true;
    const c=card();
    c.querySelector('#loginForm')?.setAttribute('hidden','');
    c.querySelector('#firstAccountBtn')?.setAttribute('hidden','');
    let box=document.getElementById('ownerMfaBox');
    if(!box){box=document.createElement('div');box.id='ownerMfaBox';c.appendChild(box)}
    box.innerHTML=html;
    return box;
  }
  window.requireOwnerMfa=async(db,session)=>{
    try{
      const email=session?.user?.email;
      if(!email)throw new Error('Missing owner email');
      const box=showBox(`<hr style="margin:22px 0;border:0;border-top:1px solid #e5e7eb"><h2>رمز التحقق عبر البريد</h2><p class="muted">سنرسل رمز تحقق إلى بريد المالك <b dir="ltr">${email}</b>.</p><button class="primary wide" id="ownerSendEmailCode" type="button">إرسال رمز التحقق</button><form id="ownerEmailCodeForm" hidden><label>رمز التحقق<input id="ownerEmailCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" maxlength="8" placeholder="أدخل الرمز" required></label><button class="primary wide" type="submit">تحقق ودخول</button></form><p class="formMessage" id="ownerMfaMessage" role="status"></p><button class="textButton" id="ownerMfaLogout" type="button">إلغاء وتسجيل الخروج</button>`);
      const msg=box.querySelector('#ownerMfaMessage');
      const sendBtn=box.querySelector('#ownerSendEmailCode');
      const form=box.querySelector('#ownerEmailCodeForm');
      box.querySelector('#ownerMfaLogout').onclick=async()=>{await db.auth.signOut();location.reload()};
      sendBtn.onclick=async()=>{
        msg.textContent='جارٍ إرسال الرمز...';sendBtn.disabled=true;
        const {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:false}});
        if(error){msg.textContent='تعذر إرسال الرمز إلى البريد. حاول مرة أخرى.';sendBtn.disabled=false;return}
        msg.textContent='تم إرسال الرمز إلى بريدك.';form.hidden=false;sendBtn.textContent='إعادة إرسال الرمز';sendBtn.disabled=false;box.querySelector('#ownerEmailCode').focus();
      };
      return await new Promise(resolve=>{
        form.onsubmit=async e=>{
          e.preventDefault();const btn=e.submitter,token=box.querySelector('#ownerEmailCode').value.trim();
          msg.textContent='جارٍ التحقق...';btn.disabled=true;
          const {data,error}=await db.auth.verifyOtp({email,token,type:'email'});
          if(error||!data?.session){msg.textContent='الرمز غير صحيح أو انتهت صلاحيته.';btn.disabled=false;box.querySelector('#ownerEmailCode').select();return}
          msg.textContent='تم التحقق بنجاح.';resolve(true);
        };
      });
    }catch(err){
      console.error('Owner email verification error',err);
      const box=showBox('<h2>تعذر تشغيل التحقق عبر البريد</h2><p class="formMessage">سجّل الخروج ثم حاول مرة أخرى.</p><button class="textButton" id="ownerMfaLogout" type="button">تسجيل الخروج</button>');
      box.querySelector('#ownerMfaLogout').onclick=async()=>{await db.auth.signOut();location.reload()};
      return false;
    }
  };
})();