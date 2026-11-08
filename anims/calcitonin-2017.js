/* Calcitonin: solution behaviour, rigid aggregates and NMR-based packing models.
   Kamgar-Parsi et al., Isr. J. Chem. 57, 634–650 (2017), Figs 4–5.
   All peptide cartoons and spectral traces are illustrative redrawings, not
   digitized data or atomic structures. Solution and solid-state spectra are
   separate experiments; their amplitudes are not quantitatively comparable.
   The final pH-dependent models illustrate one possible aggregation pathway. */
(function(){
  'use strict';
  const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const at=(s,a,b)=>ease((s-a)/(b-a)),lerp=(a,b,u)=>a+(b-a)*u;
  function label(ctx,th,t,x,y,align='left',col=th.soft){Anim.label(ctx,th,t,x,y,align,col);}
  function caption(ctx,th,long,short,w,pad,y,col=th.ink){label(ctx,th,Anim.measure(ctx,th,long)<=w-2*pad?long:short,pad,y,'left',col);}
  function line(ctx,p,c,lw=1.4){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function peptide(ctx,th,cx,cy,L,beta=0,dir=1,phase=0){
    ctx.save();ctx.translate(cx,cy);ctx.scale(dir,1);
    const sw=Math.max(1.6,L*.012);
    // Residues 1–7: an N-terminal loop closed by the conserved disulfide.
    ctx.strokeStyle=th.ink;ctx.lineWidth=sw;ctx.beginPath();
    ctx.moveTo(-L*.47,-L*.035);ctx.bezierCurveTo(-L*.66,-L*.18,-L*.58,L*.17,-L*.34,L*.015);
    ctx.bezierCurveTo(-L*.30,0,-L*.28,0,-L*.25,0);ctx.stroke();
    line(ctx,[[-L*.47,-L*.035],[-L*.34,L*.015]],th.green,Math.max(1.5,L*.011));
    for(const p of [[-L*.47,-L*.035],[-L*.34,L*.015]]){ctx.fillStyle=th.green;ctx.beginPath();ctx.arc(...p,Math.max(1.5,L*.012),0,TAU);ctx.fill();}
    // A representative central helix changes into an extended strand.
    const end=lerp(.14,.25,beta)*L;
    ctx.save();ctx.globalAlpha*=1-beta;
    const pts=[];
    for(let i=0;i<=100;i++){
      const u=i/100;pts.push([lerp(-L*.25,end,u),Math.sin(u*TAU*4)*Math.sin(Math.PI*u)*L*.065]);
    }
    line(ctx,pts,th.spec,Math.max(2,L*.019));ctx.restore();
    if(beta>0){
      ctx.save();ctx.globalAlpha*=beta;ctx.fillStyle=th.spec;
      ctx.beginPath();ctx.moveTo(-L*.25,-L*.027);ctx.lineTo(end-L*.09,-L*.027);ctx.lineTo(end-L*.09,-L*.064);ctx.lineTo(end,0);ctx.lineTo(end-L*.09,L*.064);ctx.lineTo(end-L*.09,L*.027);ctx.lineTo(-L*.25,L*.027);ctx.closePath();ctx.fill();ctx.restore();
    }
    const tail=[];
    for(let i=0;i<=40;i++){
      const u=i/40;tail.push([lerp(end,L*.52,u),Math.sin(u*TAU*1.4+phase)*L*.026*Math.sin(Math.PI*u)**2]);
    }
    line(ctx,tail,th.ink,sw);ctx.restore();
  }
  function opening(ctx,w,h,s,th,pad){
    caption(ctx,th,'Calcitonin: a polypeptide hormone','Calcitonin · peptide hormone',w,pad,pad+6);
    let y=pad+32;
    for(const text of ['A potential therapeutic',
      'Aggregation limits aqueous formulation stability']){
      const words=text.split(' ');let row='';
      for(const word of words){
        const next=row?row+' '+word:word;
        if(row&&Anim.measure(ctx,th,next)>w-2*pad){
          label(ctx,th,row,pad,y,'left',th.soft);y+=15;row=word;
        }else row=next;
      }
      label(ctx,th,row,pad,y,'left',th.soft);y+=20;
    }
    const L=w*.63,cy=(y+h-pad-24)*.5;

    peptide(ctx,th,w*.52,cy,L,0,1,s*.25);
    if(w>=350){
      label(ctx,th,'N-terminal loop',w*.14,cy+L*.15,'left');
      label(ctx,th,'Central helix',w*.53,cy-L*.13,'center',th.spec);
    }
    caption(ctx,th,'Cys1–Cys7 disulfide bridge','Cys1–Cys7 disulfide bridge',w,pad,h-pad-7,th.green);
  }

  const HPEAKS=[[8.7,.25],[8.35,.35],[8.03,.28],[7.5,.12],[6.92,.10],[4.6,.38],[4.25,.28],[3.96,.36],[3.52,.18],[3.13,.22],[2.97,.40],[2.35,.15],[2.09,.27],[1.74,.66],[1.49,.28],[1.23,.53],[.91,1],[.79,.48]];
  const CPEAKS=[[175,1],[172,.65],[168,.25],[139,.15],[132,.31],[127,.27],[120,.20],[110,.16],[73,.14],[66,.26],[59,.36],[55,.41],[50,.18],[44,.24],[39,.18],[34,.40],[29,.35],[24,.67],[21,.83],[17,.21]];
  function trace(ctx,list,X,base,amp,width,col,growth=1){
    const pts=[];
    for(let i=0;i<=600;i++){
      const u=i/600,v=list.max-u*(list.max-list.min);
      const val=list.peaks.reduce((a,[p,h])=>a+h*Math.exp(-.5*((v-p)/width)**2),0);
      pts.push([X(v),base-amp*val*growth]);
    }
    line(ctx,pts,col,1.25);
  }
  function phoneNmr(ctx,w,h,s,th,pad){
    label(ctx,th,'Aggregation study:',pad,pad+6,'left',th.ink);
    const change=at(s,12,12.5),x=pad+4,pw=w-2*pad-8;
    const base1=h*.49,base2=h*.78,amp=Math.max(10,(base1-pad-53)*.85);
    for(const solid of [false,true]){
      const alpha=solid?change:1-change;
      if(alpha<=0)continue;
      ctx.save();ctx.globalAlpha*=alpha;
      label(ctx,th,solid?'¹³C solid-state NMR · fibrils':'¹H solution NMR',pad,pad+30,'left',th.soft);
      const X=v=>x+(solid?(200-v)/200:(10-v)/10)*pw;
      for(const base of [base1,base2])line(ctx,[[x,base+5],[x+pw,base+5]],th.rule,1);
      label(ctx,th,solid?'Rigid residues · CP':'Soluble',x,pad+51,'left',solid?th.ink:th.fid);
      trace(ctx,{max:solid?200:10,min:0,peaks:solid?CPEAKS:HPEAKS},X,base1,amp,solid?1.3:.025,solid?th.ink:th.fid,solid?1:at(s,7.4,8.5));
      ctx.save();ctx.globalAlpha*=solid?1:at(s,8.7,10.3);
      label(ctx,th,solid?'Mobile residues · INEPT':'Aggregated',x,h*.61,'left',solid?th.fid:th.spec);
      if(solid)line(ctx,[[x,base2],[x+pw,base2]],th.fid,1.2);
      else trace(ctx,{max:10,min:0,peaks:HPEAKS},X,base2,amp,.055,th.spec,.045);
      ctx.restore();
      label(ctx,th,solid?'CP reveals rigid aggregates':'Signal loss: slow tumbling',pad,h-pad-7,'left',th.soft);
      ctx.restore();
    }
  }
  function nmr(ctx,w,h,s,th,pad){
    const phone=w<350;
    if(phone){phoneNmr(ctx,w,h,s,th,pad);return;}
    const heading=s<12?'Aggregation study: solution signals fade':'Aggregation study: NMR detects rigid aggregates';
    if(Anim.measure(ctx,th,heading)<=w-2*pad){
      label(ctx,th,heading,pad,pad+6,'left',th.ink);
    }else{
      label(ctx,th,'Aggregation study:',pad,pad+6,'left',th.ink);
      caption(ctx,th,s<12?'Solution signals fade':'NMR detects rigid aggregates',s<12?'Solution signals fade':'NMR detects rigidity',w,pad,pad+21);
    }
    const left=pad+4,right=w*.55,pw=w*.41-pad,top=pad+63,bot=h-pad-37;
    const base1=top+(bot-top)*.32,base2=top+(bot-top)*.86,amp=(bot-top)*.24;
    label(ctx,th,phone?'Solution NMR':'¹H solution NMR',left,top-30,'left',th.soft);
    label(ctx,th,phone?'Fibril NMR':'¹³C solid-state · fibrils',right,top-30,'left',th.soft);
    const XH=v=>left+(10-v)/10*pw,XC=v=>right+(200-v)/200*pw;
    const ag=at(s,8.7,11.5),cp=at(s,11.8,13.7);
    for(const x of [left,right])for(const base of [base1,base2])line(ctx,[[x,base+6],[x+pw,base+6]],th.rule,1);
    label(ctx,th,'Soluble',left,top-9,'left',th.fid);
    trace(ctx,{max:10,min:0,peaks:HPEAKS},XH,base1,amp,.025,th.fid,at(s,7.4,8.5));
    ctx.save();ctx.globalAlpha*=ag;
    label(ctx,th,'Aggregated',left,(base1+base2)*.5,'left',th.spec);
    trace(ctx,{max:10,min:0,peaks:HPEAKS},XH,base2,amp,.055,th.spec,.045);ctx.restore();
    ctx.save();ctx.globalAlpha*=cp;
    label(ctx,th,phone?'Rigid: CP':'Rigid residues · CP',right,top-9,'left',th.ink);
    trace(ctx,{max:200,min:0,peaks:CPEAKS},XC,base1,amp,1.3,th.ink,1);
    label(ctx,th,phone?'Mobile: INEPT':'Mobile residues · INEPT',right,(base1+base2)*.5,'left',th.fid);
    // Fig. 4B shows no detectable mobile-residue INEPT signal in this fibril sample.
    line(ctx,[[right,base2],[right+pw,base2]],th.fid,1.2);ctx.restore();
    if(!phone){
      for(const v of [8,4])label(ctx,th,String(v),XH(v),base2+18,'center');
      for(const v of [180,100])label(ctx,th,String(v),XC(v),base2+18,'center');
      label(ctx,th,'ppm',left+pw,base2+18,'right');label(ctx,th,'ppm',right+pw,base2+18,'right');
    }
    ctx.save();ctx.globalAlpha*=at(s,14,15);
    caption(ctx,th,'Weak solution signals reflect slow tumbling; CP reveals rigidity','Slow tumbling → rigid aggregate',w,pad,h-pad-7,th.soft);ctx.restore();
  }
  function models(ctx,w,h,s,th,pad){
    const beta=at(s,19.5,22),split=at(s,22.5,24);
    caption(ctx,th,s<23?'NMR models: a central helix becomes a β-strand':'Fibril packing depends on pH',s<23?'Central helix → β-strand':'pH changes fibril packing',w,pad,pad+6);
    ctx.save();ctx.globalAlpha*=1-split;
    peptide(ctx,th,w*.52,h*.47,w*.63,beta,1,.2);
    if(w>=350)label(ctx,th,beta<.5?'Helix-rich model':'β-strand-rich model',w*.5,h*.70,'center',th.spec);
    ctx.restore();
    if(split>0){
      ctx.save();ctx.globalAlpha*=split;
      const L=w*.35,gap=Math.max(9,L*.19),cy=h*.51;
      const groups=[{cx:w*.27,pH:'pH 3.3',dirs:[1,1,-1],text:w>=350?'Parallel + antiparallel':'Mixed packing'},
        {cx:w*.75,pH:'pH 7.5',dirs:[1,-1,1],text:'Antiparallel'}];
      groups.forEach(g=>{
        label(ctx,th,g.pH,g.cx,pad+34,'center',th.ink);
        g.dirs.forEach((dir,i)=>peptide(ctx,th,g.cx,cy+(i-1)*gap,L,1,dir,0));
        // Intermolecular contacts connect the β-strands in the packing cartoons.
        ctx.save();ctx.globalAlpha*=.5;ctx.setLineDash([2,3]);
        for(let row=0;row<2;row++)for(let k=0;k<5;k++){
          const x=g.cx+(-.18+k*.075)*L;
          line(ctx,[[x,cy+(row-1)*gap+L*.045],[x,cy+row*gap-L*.045]],th.muted,.9);
        }
        ctx.restore();label(ctx,th,g.text,g.cx,h*.78,'center',th.soft);
      });ctx.restore();
    }
    caption(ctx,th,s<23?'Representative human-calcitonin models summarized in the review':'NMR-based models · one possible aggregation pathway',s<23?'Representative hCT models':'NMR models · possible pathway',w,pad,h-pad-7,th.soft);
  }
  Anim.register('calcitonin-2017',function(ctx,w,h,t,th){
    ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
    const s=t%32,pad=Math.max(12,Math.round(w*.034));
    for(const [a,b,draw] of [[0,7,opening],[7,18,nmr],[18,32,models]]){
      const alpha=at(s,a,a+.5)*(1-at(s,b-.5,b));
      if(alpha>0){ctx.save();ctx.globalAlpha=alpha;draw(ctx,w,h,s,th,pad);ctx.restore();}
    }
    ctx.globalAlpha=1;
  },{loop:32,still:27});
})();
