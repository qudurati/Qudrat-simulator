(function(){
  window.NAFS_DISTRIBUTE_18=function(sk,subject){
    const groups=Array.from({length:18},()=>[]);
    if(subject!=='reading'||sk.length>=18){
      sk.forEach((s,i)=>groups[i%18].push(s));
      return groups;
    }
    const reviewCount=18-sk.length;
    const reviewWeeks=new Set();
    for(let i=1;i<=reviewCount;i++){
      let pos=Math.round((i*19)/(reviewCount+1))-1;
      pos=Math.max(1,Math.min(16,pos));
      while(reviewWeeks.has(pos)&&pos<17)pos++;
      while(reviewWeeks.has(pos)&&pos>0)pos--;
      reviewWeeks.add(pos);
    }
    let skillIndex=0;
    for(let week=0;week<18;week++){
      if(!reviewWeeks.has(week)&&skillIndex<sk.length)groups[week].push(sk[skillIndex++]);
    }
    while(skillIndex<sk.length){
      const empty=groups.findIndex((g,i)=>g.length===0&&reviewWeeks.has(i));
      if(empty<0)break;
      reviewWeeks.delete(empty);
      groups[empty].push(sk[skillIndex++]);
    }
    return groups;
  };
})();