// Owner-only question-bank access. Keeps the questions table closed to direct browser reads/writes.
loadSkills=async function(){
  const {data,error}=await db.rpc('owner_list_skills');
  if(error){console.error(error);toast('تعذر تحميل المهارات');return}
  skills=data||[];fillSkillOptions();
};
loadQuestions=async function(){
  const text=$('questionSearch').value.trim(),section=$('sectionFilter').value,status=$('statusFilter').value;
  const {data,error}=await db.rpc('owner_list_questions',{p_offset:questionPage*pageSize,p_limit:pageSize,p_search:text||null,p_section:section||null,p_status:status||null});
  if(error){console.error(error);toast('تعذر تحميل الأسئلة');return}
  questions=data?.rows||[];const count=Number(data?.count||0);renderQuestions();
  $('pageLabel').textContent=`صفحة ${questionPage+1} — ${count} سؤال`;
  $('prevPage').disabled=questionPage===0;$('nextPage').disabled=(questionPage+1)*pageSize>=count;
};
saveQuestion=async function(e){
  e.preventDefault();const choiceInputs=[...document.querySelectorAll('.choiceText')],choices=choiceInputs.map(i=>i.value.trim());
  const correctIndex=Number(document.querySelector('[name=correctChoice]:checked')?.value);
  if(new Set(choices).size!==choices.length)return setMessage('questionMessage','يجب ألا تتكرر الخيارات.');
  const id=$('questionId').value;
  $('saveQuestion').disabled=true;
  const {error}=await db.rpc('owner_save_question',{p_id:id?Number(id):null,p_section:$('questionSection').value,p_skill_id:Number($('questionSkill').value),p_difficulty:$('questionDifficulty').value,p_question_text:$('questionText').value.trim(),p_choices:choices,p_correct_answer:choices[correctIndex],p_explanation:$('questionExplanation').value.trim(),p_status:$('questionStatus').value});
  $('saveQuestion').disabled=false;if(error){console.error(error);return setMessage('questionMessage',`تعذر الحفظ: ${error.message}`)}
  $('questionDialog').close();toast(id?'تم تحديث السؤال':'تمت إضافة السؤال');await refreshAll();
};
deleteQuestion=async function(id){
  if(!confirm('هل تريد حذف هذا السؤال نهائيًا؟ إذا استُخدم في محاولة سابقة فقد يتعذر حذفه.'))return;
  const {error}=await db.rpc('owner_delete_question',{p_id:Number(id)});if(error){console.error(error);return toast(`تعذر الحذف: ${error.message}`)}
  toast('تم حذف السؤال');await refreshAll();
};