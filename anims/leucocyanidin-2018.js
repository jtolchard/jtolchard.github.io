/* Leucocyanidin stereoisomers: the picture asks, NMR and MS/MS answer.
   Zhang et al., J. Agric. Food Chem. 66, 351–358 (2018), Figs 4,7; Table 1.
   Molecular diagrams and spectra are schematic redrawings. NMR positions and
   H4 splittings use the reported values at 400 MHz. MS/MS heights approximate
   Fig. 7; they are not digitized quantitative measurements. */
(function () {
  'use strict';
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x*x*(3-2*x); };
  const at = (t,a,b) => ease((t-a)/(b-a));
  const CYCLE = 30;
  const A = [[-1.7,-.5],[-.85,-1],[0,-.5],[0,.5],[-.85,1],[-1.7,.5]];
  const C = [[0,-.5],[.85,-1],[1.7,-.5],[1.7,.5],[.85,1],[0,.5]];
  const B = [[2.55,-1],[2.55,-2],[3.4,-2.5],[4.25,-2],[4.25,-1],[3.4,-.5]];
  const MS = {
    cis: [[127,1],[139,.69],[155,.23],[163,.42],[271,.37],[289,.22],[327,.34]],
    trans: [[127,1],[155,.65],[163,.34],[271,.30],[289,.27],[327,.035]]
  };
  function label(ctx,th,text,x,y,align='left',col=th.soft) {
    Anim.label(ctx,th,text,x,y,align,col);
  }
  function caption(ctx,th,long,short,w,pad,y,col=th.ink) {
    label(ctx,th,Anim.measure(ctx,th,long)<=w-2*pad ? long : short,pad,y,'left',col);
  }
  function line(ctx,pts,col,lw=1.4) {
    ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath();
    pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.stroke();
  }
  // Both compounds retain 2,3-trans geometry; only the C4 wedge changes.
  function molecule(ctx,th,cx,cy,sc,cis,col,highlight=0) {
    const P=([x,y])=>[cx+(x-1.1)*sc,cy+(y+.3)*sc];
    const bond=(p,q,c=th.ink)=>line(ctx,[P(p),P(q)],c,Math.max(1,sc*.055));
    [A,B].forEach(r=>{
      line(ctx,r.concat([r[0]]).map(P),th.ink,Math.max(1,sc*.055));
      const mx=r.reduce((v,p)=>v+p[0],0)/6, my=r.reduce((v,p)=>v+p[1],0)/6;
      for(let i=0;i<6;i+=2) {
        const p=r[i],q=r[(i+1)%6];
        bond([p[0]*.76+mx*.24,p[1]*.76+my*.24],[q[0]*.76+mx*.24,q[1]*.76+my*.24]);
      }
    });
    // Leave space for the heterocyclic oxygen.
    bond(C[0],[.63,-.87]); bond([1.08,-.87],C[2]);
    line(ctx,C.slice(2).concat([C[0]]).map(P),th.ink,Math.max(1,sc*.055));
    const atom=(text,p,c=th.ink)=>{
      const q=P(p); ctx.font=`${Math.max(9,Math.min(13,sc*.55))}px ${th.mono}`;
      ctx.fillStyle=c; ctx.textAlign='center'; ctx.textBaseline='middle';ctx.fillText(text,...q);
    };
    atom('O',[.85,-1]);
    const wedge=(p,q,solid,c)=>{
      const x=P(p),y=P(q),dx=y[0]-x[0],dy=y[1]-x[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
      const half=sc*.12;
      if(solid) {
        ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(...x);ctx.lineTo(y[0]+nx*half,y[1]+ny*half);ctx.lineTo(y[0]-nx*half,y[1]-ny*half);ctx.closePath();ctx.fill();
      } else for(let i=1;i<=6;i++) {
        const u=i/7;line(ctx,[[x[0]+dx*u-nx*half*u,x[1]+dy*u-ny*half*u],[x[0]+dx*u+nx*half*u,x[1]+dy*u+ny*half*u]],c,Math.max(.8,sc*.045));
      }
    };
    wedge(C[2],B[0],false,th.ink);
    [[A[0],[-2.22,-.80],[-2.52,-.97],'HO'],[A[4],[-.85,1.49],[-.85,1.82],'OH'],
      [B[3],[4.74,-2.28],[5.03,-2.45],'OH'],[B[4],[4.74,-.72],[5.03,-.55],'OH']].forEach(([p,q,r,t])=>{bond(p,q);atom(t,r);});
    wedge(C[3],[2.23,.81],true,col);atom('OH',[2.58,1.01],col);
    wedge(C[4],[.85,1.52],cis,col);atom('OH',[.85,1.87],col);
    if(highlight>0) {
      // Underline the C4 hydroxyl without enclosing the atom or its wedge bond.
      ctx.save();ctx.globalAlpha*=highlight;
      const q=P([.85,1.87]),half=Math.max(6,sc*.27);
      const offset=Math.max(9,Math.min(13,sc*.55))*.5+4;
      line(ctx,[[q[0]-half,q[1]+offset],[q[0]+half,q[1]+offset]],col,1.8);
      ctx.restore();
    }
  }
  function opening(ctx,w,h,s,th,pad) {
    caption(ctx,th,s<3?'One hydroxyl group changes orientation':'Same composition. How do we tell them apart?',s<3?'One OH changes orientation':'Same formula. Which isomer?',w,pad,pad+6);
    const sc=w*.045, y=h*.49;
    molecule(ctx,th,w*.25,y,sc,false,th.spec,at(s,.6,1.4));
    molecule(ctx,th,w*.75,y,sc,true,th.fid,at(s,.6,1.4));
    label(ctx,th,'3,4-trans',w*.25,h*.77,'center',th.spec);
    label(ctx,th,'3,4-cis',w*.75,h*.77,'center',th.fid);
    // Acidic epimerization produces the second configuration; no atom is added.
    ctx.globalAlpha=at(s,1,1.7);
    const yArrow=w<350 ? Math.max(pad+27,h*.24) : h*.32;
    line(ctx,[[w*.44,yArrow],[w*.56,yArrow]],th.muted);
    line(ctx,[[w*.54,yArrow-3],[w*.56,yArrow],[w*.54,yArrow+3]],th.muted);
    if(w>=350) label(ctx,th,'acid',w*.5,yArrow-14,'center',th.muted);
    caption(ctx,th,'Acidic epimerization at C4','Epimerization at C4',w,pad,h-pad-6,th.soft);
    ctx.globalAlpha=1;
  }
  function nmr(ctx,w,h,s,th,pad) {
    caption(ctx,th,s<13?'NMR: which configuration did we make?':'NMR confirms distinct configurations',s<13?'Which configuration? Ask NMR':'NMR assigns each isomer',w,pad,pad+6);
    const tiny=w<260;
    const x0=tiny?w*.38:w*.47,x1=w-pad,y0=pad+43,y1=h-pad-39;
    const X=ppm=>x0+(5.04-ppm)/.29*(x1-x0);
    const rows=[{cis:true,col:th.fid,shift:4.85,J:4.04,y:y0+(y1-y0)*.36},
      {cis:false,col:th.spec,shift:4.96,J:7.96,y:y0+(y1-y0)*.91}];
    rows.forEach((r,i)=>{
      const cy=r.y-(y1-y0)*.12;
      if(!tiny) {
        molecule(ctx,th,w*.23,cy,w*.030,r.cis,r.col,0);
        label(ctx,th,r.cis?'3,4-cis':'3,4-trans',w*.23,r.y+21,'center',r.col);
      } else label(ctx,th,r.cis?'cis':'trans',pad,r.y-9,'left',r.col);
      line(ctx,[[x0,r.y],[x1,r.y]],th.rule,1);
      const growth=at(s,8+i*1.3,9.3+i*1.3),amp=(y1-y0)*.27;
      const split=r.J/400/2;
      ctx.save();ctx.beginPath();ctx.rect(x0,y0-12,x1-x0,y1-y0+16);ctx.clip();
      const pts=[];
      for(let j=0;j<=800;j++) {
        const ppm=5.04-j/800*.29;
        const signal=[r.shift-split,r.shift+split].reduce((sum,c)=>sum+1/(1+((ppm-c)/.00085)**2),0);
        pts.push([X(ppm),r.y-signal*amp*growth]);
      }
      line(ctx,pts,r.col,1.5);ctx.restore();
      if(w>=350) label(ctx,th,`H4 · ${r.shift.toFixed(2)} ppm`,r.cis?x0:x1,r.y-amp-16,r.cis?'left':'right',r.col);
      ctx.globalAlpha=at(s,11.2,12.1);
      // Coupling annotations occupy the empty side of each doublet, leaving
      // the baseline and the shared ppm axis unobstructed on the main views.
      if(w>=350) label(ctx,th,`J₃,₄ = ${r.J.toFixed(2)} Hz`,r.cis?x0:x1,r.y-amp+11,r.cis?'left':'right',r.col);
      else label(ctx,th,`J₃,₄ = ${r.J.toFixed(2)} Hz`,x1,r.y+(tiny?12:16),'right',r.col);
      ctx.globalAlpha=1;
    });
    label(ctx,th,'¹H NMR · H4',x0,pad+29,'left',th.soft);
    if(w>=350) {
      const axisY=rows[1].y+10;
      line(ctx,[[x0,axisY],[x1,axisY]],th.muted,1);
      for(const ppm of [5.0,4.9,4.8]) {
        const x=X(ppm);line(ctx,[[x,axisY],[x,axisY+4]],th.muted,1);
        label(ctx,th,ppm.toFixed(1),x,axisY+14,'center');
      }
      label(ctx,th,'ppm',x1,axisY+14,'right');
    } // Phone layouts omit ppm tick values to keep the doublets and J labels clear.
    ctx.globalAlpha=at(s,12.5,13.4);
    caption(ctx,th,'Chemical shifts and coupling reveal stereochemistry','NMR: shifts + coupling',w,pad,h-pad-5,th.ink);
    ctx.globalAlpha=1;
  }
  function mass(ctx,w,h,s,th,pad) {
    const phone=w<350;
    caption(ctx,th,s<20?'Same precursor ion: [M + H]⁺ at m/z 307':s<25?'MS/MS: different fragment fingerprints':'MS/MS distinguishes the stereoisomers',s<20?'Both start at m/z 307':s<25?'Different MS/MS fingerprints':'MS/MS tells them apart',w,pad,pad+6);
    const x0=pad+26,x1=w-pad-8,top=pad+38,bot=h-pad-37;
    const X=m=>x0+(m-110)/230*(x1-x0), rowH=(bot-top)/2;
    ['cis','trans'].forEach((key,i)=>{
      const col=key==='cis'?th.fid:th.spec,base=top+rowH*(i+1)-10,amp=rowH*.65;
      label(ctx,th,'3,4-'+key,x1,base-amp-8,'right',col);
      line(ctx,[[x0,base-amp-4],[x0,base],[x1,base]],th.rule,1);
      const growth=at(s,17.5+i*.7,19.3+i*.7);
      MS[key].forEach(([m,intensity])=>{
        const diagnostic=m===139||m===155||m===163;
        const bright=diagnostic && s>20;
        const x=X(m),y=base-intensity*amp*growth;
        line(ctx,[[x,base],[x,y]],bright?col:th.muted,bright?2:1.2);
        const identified=(m===139 && key==='cis') || (m===163 && key==='cis') || (m===155 && key==='trans');
        if(growth>.9 && (identified || (!phone && (m===271 || m===289)))) {
          label(ctx,th,String(m),x,y-9,'center',bright?col:th.muted);
        }
      });
      if(i===1) {
        for(const m of phone?[150,250]:[150,200,250,300]) {
          if(m>=110) label(ctx,th,String(m),X(m),base+13,'center');
        }
        label(ctx,th,'m/z',x1,base+13,'right');
      }
    });
    ctx.globalAlpha=at(s,20,21);
    caption(ctx,th,'139: cis only · 155/163: relative intensities reverse','m/z 139: cis only',w,pad,h-pad-12,th.ink);
    ctx.globalAlpha=1;
  }
  Anim.register('leucocyanidin-2018',function(ctx,w,h,t,th){
    ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
    const s=t%CYCLE,pad=Math.max(12,Math.round(w*.034));
    const scenes=[[0,7,opening],[7,16,nmr],[16,30,mass]];
    for(const [a,b,draw] of scenes) {
      const alpha=at(s,a,a+.45)*(1-at(s,b-.45,b));
      if(alpha>0){ctx.save();ctx.globalAlpha=alpha;draw(ctx,w,h,s,th,pad);ctx.restore();}
    }
    ctx.globalAlpha=1;
  },{loop:CYCLE,still:26});
})();
