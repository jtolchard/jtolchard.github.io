/* Cell-free expression of hydrophobic yeast ATP-synthase subunits.
   Larrieu et al., Methods Mol. Biol. 1635, 57–90 (2017), Figs 1,4; Table 3.
   Production yield for g: 1.9 ± 0.6 mg/mL reaction mix, n=9 (Table 3).
   HMQC contours and SSP values are illustrative redrawings of Fig. 4;
   reactor, precipitate and micelle cartoons do not specify molecular stoichiometry.
   Helical elements are schematic, not a determined three-dimensional structure. */
(function(){
  'use strict';
  const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const at=(s,a,b)=>ease((s-a)/(b-a)),lerp=(a,b,u)=>a+(b-a)*u;
  const rand=Anim.seeded(201706);
  const CHAINS=Array.from({length:14},(_,i)=>({x:rand(),y:rand(),p:rand()*TAU}));
  const normal=()=>{let z=0;for(let i=0;i<6;i++)z+=rand();return (z-3)/.71;};
  const PEAKS=Array.from({length:78},()=>[Math.max(7.0,Math.min(8.8,8.0+normal()*.25)),Math.max(105,Math.min(126,118.7+normal()*3.1))]);
  PEAKS.push([8.52,106.8],[8.44,107.7],[8.02,108.1],[8.08,124.5],[7.9,125.6]);
  const SSP=Array.from({length:115},(_,i)=>{
    const n=i+1;
    if(n<7)return .35+n*.055;
    if(n<=21)return .72+rand()*.18;
    if(n<=33)return .91+rand()*.17;
    if(n<=48)return .72-(n-34)*.026+rand()*.08;
    if(n<=63)return 1.06-(n-49)*.018;
    if(n<=68)return .44-(n-64)*.07;
    if(n<=77)return .83+rand()*.13;
    if(n<=82)return .39-(n-78)*.045;
    if(n<=94)return 1.07-(n-83)*.017;
    if(n<=105)return .48+Math.sin(n)*.15+rand()*.12;
    return Math.max(-.05,.56-(n-106)*.068);
  });
  const HELICES=[[7,21],[23,41],[48,64],[68,77],[80,100]];
  function label(ctx,th,t,x,y,align='left',col=th.soft){Anim.label(ctx,th,t,x,y,align,col);}
  function caption(ctx,th,long,short,w,pad,y,col=th.ink){label(ctx,th,Anim.measure(ctx,th,long)<=w-2*pad?long:short,pad,y,'left',col);}
  function line(ctx,p,c,lw=1.4){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function arrow(ctx,x0,y0,x1,y1,c){const a=Math.atan2(y1-y0,x1-x0);line(ctx,[[x0,y0],[x1,y1]],c);line(ctx,[[x1-4*Math.cos(a-.5),y1-4*Math.sin(a-.5)],[x1,y1],[x1-4*Math.cos(a+.5),y1-4*Math.sin(a+.5)]],c);}
  function chain(ctx,th,cx,cy,size,phase=0,col=th.ink){
    const pts=[];
    for(let i=0;i<=45;i++){const u=i/45;pts.push([cx+Math.sin(u*TAU*2.7+phase)*size*.18,cy+(u-.5)*size]);}
    line(ctx,pts,col,Math.max(1.5,size*.045));
  }
  function pellet(ctx,th,cx,cy,size,u=1){
    CHAINS.forEach(p=>{ctx.save();ctx.globalAlpha*=u;const x=cx+(p.x-.5)*size,y=cy+(p.y-.5)*size*.38;chain(ctx,th,x,y,size*.36,p.p,th.ink);ctx.restore();});
  }
  function tubeBody(ctx,cx,cy,W,H){
    const top=cy-H*.5,shoulder=cy+H*.06,tip=cy+H*.5;
    ctx.beginPath();ctx.moveTo(cx-W*.47,top);ctx.lineTo(cx-W*.47,shoulder);
    ctx.quadraticCurveTo(cx-W*.44,shoulder+H*.08,cx-W*.09,tip-H*.025);
    ctx.quadraticCurveTo(cx,tip+H*.015,cx+W*.09,tip-H*.025);
    ctx.quadraticCurveTo(cx+W*.44,shoulder+H*.08,cx+W*.47,shoulder);
    ctx.lineTo(cx+W*.47,top);ctx.closePath();
  }
  // Hinged cap, moulded neck, graduations and a rounded conical base.
  // The liquid is clipped to the vessel and has a moving meniscus.
  function tube(ctx,th,cx,cy,W,H,level=0,s=0,turbidity=0){
    const top=cy-H*.5;
    tubeBody(ctx,cx,cy,W,H);ctx.fillStyle=th.surface;ctx.fill();
    if(level>0){
      const waterY=lerp(cy+H*.49,top+H*.10,level);
      ctx.save();tubeBody(ctx,cx,cy,W,H);ctx.clip();
      ctx.fillStyle=mix(th.bg,th.fid,.10+turbidity*.13);
      ctx.beginPath();ctx.moveTo(cx-W,cy+H);
      ctx.lineTo(cx-W,waterY);ctx.bezierCurveTo(cx-W*.2,waterY-2*Math.sin(s*3),cx+W*.2,waterY+2*Math.sin(s*3),cx+W,waterY);
      ctx.lineTo(cx+W,cy+H);ctx.closePath();ctx.fill();
      ctx.strokeStyle=th.fid;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,waterY,W*.43,W*.045,0,0,Math.PI);ctx.stroke();
      ctx.restore();
    }
    tubeBody(ctx,cx,cy,W,H);ctx.strokeStyle=th.soft;ctx.lineWidth=1.4;ctx.stroke();
    // Neck collar and open mouth.
    ctx.strokeStyle=th.ink;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.ellipse(cx,top,W*.53,W*.075,0,0,TAU);ctx.stroke();
    line(ctx,[[cx-W*.5,top+3],[cx+W*.5,top+3]],th.rule,1);
    // Flexible hinge and raised flip cap.
    line(ctx,[[cx-W*.50,top],[cx-W*.66,top-H*.08],[cx-W*.78,top-H*.10]],th.muted,1.3);
    ctx.save();ctx.translate(cx-W*.95,top-H*.15);ctx.rotate(-.55);
    ctx.fillStyle=th.surface;ctx.strokeStyle=th.soft;ctx.lineWidth=1.2;
    // Raised rim with a visible sidewall, recessed seal and opening tab.
    ctx.beginPath();ctx.moveTo(-W*.51,0);ctx.lineTo(-W*.51,W*.065);
    ctx.bezierCurveTo(-W*.40,W*.21,W*.40,W*.21,W*.51,W*.065);
    ctx.lineTo(W*.51,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,W*.51,W*.11,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,W*.39,W*.065,0,0,TAU);ctx.stroke();
    ctx.strokeStyle=th.muted;ctx.lineWidth=.8;
    ctx.beginPath();ctx.ellipse(0,W*.025,W*.30,W*.045,0,0,TAU);ctx.stroke();
    for(let i=-3;i<=3;i++){
      const x=i*W*.105;line(ctx,[[x,W*.105],[x,W*.14]],th.muted,.7);
    }
    ctx.strokeStyle=th.soft;ctx.lineWidth=1.1;
    ctx.beginPath();ctx.moveTo(-W*.49,-W*.025);ctx.lineTo(-W*.63,-W*.035);
    ctx.quadraticCurveTo(-W*.68,W*.055,-W*.58,W*.075);ctx.lineTo(-W*.49,W*.065);ctx.fill();ctx.stroke();
    ctx.restore();
    // Small moulded volume marks, no arbitrary numerical scale.
    for(let i=0;i<3;i++)line(ctx,[[cx+W*.25,top+H*(.20+i*.13)],[cx+W*.41,top+H*(.20+i*.13)]],th.muted,1);
  }
  function pipette(ctx,th,cx,cy,W,H,s,amount,colour,aspirate=false){
    if(amount<=0)return;
    ctx.save();ctx.globalAlpha*=amount;
    const tipY=cy-H*.03-(1-amount)*H*.35,px=cx+W*.05;
    const stemTop=Math.max(tipY-H*.70,cy-H*.60),shoulder=lerp(stemTop,tipY,.70);
    ctx.fillStyle=th.surface;ctx.strokeStyle=th.muted;ctx.lineWidth=1.1;
    ctx.beginPath();ctx.moveTo(px-W*.15,stemTop);ctx.lineTo(px+W*.15,stemTop);
    ctx.lineTo(px+W*.09,shoulder);ctx.lineTo(px+1,tipY);ctx.lineTo(px-1,tipY);ctx.lineTo(px-W*.09,shoulder);ctx.closePath();ctx.fill();ctx.stroke();
    line(ctx,[[px-W*.11,lerp(stemTop,tipY,.24)],[px+W*.11,lerp(stemTop,tipY,.24)]],colour,1.2);
    for(let i=0;i<3;i++){
      const phase=(s*2+i/3)%1,u=aspirate?1-phase:phase;ctx.fillStyle=colour;ctx.beginPath();
      ctx.ellipse(px,tipY+4+u*H*.14,Math.max(1.2,W*.025),Math.max(1.7,W*.04),0,0,TAU);ctx.fill();
    }
    ctx.restore();
  }
  function micelle(ctx,th,cx,cy,size,amount){
    ctx.save();ctx.globalAlpha*=amount;
    for(let i=0;i<28;i++){
      const a=i/28*TAU,hx=cx+Math.cos(a)*size*.44,hy=cy+Math.sin(a)*size*.39;
      line(ctx,[[hx,hy],[cx+Math.cos(a)*size*.29,cy+Math.sin(a)*size*.25]],th.fid,1.1);
      ctx.fillStyle=th.bg;ctx.strokeStyle=th.fid;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(hx,hy,Math.max(1.7,size*.022),0,TAU);ctx.fill();ctx.stroke();
    }
    chain(ctx,th,cx,cy,size*.83,.3,th.ink);
    ctx.restore();
  }
  // The continuous vessel → pellet → micelle workflow follows the visual
  // vocabulary of cellfree-amyloid-2022, with this chapter's P-CF chemistry.
  function mix(a,b,u){
    const rgb=c=>{if(c.startsWith('#'))return [0,2,4].map(i=>parseInt(c.slice(1+i,3+i),16));return (c.match(/[\d.]+/g)||[128,128,128]).slice(0,3).map(Number);};
    const p=rgb(a),q=rgb(b);return `rgb(${p.map((v,i)=>Math.round(lerp(v,q[i],u))).join(',')})`;
  }
  function layout(w,h,pad){
    const top=pad+31,bot=h-pad-32,ow=Math.min(w*.30,(bot-top)*.70);
    return {cx:w*.5,cy:(top+bot)/2,top,bot,ow,bw:ow*.58,bh:(bot-top)*.68};
  }
  function vessel(ctx,th,b){
    const {cx,cy,top,bot,ow,bw,bh}=b;
    ctx.beginPath();ctx.moveTo(cx-ow/2,top);ctx.lineTo(cx-ow/2,bot-ow*.35);
    ctx.quadraticCurveTo(cx-ow/2,bot,cx,bot);ctx.quadraticCurveTo(cx+ow/2,bot,cx+ow/2,bot-ow*.35);ctx.lineTo(cx+ow/2,top);
    ctx.fillStyle=mix(th.bg,th.spec,.07);ctx.fill();ctx.strokeStyle=th.ink;ctx.lineWidth=1.3;ctx.stroke();
    ctx.beginPath();ctx.roundRect(cx-bw/2,cy-bh/2,bw,bh,bw*.40);
    ctx.fillStyle=mix(th.bg,th.fid,.10);ctx.fill();ctx.strokeStyle=th.fid;ctx.lineWidth=1.2;ctx.stroke();
    for(const sign of [-1,1]){
      const yy=cy+sign*(bh/2+1);ctx.fillStyle=th.ink;ctx.fillRect(cx-bw*.42,yy-1,bw*.84,2);
      for(let i=-2;i<=2;i++)line(ctx,[[cx,yy],[cx+i*bw*.08,yy+sign*4]],th.ink,1);
    }
  }
  function plasmid(ctx,th,x,y,r){
    ctx.strokeStyle=th.green;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
    ctx.strokeStyle=th.fid;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,.4,1.8);ctx.stroke();
  }
  function ribosome(ctx,th,x,y,r){
    ctx.fillStyle=mix(th.bg,th.soft,.3);ctx.strokeStyle=th.soft;ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(x,y+r*.2,r,r*.65,-.2,0,TAU);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(x+r*.1,y-r*.55,r*.65,r*.4,.1,0,TAU);ctx.fill();ctx.stroke();
  }
  const RIBS=[[-.27,-.28],[.25,-.26],[-.25,.28],[.24,.30]];
  const madeAt=(p,b)=>[b.cx+(p.x-.5)*b.bw*.64,b.cy+(p.y-.5)*b.bh*.40];
  function synthesis(ctx,w,h,s,th,pad){
    const b=layout(w,h,pad),big=w>=350;
    if(s<4.5){
      const title='Methods: cell free synthesis of hydrophobic proteins';
      if(Anim.measure(ctx,th,title)<=w-2*pad)label(ctx,th,title,pad,pad+6,'left',th.ink);
      else {label(ctx,th,'Methods: cell free synthesis',pad,pad+6,'left',th.ink);label(ctx,th,'of hydrophobic proteins',pad,pad+22,'left',th.ink);}
    }
    else {
      label(ctx,th,big?'Cell-free synthesis':'Cell-free',pad,pad+6,'left',th.ink);
      const hours=Math.round(20*at(s,2.5,10.5));
      label(ctx,th,`28 °C · ${hours} h`,w-pad,pad+6,'right',th.fid);
    }
    vessel(ctx,th,b);
    // Plasmid DNA and extract ribosomes enter the reaction bag.
    const enter=at(s,.25,1.25),r=Math.max(3,b.bw*.075);
    ctx.save();ctx.globalAlpha*=enter;
    plasmid(ctx,th,b.cx,b.cy-b.bh*.38-(1-enter)*12,r);
    RIBS.forEach(([x,y])=>ribosome(ctx,th,b.cx+x*b.bw,b.cy+y*b.bh-(1-enter)*12,r));ctx.restore();
    // Labelled amino acids enter the feeding mix and diffuse into the bag.
    for(let i=0;i<12;i++){
      const side=i%2?1:-1,phase=(s*.16+i*.17)%1;
      const x=lerp(b.cx+side*(b.bw*.5+(b.ow-b.bw)*.28),b.cx+side*b.bw*.25,phase);
      const y=b.top+(b.bot-b.top)*(.18+(i%6)*.11)+Math.sin(s+i)*1.2;
      ctx.save();ctx.globalAlpha*=at(s,.2,1.2);ctx.fillStyle=th.fid;ctx.beginPath();ctx.arc(x,y,Math.max(1.3,b.ow*.015),0,TAU);ctx.fill();ctx.restore();
    }
    // Each chain grows from a ribosome and joins an irregular precipitate,
    // rather than the ordered fibril layers made in the 2022 animation.
    CHAINS.forEach((p,i)=>{
      const made=at(s,1.6+i*.22,2.4+i*.22),release=at(s,3+i*.22,5+i*.22);
      if(made<=0)return;
      const origin=RIBS[i%RIBS.length],target=madeAt(p,b);
      const x=lerp(b.cx+origin[0]*b.bw,target[0],release),y=lerp(b.cy+origin[1]*b.bh+6,target[1],release);
      ctx.save();ctx.globalAlpha*=made;chain(ctx,th,x,y,b.bw*.31*made,p.p,th.fid);ctx.restore();
    });
    // Compact keys sit beside the vessel, as in the companion animation.
    const ky=h-pad-58;
    plasmid(ctx,th,pad+3,ky,3);label(ctx,th,big?'plasmid DNA':'DNA',pad+12,ky,'left',th.green);
    ribosome(ctx,th,pad+3,ky+16,3.5);label(ctx,th,big?'E. coli extract':'extract',pad+12,ky+16,'left');
    const rx=b.cx+b.ow/2+7;
    label(ctx,th,'¹³C,¹⁵N',rx,b.top+12,'left',th.fid);
    label(ctx,th,big?'amino acids':'AA',rx,b.top+28,'left',th.fid);
    if(big){
      label(ctx,th,'Feeding mix',b.cx-b.ow/2-8,b.top+20,'right');
      const rx=Math.max(pad,b.cx-b.ow/2-12-Anim.measure(ctx,th,'Reaction mix')),ry=b.cy-10;
      label(ctx,th,'Reaction mix',rx,ry,'left',th.fid);
      arrow(ctx,rx+Anim.measure(ctx,th,'Reaction mix')+7,ry,b.cx-b.bw/2,b.cy+5,th.fid);
    }
    ctx.save();
    if(s<8)caption(ctx,th,'Example: ATP synthase subunit g','Example: subunit g',w,pad,h-pad-7,th.ink);
    ctx.globalAlpha*=at(s,8,9);
    caption(ctx,th,s<10?'Protein accumulates in precipitate mode':'g: 1.9 ± 0.6 mg/mL reaction mix (n = 9)',s<10?'Subunit g: precipitate':'g: 1.9 ± 0.6 mg/mL (n=9)',w,pad,h-pad-7,s<10?th.soft:th.ink);ctx.restore();
  }
  function harvest(ctx,w,h,s,th,pad){
    caption(ctx,th,'Collect and wash the protein precipitate','Collect and wash the pellet',w,pad,pad+6);
    const b=layout(w,h,pad),cx=w*.28,cy=h*.47,W=w*.153,H=h*.40;
    const fall=at(s,12.5,13.7),fade=1-at(s,12,12.8);
    ctx.save();ctx.globalAlpha*=fade;vessel(ctx,th,b);ctx.restore();
    const water=at(s,13.7,14.15)*(1-at(s,14.45,15.0));
    tube(ctx,th,cx,cy,W,H,water*.70,s);
    CHAINS.forEach((p,i)=>{
      const start=madeAt(p,b),end=[cx+(p.x-.5)*W*.35,cy+H*.33+(p.y-.5)*H*.09];
      chain(ctx,th,lerp(start[0],end[0],fall),lerp(start[1],end[1],fall),lerp(b.bw*.31,W*.27,fall),p.p,th.fid);
    });
    const dip=at(s,13.6,13.95)*(1-at(s,14.65,15.0));
    pipette(ctx,th,cx,cy,W,H,s,dip,th.fid,s>14.4);
    label(ctx,th,'Washed pellet',cx,h*.76,'center');
    const qx=w*.72,qy=h*.39;
    label(ctx,th,'Subunit g yield',qx,qy,'center',th.soft);
    ctx.save();ctx.font=`600 12px ${th.mono}`;ctx.fillStyle=th.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('≈2 mg/mL',qx,qy+20);ctx.restore();
    label(ctx,th,'reaction mix',qx,qy+38,'center',th.soft);
    caption(ctx,th,'Collect the material, then choose its membrane mimetic','Next: solubilize in LMPG',w,pad,h-pad-7);
  }
  function solubilize(ctx,w,h,s,th,pad){
    caption(ctx,th,s<17?'Add LMPG to the washed precipitate':'LMPG-solubilized sample for solution NMR',s<17?'Add LMPG to the pellet':'LMPG sample → solution NMR',w,pad,pad+6);
    const cx=w*.28,cy=h*.47,W=w*.153,H=h*.40,move=at(s,15.6,18.9);
    const fill=at(s,15.25,16.35),resuspend=at(s,16,17.3);
    tube(ctx,th,cx,cy,W,H,fill*.74,s,fill*(1-move));
    // LMPG lysolipids in the added liquid: an open headgroup and one acyl tail.
    // Particles are schematic and deliberately absent from the preceding aqueous wash.
    if(fill>0){
      const liquidTop=lerp(cy+H*.49,cy-H*.40,fill*.74);
      ctx.save();tubeBody(ctx,cx,cy,W,H);ctx.clip();
      ctx.globalAlpha*=fill*.65;
      CHAINS.slice(0,w<350?7:11).forEach((p,i)=>{
        const x=cx+(p.x-.5)*W*.72+Math.sin(s*.8+p.p)*W*.04;
        const y=lerp(liquidTop+3,cy+H*.43,.08+p.y*.85)+Math.cos(s*.7+p.p)*1.3;
        const r=Math.max(1.1,W*.023),len=Math.max(4,W*.13),a=p.p+s*.12;
        const dx=Math.cos(a),dy=Math.sin(a);
        ctx.strokeStyle=th.fid;ctx.lineWidth=.9;ctx.fillStyle=th.surface;
        ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+dx*r,y+dy*r);
        ctx.quadraticCurveTo(x+dx*len*.6-dy*1.2,y+dy*len*.6+dx*1.2,x+dx*len,y+dy*len);ctx.stroke();
      });ctx.restore();
    }
    // Micellar assemblies remain in the clear LMPG solution after solubilization.
    const assembled=at(s,16.8,18.3);
    if(assembled>0){
      ctx.save();tubeBody(ctx,cx,cy,W,H);ctx.clip();ctx.globalAlpha*=assembled*.9;
      const liquidTop=lerp(cy+H*.49,cy-H*.40,fill*.74);
      ctx.beginPath();ctx.rect(cx-W,liquidTop+2,W*2,H);ctx.clip();
      [[-.20,-.045],[.19,.055],[-.13,.18],[.08,.31]].forEach(([u,v],i)=>{
        const x=cx+u*W+Math.sin(s*.65+i)*W*.018,y=cy+v*H+Math.cos(s*.55+i)*H*.012;
        const r=Math.max(3,W*.085);ctx.strokeStyle=th.fid;ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
        for(let k=0;k<8;k++){
          const a=k/8*TAU;
          line(ctx,[[x+Math.cos(a)*r,y+Math.sin(a)*r],[x+Math.cos(a)*r*.60,y+Math.sin(a)*r*.60]],th.fid,.8);
        }
      });ctx.restore();
    }
    CHAINS.forEach((p,i)=>{
      const angle=s*2+p.p;
      const bottom=cy+H*.33+(p.y-.5)*H*.09;
      const x=cx+(p.x-.5)*W*.35+Math.sin(angle)*W*.16*resuspend;
      const y=lerp(bottom,cy+H*(.02+(p.y-.5)*.42)+Math.cos(angle)*H*.045,resuspend);
      ctx.save();tubeBody(ctx,cx,cy,W,H);ctx.clip();ctx.globalAlpha*=1-move;
      chain(ctx,th,x,y,W*.27,p.p,th.fid);ctx.restore();
    });
    const dispense=at(s,15.05,15.45)*(1-at(s,16.45,16.9));
    pipette(ctx,th,cx,cy,W,H,s,dispense,th.fid);
    // Gentle curved arrows indicate resuspension without implying a molecular timescale.
    if(resuspend>0&&move<.98){
      ctx.save();ctx.globalAlpha*=Math.sin(move*Math.PI)*.7;ctx.strokeStyle=th.fid;ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(cx,cy+H*.12,W*.24,H*.075,-.2,.25,Math.PI*1.75);ctx.stroke();ctx.restore();
    }
    if(move>0&&move<1){
      for(let i=0;i<3;i++){
        const u=clamp(move*1.5-i*.17),x=lerp(cx,w*.74,u),y=lerp(cy+H*.33,cy,u)-Math.sin(u*Math.PI)*h*.13;
        ctx.save();ctx.globalAlpha*=Math.sin(u*Math.PI);chain(ctx,th,x,y,w*.065,CHAINS[i].p,th.fid);ctx.restore();
      }
    }
    micelle(ctx,th,w*.74,cy,w*.28,move);
    label(ctx,th,move<.45?'Resuspend':move<.9?'Solubilizing':'Clear sample',cx,h*.76,'center');
    label(ctx,th,w>=350?'LMPG micelle':'LMPG',w*.74,h*.76,'center',th.fid);
    caption(ctx,th,'Does the resulting sample retain structured elements?','Now test the sample by NMR',w,pad,h-pad-7);
  }
  function hmqc(ctx,th,x,y,pw,ph,s,detail=pw>140){
    const X=v=>x+(9-v)/2.2*pw,Y=v=>y+(v-103)/26*ph,a=at(s,20.7,22.4);
    ctx.strokeStyle=th.rule;ctx.lineWidth=1;ctx.strokeRect(x,y,pw,ph);
    label(ctx,th,'SOFAST HMQC',x,y-12,'left');
    ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle=th.fid;ctx.lineWidth=.9;
    PEAKS.forEach(([hh,n])=>{for(const f of [1,.55]){ctx.beginPath();ctx.ellipse(X(hh),Y(n),Math.max(1.1,pw*.022*f),Math.max(1.2,ph*.013*f),-.35,0,TAU);ctx.stroke();}});
    ctx.restore();
    if(detail){
      label(ctx,th,'¹H',x+pw,y+ph+11,'right');
      for(const v of [8.5,7.5])label(ctx,th,String(v),X(v),y+ph+11,'center');
      label(ctx,th,'¹⁵N',x+pw+6,y-12,'left');
      for(const v of [110,120,125])label(ctx,th,String(v),x+pw+6,Y(v),'left');
    }
  }
  function propensity(ctx,th,x,y,pw,ph,s){
    const X=n=>x+(n-1)/114*pw,Y=v=>y+ph*(1.2-v)/1.4;
    label(ctx,th,pw>145?'Helical propensity':'Helix score',x,y-31,'left');
    ctx.save();ctx.globalAlpha*=at(s,23,24.5);
    if(pw>145)HELICES.forEach(([a,b])=>line(ctx,[[X(a),y-12],[X(b),y-12]],th.muted,3));ctx.restore();
    const zero=Y(0);line(ctx,[[x,zero],[x+pw,zero]],th.rule,1);
    const reveal=at(s,23.5,25.5);
    SSP.forEach((v,i)=>line(ctx,[[X(i+1),zero],[X(i+1),Y(v*reveal)]],th.fid,Math.max(1,pw/220)));
    for(const n of [1,115])label(ctx,th,String(n),X(n),zero+13,'center');
    label(ctx,th,'Residue',x+pw*.5,zero+13,'center');
    if(pw>145){label(ctx,th,'1',x-5,Y(1),'right');label(ctx,th,'0',x-5,zero,'right');}
    ctx.save();ctx.globalAlpha*=at(s,25,26);
    if(pw>145){label(ctx,th,'Sequence prediction',x,y+ph+23,'left',th.muted);label(ctx,th,'NMR chemical shifts',x,y+ph+40,'left',th.fid);}ctx.restore();
  }
  function evidence(ctx,w,h,s,th,pad){
    caption(ctx,th,s<24?'Is the sample suitable for structural study?':'NMR reveals a predominantly helical protein',s<24?'Is the sample suitable for NMR?':'NMR: mainly α-helical structure',w,pad,pad+6);
    const top=pad+44;
    const nmrW=w*.35,nmrH=h-pad-(w<350?44:54)-top;
    const nmrScale=w>=350?.8:1;
    hmqc(ctx,th,pad+4+nmrW*(1-nmrScale)/2,top+nmrH*(1-nmrScale)/2,nmrW*nmrScale,nmrH*nmrScale,s,w>=350);
    const plotH=w<260?h*.32-16:h*.32;
    // Centre the complete panel (heading, plot and key) beside the HMQC.
    const plotY=w>=350?(top+h-pad-54-plotH-9)/2:top+18;
    propensity(ctx,th,w*.57,plotY,w-pad-8-w*.57,plotH,s);
    ctx.save();ctx.globalAlpha*=at(s,25.5,26.5);
    caption(ctx,th,'Subunit g: >90% of backbone amides assigned','>90% amides assigned',w,pad,h-pad-26,th.ink);
    caption(ctx,th,'Cell-free production → a sample ready for structural studies','Cell-free → structural studies',w,pad,h-pad-7,th.soft);ctx.restore();
  }
  Anim.register('cellfree-atpase-2017',function(ctx,w,h,t,th){
    ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
    const s=t%32,pad=Math.max(12,Math.round(w*.034));
    for(const [a,b,draw] of [[0,12.5,synthesis],[12,15.5,harvest],[15,20,solubilize],[20,32,evidence]]){
      const alpha=at(s,a,a+.5)*(1-at(s,b-.5,b));
      if(alpha>0){ctx.save();ctx.globalAlpha=alpha;draw(ctx,w,h,s,th,pad);ctx.restore();}
    }
    ctx.globalAlpha=1;
  },{loop:32,still:28});
})();
