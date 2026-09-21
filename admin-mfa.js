(()=>{
  const MFA_KEY='qudrat_owner_mfa_verified_at';
  const MFA_GRACE_MS=60*60*1000;
  const card=()=>document.querySelector('#authScreen .authCard');
  const normalizeOtp=value=>String(value??'')
    .replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/\D/g,'')
    .slice(0,6);
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
      const verifiedAt=Number(sessionStorage.getItem(MFA_KEY)||0);
      if(verifiedAt&&Date.now()-verifiedAt<MFA_GRACE_MS)return true;
      sessionStorage.removeItem(MFA_KEY);
      const box=showBox(`<hr style="margin:22px 0;border:0;border-top:1px solid #e5e7eb"><h2>رمز التحقق عبر البريد</h2><p class="muted">جارٍ إرسال رمز تحقق إلى بريد المالك <b dir="ltr">${email}</b>.</p><form id="ownerEmailCodeForm" hidden><label>رمز التحقق<input id="ownerEmailCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9٠-٩۰-۹]{6}" minlength="6" maxlength="6" placeholder="أدخل الرمز المكون من 6 أرقام" required></label><button class="primary wide" type="submit">تحقق ودخول</button></form><button class="textButton" id="ownerResendEmailCode" type="button" hidden>إرسال رمز جديد</button><p class="formMessage" id="ownerMfaMessage" role="status">جارٍ إرسال الرمز...</p><button class="textButton" id="ownerMfaLogout" type="button">إلغاء وتسجيل الخروج</button>`);
      const msg=box.querySelector('#ownerMfaMessage');
      const resendBtn=box.querySelector('#ownerResendEmailCode');
      const form=box.querySelector('#ownerEmailCodeForm');
      const codeInput=box.querySelector('#ownerEmailCode');
      let attempts=0;
      let sending=false;
      box.querySelector('#ownerMfaLogout').onclick=async()=>{sessionStorage.removeItem(MFA_KEY);await db.auth.signOut();location.reload()};
      const sendCode=async()=>{
        if(sending)return false;
        sending=true;msg.textContent='جارٍ إرسال الرمز...';resendBtn.disabled=true;
        const {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:false}});
        sending=false;
        if(error){console.error('Owner OTP send error',error);msg.textContent='تعذر إرسال الرمز إلى البريد. حاول مرة أخرى.';resendBtn.hidden=false;resendBtn.disabled=false;return false}
        attempts=0;codeInput.disabled=false;form.querySelector('button[type="submit"]').disabled=false;
        msg.textContent='تم إرسال الرمز. استخدم أحدث رسالة وصلتك؛ أي رمز أقدم لن يعمل.';form.hidden=false;resendBtn.hidden=false;resendBtn.disabled=false;codeInput.value='';codeInput.focus();return true;
      };
      resendBtn.onclick=sendCode;
      await sendCode();
      return await new Promise(resolve=>{
        form.onsubmit=async e=>{
          e.preventDefault();
          const btn=e.submitter,token=normalizeOtp(codeInput.value);
          codeInput.value=token;
          if(token.length!==6){msg.textContent='أدخل رمز التحقق المكون من 6 أرقام.';return}
          msg.textContent='جارٍ التحقق...';btn.disabled=true;
          const {data,error}=await db.auth.verifyOtp({email,token,type:'email'});
          if(error||!data?.session){
            console.error('Owner OTP verify error',error);
            attempts+=1;
            if(attempts>=5){msg.textContent='تم تجاوز 5 محاولات. اضغط «إرسال رمز جديد» ثم استخدم أحدث رسالة فقط.';codeInput.disabled=true;btn.disabled=true;resendBtn.hidden=false;resendBtn.disabled=false;return}
            const expired=/expired/i.test(error?.message||'');
            msg.textContent=expired?`انتهت صلاحية الرمز. أرسل رمزًا جديدًا. متبقي ${5-attempts} محاولات.`:`الرمز غير صحيح. تأكد من استخدام أحدث رسالة وصلتك. متبقي ${5-attempts} محاولات.`;
            btn.disabled=false;codeInput.select();return;
          }
          sessionStorage.setItem(MFA_KEY,String(Date.now()));
          msg.textContent='تم التحقق بنجاح.';resolve(true);
        };
      });
    }catch(err){
      console.error('Owner email verification error',err);
      const box=showBox('<h2>تعذر تشغيل التحقق عبر البريد</h2><p class="formMessage">سجّل الخروج ثم حاول مرة أخرى.</p><button class="textButton" id="ownerMfaLogout" type="button">تسجيل الخروج</button>');
      box.querySelector('#ownerMfaLogout').onclick=async()=>{sessionStorage.removeItem(MFA_KEY);await db.auth.signOut();location.reload()};
      return false;
    }
  };
})();