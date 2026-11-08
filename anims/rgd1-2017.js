/* Rgd1-RhoGAP: a cryptic phosphoinositide-binding site.
   Martinez et al., Biochem. J. 474, 3307–3319 (2017), Figs 3–6.
   Cα coordinates: PDB 5MY3, chain A; residue numbers follow the paper's construct.
   CSPs, peak trajectories and order profiles are approximate redrawings, not raw data.
   The lipid pose and membrane orientation are illustrative, not deposited complexes. */
(function(){
  'use strict';
  const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const at=(s,a,b)=>ease((s-a)/(b-a));
  const lerp=(a,b,u)=>a+(b-a)*u;
  const TRACE=[[19,12.11,-16.53,8.69,0],[20,12.54,-13.43,6.42,0],[21,9.88,-10.71,5.93,0],[22,11.08,-8.62,2.98,0],[23,11.66,-10.06,-0.48,0],[24,9.31,-13.03,-0.03,0],[25,5.97,-13.88,-1.69,1],[26,2.99,-12.26,0.02,1],[27,1.28,-15.71,0.13,1],[28,4.07,-17.12,2.26,1],[29,3.69,-14.38,4.88,1],[30,-0.01,-14.79,5.74,1],[31,-0.04,-18.4,7.07,0],[31,0.04,-18.42,7.1,0],[32,0.47,-16.89,10.58,0],[33,-2.3,-14.27,10.14,0],[34,-6.0,-15.21,10.58,0],[35,-6.88,-11.81,8.92,0],[36,-4.59,-12.43,5.87,0],[37,-2.61,-9.14,6.11,0],[38,1.11,-9.44,7.05,1],[39,1.94,-8.17,10.51,1],[40,4.47,-5.64,9.16,1],[41,1.87,-4.01,6.87,1],[42,-0.7,-3.76,9.76,1],[43,1.95,-2.26,12.05,1],[44,3.21,0.37,9.64,1],[45,-0.34,1.43,8.78,1],[46,-1.24,1.67,12.47,1],[47,1.75,3.99,13.04,1],[48,0.96,6.3,10.12,1],[49,-2.78,6.25,10.97,1],[50,-2.12,7.33,14.57,1],[51,0.88,9.58,14.16,1],[52,1.28,10.54,10.5,1],[53,-1.91,11.37,8.56,0],[54,-1.46,15.12,9.18,0],[55,2.33,15.11,8.72,0],[56,3.44,17.37,5.88,0],[57,4.92,15.34,3.05,0],[58,4.17,11.85,4.47,0],[59,5.29,9.35,1.77,0],[60,6.63,12.19,-0.47,0],[61,9.56,12.47,2.01,0],[62,12.07,9.69,1.49,0],[63,13.61,8.64,4.8,0],[64,17.41,8.14,5.0,1],[65,18.23,4.91,3.04,1],[66,20.53,3.82,5.87,1],[67,17.7,4.19,8.45,1],[68,15.31,2.25,6.18,1],[69,17.98,-0.5,5.74,1],[70,18.81,-0.81,9.46,1],[71,15.1,-1.25,10.31,1],[72,14.52,-3.6,7.37,1],[73,17.49,-5.8,8.34,1],[74,16.48,-5.89,12.04,1],[75,13.01,-7.15,11.05,1],[76,14.46,-9.76,8.65,1],[77,16.65,-11.06,11.5,1],[78,13.61,-11.42,13.82,1],[79,9.95,-10.8,12.86,1],[80,9.28,-9.83,16.52,1],[81,11.31,-6.64,15.77,1],[82,8.2,-5.08,14.09,1],[83,7.84,-3.78,17.7,1],[84,10.62,-1.34,16.63,1],[85,8.19,0.26,14.13,1],[86,6.19,1.8,17.06,1],[87,7.53,5.34,17.66,0],[88,9.54,5.49,20.9,0],[89,8.68,8.43,23.17,0],[90,9.14,11.32,22.67,0],[91,8.45,10.72,18.91,0],[92,10.05,12.75,16.09,1],[93,8.85,13.66,12.59,1],[94,11.65,11.61,11.07,1],[95,10.59,8.39,12.88,1],[96,7.2,8.77,11.22,1],[97,8.7,9.49,7.78,1],[98,10.88,6.39,8.32,1],[99,7.84,4.15,8.85,1],[100,6.23,5.44,5.68,1],[101,9.41,4.72,3.71,1],[102,9.64,1.3,5.31,1],[103,6.09,0.43,4.22,1],[104,6.78,1.54,0.67,1],[105,10.01,-0.53,0.66,1],[106,8.04,-3.57,1.77,1],[107,5.72,-3.33,-1.23,1],[108,8.62,-2.51,-3.59,1],[109,10.6,-5.54,-2.35,1],[110,7.78,-8.06,-2.94,1],[111,8.78,-10.51,-5.71,0],[112,5.53,-9.68,-7.58,0],[113,3.47,-6.51,-7.5,0],[114,0.46,-6.66,-5.09,0],[115,-1.55,-6.17,-8.27,0],[116,0.14,-9.11,-10.02,1],[117,2.09,-8.75,-13.32,1],[117,2.08,-8.74,-13.31,1],[118,-0.29,-11.38,-14.76,1],[119,-3.08,-8.76,-14.62,1],[120,-1.16,-6.38,-16.98,1],[121,-3.3,-7.12,-20.08,1],[122,-6.62,-6.8,-18.27,1],[123,-5.35,-3.58,-16.6,1],[124,-4.51,-2.22,-20.09,1],[125,-8.03,-3.02,-21.29,1],[126,-9.42,-1.37,-18.12,1],[127,-7.47,1.88,-18.71,1],[128,-8.89,2.34,-22.28,1],[129,-12.52,2.33,-21.0,1],[130,-13.87,5.92,-21.22,0],[131,-17.2,5.35,-19.32,1],[132,-16.4,5.71,-15.59,1],[133,-19.1,3.27,-14.28,1],[134,-18.01,0.58,-16.77,1],[135,-14.35,1.28,-15.85,1],[136,-14.89,0.88,-12.09,1],[137,-17.05,-2.25,-12.41,1],[138,-14.29,-3.66,-14.65,1],[139,-11.63,-2.97,-12.03,1],[140,-13.98,-4.38,-9.3,1],[141,-13.93,-7.67,-11.24,1],[142,-10.13,-7.74,-11.31,1],[143,-9.98,-6.96,-7.57,1],[144,-12.66,-9.5,-6.64,1],[145,-10.64,-12.18,-8.42,1],[146,-7.41,-11.58,-6.52,0],[147,-6.28,-14.35,-4.28,1],[148,-6.84,-13.76,-0.53,1],[149,-3.3,-12.55,0.36,1],[150,-3.31,-9.88,-2.37,1],[151,-6.96,-8.98,-1.83,1],[152,-6.81,-8.36,1.91,1],[153,-3.4,-6.68,1.78,1],[154,-4.45,-4.38,-1.07,1],[155,-7.64,-3.58,0.83,1],[156,-5.7,-2.5,3.93,1],[157,-3.3,-0.38,1.94,1],[158,-5.98,1.28,-0.2,1],[159,-8.1,2.23,2.84,1],[160,-5.01,3.68,4.46,1],[161,-4.06,5.7,1.4,1],[162,-7.61,7.09,1.21,1],[163,-7.3,8.19,4.84,1],[164,-4.06,9.96,3.81,1],[165,-6.0,11.7,1.03,1],[166,-8.77,12.7,3.42,1],[167,-6.1,14.63,5.33,1],[168,-4.63,16.53,2.28,1],[169,-5.34,19.92,3.84,1],[170,-2.62,19.07,6.44,1],[171,-0.29,16.6,4.7,1],[172,-0.39,18.46,1.32,1],[173,-0.58,15.2,-0.68,0],[174,-2.83,15.34,-3.71,1],[175,-4.13,12.24,-5.53,1],[176,-1.6,12.47,-8.41,1],[177,1.41,12.84,-6.07,1],[178,0.17,9.83,-4.15,1],[179,-0.1,7.8,-7.41,1],[180,3.42,8.8,-8.53,1],[181,4.74,7.55,-5.18,1],[182,2.68,4.35,-4.9,1],[183,1.71,3.32,-8.43,1],[184,5.06,1.87,-9.5,1],[185,5.15,-0.03,-6.21,1],[186,1.58,-1.48,-6.44,1],[187,0.76,-1.87,-10.1,1],[188,2.7,-3.8,-12.76,0],[189,4.57,-1.96,-15.52,0],[190,3.22,-1.22,-19.01,0],[191,3.66,-4.6,-20.8,0],[192,4.12,-2.77,-24.15,0],[193,6.44,-0.05,-22.69,0],[194,8.89,-0.64,-19.77,0],[195,9.58,3.12,-19.33,0],[196,5.95,4.4,-19.36,0],[197,5.32,5.69,-15.81,1],[198,1.72,6.84,-16.67,1],[199,0.37,3.27,-16.84,1],[200,1.12,2.53,-13.17,1],[201,-0.06,6.02,-12.09,1],[202,-3.44,5.63,-13.86,1],[203,-3.86,2.1,-12.56,1],[204,-3.42,3.55,-9.03,1],[205,-6.07,6.29,-9.67,1],[206,-8.64,3.8,-10.95,1],[207,-7.89,1.58,-7.96,1],[208,-8.51,4.48,-5.51,1],[209,-11.7,5.55,-7.36,1],[210,-13.14,2.01,-7.2,1],[211,-12.16,1.19,-3.64,1],[212,-15.48,2.33,-2.18,1],[213,-17.36,-0.35,-4.14,1],[214,-14.61,-3.03,-4.51,1],[215,-13.84,-3.69,-0.83,1],[216,-16.11,-4.22,2.2,0],[217,-15.79,-1.31,4.71,0],[218,-13.71,-1.57,7.92,0],[219,-15.81,-2.42,11.07,0],[220,-17.2,0.56,13.13,0],[221,-16.37,0.83,16.88,0],[222,-18.93,3.13,18.61,0],[222,-18.93,3.14,18.6,0],[223,-21.47,1.85,21.18,0],[224,-21.73,4.6,23.82,0]];
  const SITE=[43,71,83,86,88], RESPONSE={14:.155,17:.146,19:.098,43:.086,70:.083,71:.060,72:.075,83:.067,86:.126,88:.052,96:.041,97:.042};
  const rng=Anim.seeded(2017);
  const CSP=Array.from({length:217},(_,i)=>RESPONSE[i+1]||.002+rng()*.012);
  const POINTS=Object.fromEntries(TRACE.map(([n,x,y,z])=>[n,[x,y,z]]));
  const SEG=[];
  // Smooth the deposited Cα trace once; retain residue identity and depth.
  for(let i=1;i<TRACE.length;i++){
    const p=TRACE[i-1],q=TRACE[i];if(q[0]-p[0]>1)continue;
    const a=TRACE[Math.max(0,i-2)],b=TRACE[Math.min(TRACE.length-1,i+1)];
    let prev=p.slice(1,4);
    for(let j=1;j<=4;j++){
      const u=j/4,pt=[1,2,3].map(k=>.5*((2*p[k])+(-a[k]+q[k])*u+(2*a[k]-5*p[k]+4*q[k]-b[k])*u*u+(-a[k]+3*p[k]-3*q[k]+b[k])*u*u*u));
      SEG.push({p:prev,q:pt,n:q[0],helix:q[4],z:(prev[2]+pt[2])/2});prev=pt;
    }
  }
  SEG.sort((a,b)=>a.z-b.z);
  function label(ctx,th,t,x,y,align='left',c=th.soft){Anim.label(ctx,th,t,x,y,align,c);}
  function caption(ctx,th,long,short,w,pad,y,c=th.ink){label(ctx,th,Anim.measure(ctx,th,long)<=w-2*pad?long:short,pad,y,'left',c);}
  function line(ctx,p,c,lw=1){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function mix(a,b,u){
    const rgb=c=>{if(c.startsWith('#')){const h=c.slice(1);return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}return (c.match(/[\d.]+/g)||[128,128,128]).slice(0,3).map(Number);};
    const p=rgb(a),q=rgb(b);return `rgb(${p.map((v,i)=>Math.round(lerp(v,q[i],u))).join(',')})`;
  }
  function protein(ctx,th,cx,cy,sc,reveal=0,helices=0,angle=0){
    const c=Math.cos(angle),sn=Math.sin(angle);
    const P=p=>[cx+(p[0]*c+p[1]*sn)*sc,cy+(p[0]*sn-p[1]*c)*sc];
    for(const seg of SEG){
      const strength=.43+.57*clamp((seg.z+24)/48);
      const region=seg.n>=64&&seg.n<=110;
      const col=region&&helices>0?mix(th.ink,th.spec,helices):mix(th.bg,th.ink,strength);
      line(ctx,[P(seg.p),P(seg.q)],col,Math.max(1,Math.min(3,sc*(seg.helix?1.30:.66))));
    }
    if(reveal>0)for(const n of SITE){
      const p=P(POINTS[n]);ctx.save();ctx.globalAlpha*=reveal;ctx.fillStyle=th.spec;ctx.strokeStyle=th.bg;ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(...p,Math.max(2.2,sc*1.65),0,TAU);ctx.fill();ctx.stroke();ctx.restore();
    }
    return n=>P(POINTS[n]);
  }
  function lipid(ctx,th,x,y,size,tail=true,angle=0){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    const r=size*.32,pts=Array.from({length:7},(_,i)=>[r*Math.cos(i/6*TAU),r*Math.sin(i/6*TAU)]);
    line(ctx,pts,th.fid,1.5);
    // Inositol ring and its two distinguishing phosphates, schematically.
    for(const a of [-Math.PI/3,-Math.PI*2/3]){
      const px=Math.cos(a)*r,py=Math.sin(a)*r,qx=Math.cos(a)*(r+size*.25),qy=Math.sin(a)*(r+size*.25);
      line(ctx,[[px,py],[qx,qy]],th.fid,1.3);ctx.fillStyle=th.fid;ctx.beginPath();ctx.arc(qx,qy,Math.max(2,size*.09),0,TAU);ctx.fill();
    }
    if(tail)for(const side of [-1,1])line(ctx,[[0,r],[side*size*.14,r+size*.20],[side*size*.11,r+size*.55],[side*size*.22,r+size*.85]],th.fid,1.4);
    ctx.restore();
  }
  const bilayerHeight=w=>Math.max(16,Math.min(30,w*.07));
  function membrane(ctx,th,w,y,s,amount=0){
    const gap=Math.max(13,w*.035),height=bilayerHeight(w);
    const halfGap=Math.max(1.25,height*.06);
    for(let x=8,i=0;x<w;x+=gap,i++){
      const special=i%9===4;
      for(const side of [-1,1]){
        const yy=y+side*height*.54;
        ctx.fillStyle=special?th.fid:th.rule;ctx.strokeStyle=special?th.fid:th.muted;ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(x,yy,Math.max(2.3,w*.007),0,TAU);ctx.fill();ctx.stroke();
        for(const d of [-1,1]){
          const wig=amount*1.8*Math.sin(s*.8+i*1.7+d);
          const end=y+side*halfGap;
          line(ctx,[[x+d*1.5,yy-side*3],[x+d*2+wig,lerp(yy,end,.50)],[x+d*2.5,end]],special?th.fid:th.muted,1);
        }
      }
    }
  }
  function opening(ctx,w,h,s,th,pad){
    caption(ctx,th,'Where do phosphoinositides bind Rgd1?','Where does the lipid bind?',w,pad,pad+6);
    const sc=Math.min(w*.010,h*.012),cx=w*.44,cy=h*.43;
    protein(ctx,th,cx,cy,sc);
    const drift=at(s,.8,3.0);
    lipid(ctx,th,lerp(w*.83,w*.76,drift),h*.42,w*.065,true,-.3);
    membrane(ctx,th,w,h*.79-(w<260?5:0),s);
    caption(ctx,th,'Rgd1 · folded RhoGAP domain','Rgd1 · RhoGAP domain',w,pad,h-pad-6,th.soft);
  }
  function peaks(ctx,th,x,y,pw,ph,s){
    const progress=at(s,7,10.4);
    const dose=[0,.2,.5,1];
    ctx.strokeStyle=th.rule;ctx.lineWidth=1;ctx.strokeRect(x,y,pw,ph);
    const sites=[{name:'L71',x:.64,y:.30,dx:-.17,dy:.04},{name:'L86',x:.27,y:.56,dx:-.035,dy:.23}];
    sites.forEach(p=>{
      dose.forEach((d,i)=>{
        const a=i===0?1:at(progress,d*.75,d*.75+.25);
        if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle=i===0?th.ink:mix(th.fid,th.spec,i/3);ctx.lineWidth=1.05;
        for(const f of [1,.65,.35]){ctx.beginPath();ctx.ellipse(x+(p.x+p.dx*d)*pw,y+(p.y+p.dy*d)*ph,Math.max(2,pw*.045*f),Math.max(2,ph*.055*f),0,0,TAU);ctx.stroke();}ctx.restore();
      });
      label(ctx,th,p.name,x+(p.x+.09)*pw,y+(p.y-.10)*ph,'left');
    });
    label(ctx,th,'¹H–¹⁵N HSQC',x,y-12,'left');
    if(wide(pw)){
      ctx.save();ctx.font=`600 12px ${th.mono}`;ctx.fillStyle=th.spec;
      ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('+ PIP₂',x+pw,y+ph+13);ctx.restore();
    }
  }
  const wide=pw=>pw>110;
  function csp(ctx,th,x,y,pw,ph,s){
    const growth=at(s,9.2,11.8),X=n=>x+(n-1)/216*pw,Y=v=>y+ph-v/.16*ph;
    line(ctx,[[x,y],[x,y+ph],[x+pw,y+ph]],th.rule);
    ctx.setLineDash([3,3]);line(ctx,[[x,Y(.02)],[x+pw,Y(.02)]],th.muted);ctx.setLineDash([]);
    CSP.forEach((v,i)=>line(ctx,[[X(i+1),y+ph],[X(i+1),Y(v*growth)]],SITE.includes(i+1)?th.spec:th.muted,Math.max(1,pw/300)));
    for(const n of [20,217])label(ctx,th,String(n),X(n),y+ph+13,'center');
    label(ctx,th,'Residue',x+pw*.5,y+ph+13,'center');
    label(ctx,th,'CSP',x,y-10,'left');
  }
  function structureIntro(ctx,w,h,s,th,pad){
    const move=at(s,8.2,9.8),small=w<350;
    ctx.save();ctx.globalAlpha*=1-at(s,9.2,9.85);
    label(ctx,th,'RhoGAP domain',pad,pad+6,'left',th.ink);
    caption(ctx,th,'X-ray structure determination (2.19 Å)','X-ray structure determination',w,pad,pad+23,th.ink);
    if(small)label(ctx,th,'(2.19 Å)',pad,pad+40,'left',th.soft);
    ctx.restore();
    const py=pad+(small?37:45),ph=h*(small?.26:.32);
    const cx=lerp(w*.5,w*.76,move),cy=lerp(h*.56,py+ph*.58,move);
    const sc=lerp(Math.min(w*.011,h*.0105),Math.min(w*.008,h*.0085),move);
    protein(ctx,th,cx,cy,sc);
  }
  function titration(ctx,w,h,s,th,pad){mapping(ctx,w,h,s-4,th,pad);}
  function dockAfterStructure(ctx,w,h,s,th,pad){docking(ctx,w,h,s-4,th,pad);}
  function membraneAfterStructure(ctx,w,h,s,th,pad){membraneTest(ctx,w,h,s-4,th,pad);}
  function mapping(ctx,w,h,s,th,pad){
    caption(ctx,th,s<11?'NMR: lipid addition moves selected peaks':'The shifts map to one region of the fold',s<11?'NMR peaks move with lipid':'NMR locates one surface site',w,pad,pad+6);
    const px=pad+8,py=pad+(w<350?37:45),pw=w*.38,ph=h*(w<350?.26:.32);
    peaks(ctx,th,px,py,pw,ph,s);
    const cx=w*.76,cy=py+ph*.58,sc=Math.min(w*.008,h*.0085);
    const P=protein(ctx,th,cx,cy,sc,at(s,10.4,12));
    const a=at(s,11.4,12.8)*(1-at(s,14.8,15.6));
    if(a>0&&w>=350){ctx.save();ctx.globalAlpha*=a;ctx.setLineDash([3,4]);for(const n of [71,86])line(ctx,[[px+pw,py+ph*(n===71?.34:.77)],P(n)],th.spec,1);ctx.restore();}
    csp(ctx,th,pad+16,h*.65,w-2*pad-24,w<350?Math.max(16,h-pad-36-h*.65):h*.18,s);
    ctx.save();ctx.globalAlpha*=at(s,12.2,13.3);
    caption(ctx,th,'PIP₂ titration · localized chemical shift perturbations','PIP₂ titration · localized CSPs',w,pad,h-pad-3,th.soft);ctx.restore();
  }
  function docking(ctx,w,h,s,th,pad){
    caption(ctx,th,s<20?'A binding site within the folded domain':'Docking suggests headgroup contacts',s<20?'A site within the fold':'Docking suggests the contacts',w,pad,pad+6);
    const sc=Math.min(w*.010,h*.013),cx=w*.42,cy=h*.49;
    const P=protein(ctx,th,cx,cy,sc,1,at(s,16.5,18.4)*.75);
    const p=P(86),q=P(88),target=[(p[0]+q[0])/2+sc*5,(p[1]+q[1])/2];
    const arrival=at(s,18.6,21.4),lx=lerp(w*.84,target[0],arrival),ly=lerp(h*.39,target[1],arrival);
    lipid(ctx,th,lx,ly,Math.max(16,w*.065),false,.35);
    ctx.save();ctx.globalAlpha*=at(s,21,22);ctx.setLineDash([3,3]);
    for(const n of [43,83,86,88])line(ctx,[P(n),[lx,ly]],th.spec,1);ctx.restore();
    if(w>=350){
      label(ctx,th,'PIP₂ headgroup',w-pad,pad+31,'right',th.fid);
      const names=[[71,'A1'],[83,'A1′'],[97,'B']];
      names.forEach(([n,t],i)=>{
        const v=P(n),x=w-pad-25,y=h*.51+i*19;
        line(ctx,[v,[x-12,y]],th.rule,1);label(ctx,th,t,x,y,'left',th.spec);
      });
    }
    caption(ctx,th,'NMR identifies the site; docking proposes the pose','NMR site · modelled pose',w,pad,h-pad-6,th.soft);
  }
  function orderPlot(ctx,th,x,y,pw,ph,s){
    const control=[.55,.55,.55,.55,.55,.54,.51,.47,.43,.38,.34,.28,.24,.19,.05];
    const bound=[.52,.52,.52,.52,.52,.515,.50,.465,.425,.375,.335,.278,.238,.188,.05];
    const X=i=>x+i/14*pw,Y=v=>y+ph-v/.6*ph;
    line(ctx,[[x,y],[x,y+ph],[x+pw,y+ph]],th.rule);
    if(pw>170)for(const v of [.3,.6])label(ctx,th,v.toFixed(1),x-7,Y(v),'right');
    const reveal=at(s,26,28);
    // Highlight the measured difference near the glycerol/headgroup end only.
    ctx.save();ctx.globalAlpha*=reveal*.17;ctx.fillStyle=th.spec;ctx.beginPath();
    control.slice(0,7).forEach((v,i)=>i?ctx.lineTo(X(i),Y(v)):ctx.moveTo(X(i),Y(v)));
    for(let i=6;i>=0;i--)ctx.lineTo(X(i),Y(bound[i]));
    ctx.closePath();ctx.fill();ctx.restore();
    line(ctx,control.map((v,i)=>[X(i),Y(v)]),th.ink,1.6);
    ctx.save();ctx.globalAlpha*=reveal;line(ctx,bound.map((v,i)=>[X(i),Y(v)]),th.spec,2);ctx.restore();
    label(ctx,th,pw>140?'Lipid order |SCD|':'Lipid order',x,y-10,'left');
    label(ctx,th,pw>140?'Head end':'Head',x,y+ph+13,'left');
    label(ctx,th,pw>140?'Tail tip':'Tail',x+pw,y+ph+13,'right');
    // The lower-left corner is clear of the profiles at every preview size.
    label(ctx,th,'No protein',x+5,y+ph*.52,'left',th.ink);
    ctx.save();ctx.globalAlpha*=reveal;
    label(ctx,th,'+ protein',x+5,y+ph*.82,'left',th.spec);ctx.restore();
  }

  function membraneTest(ctx,w,h,s,th,pad){
    caption(ctx,th,s<27?'Does the domain interact with a membrane?':'Solid-state NMR: a small loss of lipid order',s<27?'Does it contact a membrane?':'²H NMR: lower lipid order',w,pad,pad+6);
    const phone=w<350,sc=Math.min(w*.0065,h*.007),cx=phone?w*.26:w*.25,cy=h*.39;
    const contact=protein(ctx,th,cx,cy,sc,1,.55,Math.PI*.5)(86);
    ctx.save();ctx.beginPath();ctx.rect(pad,h*.45,w*.43,h*.21);ctx.clip();membrane(ctx,th,w*.55,h*.55,s,at(s,26,28));ctx.restore();
    const hy=h*.55-bilayerHeight(w*.55)*.54;
    lipid(ctx,th,contact[0],hy-3,Math.max(9,w*.027),false);
    const x=w*.55,y=pad+(phone?45:49),pw=w-pad-x,ph=h*(w<260?.30:phone?.36:.46);
    orderPlot(ctx,th,x,y,pw,ph,s);
    if(!phone)label(ctx,th,'2% PIP₂',pad,h*.68,'left',th.fid);

    ctx.save();ctx.globalAlpha*=at(s,27.5,28.5);
    caption(ctx,th,'The change requires both PIP₂ and RhoGAP','Requires PIP₂ + RhoGAP',w,pad,h-pad-25,th.soft);
    caption(ctx,th,'Disordering is strongest near the headgroups','Lower order near headgroups',w,pad,h-pad-6,th.ink);ctx.restore();
  }
  Anim.register('rgd1-2017',function(ctx,w,h,t,th){
    ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
    const s=t%37,pad=Math.max(12,Math.round(w*.034));
    for(const [a,b,draw] of [[0,6,opening],[6,10.5,structureIntro],[10,20,titration],[20,28,dockAfterStructure],[28,37,membraneAfterStructure]]){
      const alpha=at(s,a,a+.5)*(1-at(s,b-.5,b));
      if(alpha>0){ctx.save();ctx.globalAlpha=alpha;draw(ctx,w,h,s,th,pad);ctx.restore();}
    }
    ctx.globalAlpha=1;
  },{loop:37,still:18});
})();
