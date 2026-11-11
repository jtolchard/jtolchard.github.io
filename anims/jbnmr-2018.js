/* Proton-detected (H)CCH: tiny fully protonated biosolids, identifiable side chains.
   Tolchard et al., J. Biomol. NMR 70, 177–185 (2018), Figs 1,3,4; Table 1.
   Rotor, fibrils, magnetization transfer and Tyr side chain are schematic.
   Y281 Hδ/Hε slice positions (7.1/6.8 ppm) follow Fig. 4; carbon contour
   positions and widths are approximate redrawings, not digitized spectra.
   Motion illustrates transfer stages and MAS, not real physical timescales. */
(function(){
  'use strict';
  const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const at=(s,a,b)=>ease((s-a)/(b-a)),lerp=(a,b,u)=>a+(b-a)*u;
  function label(ctx,th,t,x,y,align='left',col=th.soft){Anim.label(ctx,th,t,x,y,align,col);}
  function caption(ctx,th,long,short,w,pad,y,col=th.ink){label(ctx,th,Anim.measure(ctx,th,long)<=w-2*pad?long:short,pad,y,'left',col);}
  function line(ctx,pts,col,lw=1.4){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function arrow(ctx,x0,y0,x1,y1,col,lw=1.2){
    line(ctx,[[x0,y0],[x1,y1]],col,lw);const a=Math.atan2(y1-y0,x1-x0),r=4;
    line(ctx,[[x1-r*Math.cos(a-.5),y1-r*Math.sin(a-.5)],[x1,y1],[x1-r*Math.cos(a+.5),y1-r*Math.sin(a+.5)]],col,lw);
  }
  function fibrils(ctx,th,cx,cy,sc){
    // Illustrative HET-s beta-solenoid, following the stacked strand/loop
    // silhouette of the supplied reference panel e; not an atomic model.
    const height=sc*5.5,width=sc*2.4,rows=11,gap=height/(rows-1);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.09);
    // Receding strands and turns form the far edge of the solenoid.
    ctx.save();ctx.globalAlpha*=.8;
    for(let i=0;i<rows;i++){
      const y=-height/2+i*gap;
      // Grey ribbon face recedes behind the black front-facing strand.
      ctx.fillStyle=th.muted;ctx.beginPath();
      ctx.moveTo(-width*.4,y-gap*.08);ctx.lineTo(width*.43,y-gap*.44);
      ctx.lineTo(width*.43,y-gap*.25);ctx.lineTo(-width*.4,y+gap*.08);ctx.closePath();ctx.fill();
      if(i<rows-1){
        ctx.strokeStyle=th.soft;ctx.lineWidth=Math.max(1,sc*.07);ctx.beginPath();
        ctx.moveTo(width*.43,y-gap*.35);
        ctx.bezierCurveTo(width*.68,y-gap*.5,width*.68,y+gap*.45,width*.40,y+gap*.65);ctx.stroke();
      }
    }
    ctx.restore();
    // Broad parallel beta-strand arrows face left, with visible connecting loops.
    for(let i=0;i<rows;i++){
      const y=-height/2+i*gap,waist=1-.12*Math.sin(i*.5),left=-width*.5*waist,right=width*.46*waist;
      const thick=gap*.25,head=width*.20;
      ctx.fillStyle=th.ink;ctx.beginPath();ctx.moveTo(right,y-thick*.55);
      ctx.lineTo(left+head,y-thick*.55);ctx.lineTo(left+head,y-thick*1.3);
      ctx.lineTo(left,y);ctx.lineTo(left+head,y+thick*1.3);
      ctx.lineTo(left+head,y+thick*.55);ctx.lineTo(right,y+thick*.55);ctx.closePath();ctx.fill();
      // A fine grey edge distinguishes the ribbon face and its returning turn.
      line(ctx,[[left+head,y-thick*.55],[right,y-thick*.55]],th.soft,Math.max(.6,sc*.025));
      if(sc>15&&i<rows-1){
        ctx.save();ctx.globalAlpha*=.28;ctx.setLineDash([1,2]);
        for(const u of [-.22,.02,.24])line(ctx,[[width*u,y+thick],[width*u,y+gap-thick]],th.muted,.8);
        ctx.restore();
      }
      if(i<rows-1){
        ctx.strokeStyle=th.ink;ctx.lineWidth=Math.max(1,sc*.075);ctx.beginPath();
        ctx.moveTo(left,y);ctx.bezierCurveTo(left-width*.08,y+gap*.52,right+width*.15,y+gap*.20,right,y+gap*.87);ctx.stroke();
      }
    }
    ctx.restore();
  }
  function rotor(ctx,th,cx,cy,length,s) {
    // Same cylinder, packed sample, travelling stripes and drive cap as the
    // cell-free amyloid animation; retain this paper's 1 mm / 70 kHz labels.
    const L=length*.5,r=length*.12,a=54.736*Math.PI/180;
    const spin=s*1.5,fill=1,sample=th.fid;
    const ax = Math.sin(a), ay = -Math.cos(a), px = Math.cos(a), py = Math.sin(a), rot = Math.atan2(py, px);
    const e1 = [cx + ax * L, cy + ay * L], e2 = [cx - ax * L, cy - ay * L];
    const side = (u, s) => [lerp(e2[0], e1[0], u) + px * r * s, lerp(e2[1], e1[1], u) + py * r * s];
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(...side(0, 1)); ctx.lineTo(...side(1, 1)); ctx.lineTo(...side(1, -1)); ctx.lineTo(...side(0, -1)); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(e2[0], e2[1], r, r * 0.32, rot, 0, TAU); ctx.fill(); ctx.stroke();
    if (fill > 0.01) {                                     // the packed sample, seen through the wall
      const u0 = 0.12, u1 = lerp(0.12, 0.8, fill);
      ctx.save();ctx.globalAlpha *= 0.28;
      ctx.fillStyle = sample;
      ctx.beginPath(); ctx.moveTo(...side(u0, 0.72)); ctx.lineTo(...side(u1, 0.72)); ctx.lineTo(...side(u1, -0.72)); ctx.lineTo(...side(u0, -0.72)); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if (spin !== null) {                                   // stripes that travel round it as it spins
      for (let k = 0; k < 8; k++) {
        const phi = spin + (k * TAU) / 8, depth = Math.sin(phi);
        if (depth <= 0) continue;
        const off = Math.cos(phi) * 0.96;
        const keep = ctx.globalAlpha;
        ctx.globalAlpha = keep * (0.25 + 0.75 * depth);
        ctx.strokeStyle = k % 4 === 0 ? th.spec : th.muted; ctx.lineWidth = k % 4 === 0 ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(...side(0.1, off)); ctx.lineTo(...side(0.9, off)); ctx.stroke();
        ctx.globalAlpha = keep;
      }
    }
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(e1[0], e1[1], r, r * 0.32, rot, 0, TAU); ctx.fill(); ctx.stroke();
    const keep = ctx.globalAlpha;                         // the drive cap
    ctx.globalAlpha = keep * 0.85; ctx.fillStyle = th.spec;
    ctx.beginPath(); ctx.ellipse(e1[0] + ax * 3, e1[1] + ay * 3, r * 0.82, r * 0.26, rot, 0, TAU); ctx.fill();
    ctx.globalAlpha = keep;
    return { e1, e2 };
  }

  function opening(ctx,w,h,s,th,pad){
    caption(ctx,th,s<2.5?'An insoluble, fully protonated biosolid sample':'Can we identify its side-chain proton signals?',s<2.5?'An insoluble biosolid sample':'Identify side-chain protons?',w,pad,pad+6);
    fibrils(ctx,th,w*.25,h*.46,Math.min(w*.056,h*.095));
    arrow(ctx,w*.43,h*.46,w*.51,h*.46,th.muted);
    rotor(ctx,th,w*.72,h*.46,w*.31,s);
    label(ctx,th,'1 mm rotor',w*.72,h*.69,'center',th.ink);
    caption(ctx,th,'Fully protonated HET-s amyloid fibrils','HET-s · fully protonated',w,pad,h-pad-26);
    caption(ctx,th,'≈ 0.5 mg sample · 70 kHz MAS','≈ 0.5 mg · 70 kHz MAS',w,pad,h-pad-7,th.ink);
  }
  function pulseSequence(ctx,w,h,stage,th,pad,acquisitionTime){
    const small=w<350,x=pad+25,pw=w-pad-x,yC=h*.25,yH=h*.38,bh=Math.max(11,h*.045);
    const X=u=>x+u*pw;
    label(ctx,th,'¹³C',pad,yC-bh*.5,'left',th.soft);label(ctx,th,'¹H',pad,yH-bh*.5,'left',th.soft);
    for(const y of [yC,yH])line(ctx,[[x,y],[x+pw,y]],th.muted,1);
    function block(a,b,y,name,active){
      ctx.save();ctx.fillStyle=active?th.spec:th.rule;ctx.globalAlpha*=active?.25:.7;ctx.fillRect(X(a),y-bh,(b-a)*pw,bh);ctx.restore();
      ctx.strokeStyle=active?th.spec:th.muted;ctx.lineWidth=active?1.5:1;ctx.strokeRect(X(a),y-bh,(b-a)*pw,bh);
      if(small){
        const fontSize=9,maxWidth=(b-a)*pw-3;
        ctx.save();ctx.font=fontSize+'px '+th.mono;ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillStyle=active?th.ink:th.soft;
        if(ctx.measureText(name).width<=maxWidth)ctx.fillText(name,(X(a)+X(b))/2,y-bh/2);
        ctx.restore();
      }else if(Anim.measure(ctx,th,name)<(b-a)*pw-2)label(ctx,th,name,(X(a)+X(b))/2,y-bh/2,'center',active?th.ink:th.soft);
    }
    block(0,.13,yC,'CP',stage===0);block(0,.13,yH,'CP',stage===0);
    block(.15,.32,yC,small?'BABA':'BABA exc',stage===1);
    block(.40,.57,yC,small?'BABA':'BABA rec',stage===3);
    block(.15,.57,yH,'TPPM',false);
    label(ctx,th,'t₁',X(.36),yC-bh/2,'center',stage===2?th.spec:th.soft);
    ctx.save();ctx.globalAlpha*=.7;ctx.fillStyle=stage===4?th.spec:th.muted;ctx.fillRect(X(.585),yC-bh-3,Math.max(3,pw*.02),yH-yC+bh+6);ctx.restore();
    block(.62,.70,yH,'HORROR',stage===4);
    block(.70,.78,yH,'TPPM',false);
    block(.78,.86,yC,'CP',stage===6);block(.78,.86,yH,'CP',stage===6);
    block(.86,1,yC,'WALTZ',stage===7);
    label(ctx,th,'t₂',X(.70),yC-bh/2,'center',stage===5?th.spec:th.soft);
    // Reveal the detected proton FID only during t3 acquisition.
    if(stage===7){
      const acquired=at(acquisitionTime,17.3,19.1),pts=[];
      const count=Math.ceil(acquired*88);
      for(let i=0;i<=count;i++){
        const u=Math.min(i/88,acquired);
        pts.push([X(.87+u*.13),yH-Math.sin(u*TAU*4)*Math.exp(-u*3)*bh*.7]);
      }
      line(ctx,pts,th.spec,1.8);
    }
  }
  function pathway(ctx,w,h,s,th,pad){
    const stage=s<8.4?0:s<10?1:s<11.2?2:s<12.6?3:s<13.8?4:s<15.5?5:s<17.3?6:7;
    const texts=[
      ['CP: transfer proton magnetization to carbon','CP: ¹H → ¹³C'],
      ['BABA excitation: create carbon DQ coherence','BABA: excite carbon DQ'],
      ['t₁: evolve the summed carbon chemical shift','t₁: carbon-shift sum'],
      ['BABA reconversion: recover carbon magnetization','BABA: reconvert carbon DQ'],
      ['PFG + HORROR: suppress residual proton signals','Filter residual ¹H signals'],
      ['t₂: evolve carbon single-quantum coherence','t₂: carbon SQ evolution'],
      ['CP: transfer carbon magnetization to proton','CP: ¹³C → ¹H'],
      ['t₃: detect protons with carbon decoupling','t₃: detect the proton']
    ];
    caption(ctx,th,...texts[stage],w,pad,pad+6);
    pulseSequence(ctx,w,h,stage,th,pad,s);
    const xs=[w*.14,w*.38,w*.62,w*.86],y=h*(w<260?.61:.67),r=Math.max(10,Math.min(16,w*.038));
    for(let i=0;i<3;i++)line(ctx,[[xs[i]+r,y],[xs[i+1]-r,y]],th.rule,1.6);
    const nuclei=w<350?['H','C','C','H']:['¹H','¹³C','¹³C','¹H'],names=['Hα','Cα','Cβ','Hβ'];
    xs.forEach((x,i)=>{
      const active=stage===0?i<=1:stage>=1&&stage<=3?i===1||i===2:stage<=5?i===2:i>=2;
      const col=active?th.spec:th.muted;
      ctx.fillStyle=th.surface;ctx.strokeStyle=col;ctx.lineWidth=active?2:1;
      ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();
      label(ctx,th,nuclei[i],x,y,'center',col);label(ctx,th,names[i],x,y+r+14,'center',col);
    });
    const bracketY=y-r-12;
    const dq=stage>=1&&stage<=3;
    if(w>=260){
      line(ctx,[[xs[1],bracketY+5],[xs[1],bracketY],[xs[2],bracketY],[xs[2],bracketY+5]],dq?th.spec:th.rule);
      if(dq)label(ctx,th,w<350?'DQ: Cα + Cβ':'DQ: δCα + δCβ',(xs[1]+xs[2])/2,bracketY-12,'center',th.spec);
    }
    ctx.fillStyle=th.spec;
    const barY=y+r+5;
    function mark(x){
      const half=Math.max(5,w*.016);
      line(ctx,[[x-half,barY],[x+half,barY]],th.spec,3);
    }
    if(stage===0)mark(lerp(xs[0],xs[1],at(s,7.4,8.4)));
    else if(stage===1){mark(xs[1]);mark(xs[2]);}
    else if(stage===2){
      // A joined underline denotes shared DQ coherence, not spatial transport.
      const half=Math.max(5,w*.016),mid=(xs[1]+xs[2])/2,u=at(s,10,11.2);
      line(ctx,[[xs[1]-half,barY],[lerp(xs[1]+half,mid,u),barY]],th.spec,3);
      line(ctx,[[lerp(xs[2]-half,mid,u),barY],[xs[2]+half,barY]],th.spec,3);
    }
    else if(stage===3){
      const half=Math.max(5,w*.016),u=at(s,11.2,12.6);
      line(ctx,[[lerp(xs[1]-half,xs[2]-half,u),barY],[xs[2]+half,barY]],th.spec,3);
    }
    else if(stage<=5)mark(xs[2]);
    else if(stage===6)mark(lerp(xs[2],xs[3],at(s,15.5,17.3)));
    else mark(xs[3]);
    caption(ctx,th,'(H)CCH · two carbon dimensions, proton detection','(H)CCH · proton detection',w,pad,h-pad-7,th.soft);
  }
  function tyrosine(ctx,th,cx,cy,size,delta,epsilon){
    const R=size*.42;
    const vertices=Array.from({length:6},(_,i)=>[cx+Math.sin(i*TAU/6)*R,cy-Math.cos(i*TAU/6)*R]);
    line(ctx,vertices.concat([vertices[0]]),th.ink,1.6);
    for(let i=0;i<6;i+=2){const a=vertices[i],b=vertices[(i+1)%6];line(ctx,[[lerp(cx,a[0],.77),lerp(cy,a[1],.77)],[lerp(cx,b[0],.77),lerp(cy,b[1],.77)]],th.ink,1);}
    line(ctx,[[cx,cy-R],[cx,cy-R-size*.18]],th.ink);
    label(ctx,th,'OH',cx,cy-R-size*.29,'center',th.ink);
    line(ctx,[[cx,cy+R],[cx,cy+R+size*.20],[cx-size*.15,cy+R+size*.33]],th.ink);
    for(const [index,name,level,col] of [[2,'Hδ',delta,th.fid],[1,'Hε',epsilon,th.spec]]){
      const p=vertices[index],end=[cx+(p[0]-cx)*1.47,cy+(p[1]-cy)*1.47];
      line(ctx,[p,end],level>0?col:th.muted,1.4);
      label(ctx,th,name,end[0]+7,end[1],'left',level>0?col:th.muted);
      if(level>0){ctx.save();ctx.globalAlpha*=level;ctx.fillStyle=col;ctx.beginPath();ctx.arc(...p,Math.max(2.5,size*.035),0,TAU);ctx.fill();ctx.restore();}
    }
  }
  function slices(ctx,th,x,y,pw,ph,s){
    const gap=pw<140?24:34,each=(ph-gap)/2;
    const data=[{H:7.1,C:133.5,DQ:[251,259],col:th.fid,at:18.5,name:'Hδ'},
      {H:6.8,C:117.5,DQ:[251,276.5],col:th.spec,at:21,name:'Hε'}];
    data.forEach((d,i)=>{
      const yy=y+i*(each+gap),reveal=at(s,d.at,d.at+1.2);
      ctx.strokeStyle=th.rule;ctx.lineWidth=1;ctx.strokeRect(x,yy,pw,each);
      label(ctx,th,pw<140?`${d.name} ${d.H.toFixed(1)} ppm`:`${d.name} · ¹H ${d.H.toFixed(1)} ppm`,x,yy-9,'left',d.col);
      ctx.save();ctx.globalAlpha*=reveal;ctx.strokeStyle=d.col;ctx.lineWidth=1.1;
      const Y=v=>yy+(v-244)/40*each;
      for(const q of d.DQ)for(const f of [1,.72,.43]){ctx.beginPath();ctx.ellipse(x+pw*.54,Y(q),Math.max(1.5,pw*.07*f),Math.max(1.5,each*.075*f),0,0,TAU);ctx.stroke();}
      if(pw>170){
        label(ctx,th,String(d.DQ[0]),x+pw-5,Y(d.DQ[0]),'right');
        label(ctx,th,String(d.DQ[1]),x+pw-5,Y(d.DQ[1]),'right');
      }
      ctx.restore();
      if(pw>=140)label(ctx,th,`${d.C.toFixed(1)}`,x+pw*.54,yy+each+10,'center');
    });
    if(pw>150){label(ctx,th,'¹³C SQ / ppm',x+pw,y+ph+26,'right');label(ctx,th,'¹³C DQ',x+pw,y-26,'right');}
  }
  function result(ctx,w,h,s,th,pad){
    s-=3.5;
    caption(ctx,th,s<20?'The measurements identify the protons':s<24?'Aromatic side chains become accessible':'Y281: aromatic proton signals identified',s<20?'The spectrum identifies them':s<24?'Aromatic side-chain signals':'Y281: aromatic protons',w,pad,pad+6);
    const d=at(s,18.5,19.7),e=at(s,21,22.2);
    const cx=w*.23,cy=h*.48,size=w*.19;
    tyrosine(ctx,th,cx,cy,size,d,e);
    label(ctx,th,'Y281',cx,h*.76,'center',th.ink);
    const x=w*.56,y=pad+(w<350?40:47),pw=w-pad-8-x,ph=h-pad-(w<350?34:50)-y;
    slices(ctx,th,x,y,pw,ph,s);
    if(w>=350){
      ctx.save();ctx.globalAlpha*=at(s,22.3,23.2)*(1-at(s,26,27));ctx.setLineDash([3,4]);
      line(ctx,[[x,y+ph*.18],[cx+size*.45,cy+size*.20]],th.fid,1);
      line(ctx,[[x,y+ph*.78],[cx+size*.45,cy-size*.20]],th.spec,1);ctx.restore();
    }
    ctx.save();ctx.globalAlpha*=at(s,22.5,23.5);
    caption(ctx,th,'Aromatic side-chain assignments from a fully protonated sample','Fully protonated side chains',w,pad,h-pad-7,th.soft);ctx.restore();
  }
  Anim.register('jbnmr-2018',function(ctx,w,h,t,th){
    ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
    const s=t%33.5,pad=Math.max(12,Math.round(w*.034));
    for(const [a,b,draw] of [[0,7,opening],[7,19.5,pathway],[19.5,33.5,result]]){
      const alpha=at(s,a,a+.5)*(1-at(s,b-.5,b));
      if(alpha>0){ctx.save();ctx.globalAlpha=alpha;draw(ctx,w,h,s,th,pad);ctx.restore();}
    }
    ctx.globalAlpha=1;
  },{loop:33.5,still:28.5});
})();
