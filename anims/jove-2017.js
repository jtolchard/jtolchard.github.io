/* Loquet et al., JoVE 127, e55779 (2017), Figs 1, 4, 5.
   Illustrative assembly, spectra and restraints, not digitized measurements or
   an atomic structure. Fig 4 motivates the Ile32–Thr33 assignment example.
   The final mixed U-15N / U-13C experiment is the PAIN-CP strategy in §3.4.1;
   it is distinct from the preceding carbon-carbon PDSD assignment experiment.
   NMR restraints constrain local interfaces; EM can supply assembly symmetry. */
(function(){
  'use strict';
  const TAU=2*Math.PI,clamp=x=>Math.max(0,Math.min(1,x));
  const at=(t,a,b)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u);};
  const mix=(a,b,u)=>a+(b-a)*u;
  function text(c,th,s,x,y,col=th.soft,align='left'){Anim.label(c,th,s,x,y,align,col);}
  function cap(c,th,a,b,w,p,y){text(c,th,Anim.measure(c,th,a)<=w-2*p?a:b,p,y,th.ink);}
  function line(c,pts,col,lw=1.4){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
  function dot(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
  function unit(c,th,x,y,r,col,angle=0){
    c.save();c.translate(x,y);c.rotate(angle);
    c.fillStyle=th.surface;c.strokeStyle=col;c.lineWidth=2;
    c.beginPath();c.moveTo(-r*.7,-r*.6);
    c.bezierCurveTo(-r*1.2,-r*.1,-r*.6,r*.8,-r*.12,r*.7);
    c.bezierCurveTo(r*.25,r*.62,r*.22,r*.12,r*.55,r*.2);
    c.bezierCurveTo(r*1.05,r*.3,r*1.02,-r*.65,r*.42,-r*.7);
    c.bezierCurveTo(r*.05,-r*.8,-r*.25,-r*.3,-r*.7,-r*.6);c.closePath();c.fill();c.stroke();
    line(c,[[-r*.55,-r*.15],[-r*.3,r*.3],[0,-r*.2],[r*.3,-r*.45]],col,1.3);c.restore();
  }
  function filament(c,th,x,y,r,n,t){
    for(let i=0;i<n;i++)for(const side of [-1,1]){
      const a=i*.95+t*.12;
      unit(c,th,x+side*r*.59+Math.sin(a)*r*.13,y+(i-(n-1)/2+side*.5)*r*.78,r*.65,i===Math.floor(n/2)&&side===1?th.spec:th.ink,side*.12);
    }
  }

  function rotor(c,th,x,y,r,t){
    c.save();c.translate(x,y);c.rotate(-Math.PI*.304);
    c.fillStyle=th.surface;c.strokeStyle=th.ink;c.lineWidth=1.6;
    c.beginPath();c.roundRect(-r*.27,-r,r*.54,r*2,r*.12);c.fill();c.stroke();
    c.fillStyle=th.muted;c.fillRect(-r*.29,-r,r*.58,r*.22);
    for(let i=0;i<4;i++){const a=t*4+i*TAU/4;c.globalAlpha=.3+.5*Math.max(0,Math.cos(a));line(c,[[Math.sin(a)*r*.22,-r*.73],[Math.sin(a)*r*.22,r*.8]],th.spec,1.5);}
    c.restore();
  }
  function opening(c,w,h,t,th,p){
    const pack=at(t,4.2,6.2);
    if(t<4.5){
      const title='Methods: atomic resolution of insoluble assemblies';
      if(Anim.measure(c,th,title)<=w-2*p)text(c,th,title,p,p+6,th.ink);
      else{
        text(c,th,'Methods: atomic resolution',p,p+6,th.ink);
        text(c,th,'of insoluble assemblies',p,p+22,th.ink);
      }
    }else cap(c,th,'Label, assemble, then measure by solid-state NMR','Label → assemble → MAS NMR',w,p,p+6);
    const x=mix(w*.5,w*.29,pack),r=w*(w<350?.063:.08)*(1-pack*.3);
    const fibreY=h*mix(w<350?.55:.51,.46,pack);
    c.save();c.translate(x,fibreY);c.rotate(-Math.PI/12);
    filament(c,th,0,0,r,6,t);c.restore();
    if(pack>0){c.save();c.globalAlpha*=pack;rotor(c,th,w*.74,h*.48,w*.115,t);
      line(c,[[w*.46,h*.48],[w*.57,h*.48]],th.muted);line(c,[[w*.55,h*.46],[w*.57,h*.48],[w*.55,h*.50]],th.muted);
      // The protocol reports capacity up to ~50 mg, hydration-dependent,
      // for 3.2–4 mm rotors at moderate MAS; it gives no fixed minimum.
      text(c,th,'Up to ~50 mg',w*.74,h*.22,th.ink,'center');
      text(c,th,'3.2–4 mm rotor',w*.74,h*.22+16,th.soft,'center');
      text(c,th,'¹³C / ¹⁵N',w*.29,h*.79,th.spec,'center');
      if(w<350){
        text(c,th,'MAS solid state',w*.74,h*.75,th.soft,'center');
        text(c,th,'NMR',w*.74,h*.75+15,th.soft,'center');
      }else text(c,th,'MAS solid state NMR',w*.74,h*.79,th.soft,'center');
      c.restore();
    }
    cap(c,th,t<4.5?'Resolve the fold and the interfaces between repeating subunits':'Isotope-labelled subunits retain their assembled state',t<4.5?'Fold + subunit interfaces':'Measure the assembled protein',w,p,h-p-7);
  }
  function peak(c,x,y,r,col){for(const k of [1,1.65,2.3]){c.strokeStyle=col;c.lineWidth=.9;c.beginPath();c.ellipse(x,y,r*k,r*k*.65,0,0,TAU);c.stroke();}}
  function assignment(c,w,h,t,th,p){
    const small=w<350,join=at(t,12.3,15.4);
    cap(c,th,t<13?'PDSD · Short mixing: identify the Thr33 spin system':'PDSD · Longer mixing: connect Thr33 to Ile32',t<13?'PDSD · short mixing':'PDSD · longer mixing',w,p,p+6);
    const x=p+12,y=p+43,pw=small?w-2*p-24:w*.55,ph=small?h*.40:h*.57;
    // Figure-4-like window: the horizontal dimension includes side chains,
    // while the vertical window selects the Thr alpha/beta rows.
    const X=ppm=>x+(75-ppm)/60*pw,Y=ppm=>y+(ppm-48)/25*ph;
    line(c,[[x,y],[x,y+ph],[x+pw,y+ph]],th.rule);
    line(c,[[X(73),Y(73)],[X(48),Y(48)]],th.muted,1);
    // Background spin systems are symmetric under exchange of the two
    // chemical shifts; reciprocal peaks outside the displayed window are cropped.
    const background=[[55,65],[58,71],[51,60],[35,54],[32,67],[20,57],[45,64]];
    c.save();c.globalAlpha*=.48;
    for(const [a,b] of background){
      for(const [horizontal,vertical] of [[a,b],[b,a]]){
        if(vertical>=48&&vertical<=73)peak(c,X(horizontal),Y(vertical),Math.max(.8,w*.0025),th.fid);
      }
    }
    c.restore();
    const diagonal=[...new Set([62,69,...background.flat()])].filter(v=>v>=48&&v<=73);
    for(const shift of diagonal){
      c.save();c.translate(X(shift),Y(shift));c.rotate(-Math.atan2(ph/25,pw/60));
      c.strokeStyle=th.fid;
      for(const k of [1,1.6,2.2]){c.beginPath();c.ellipse(0,0,Math.max(1.5,w*.004)*(shift===62||shift===69?1.2:.75)*k,Math.max(.7,w*.0017)*(shift===62||shift===69?1.2:.75)*k,0,0,TAU);c.stroke();}
      c.restore();
    }
    // Thr33: C-alpha 62, C-beta 69, C-gamma 24 ppm. Reciprocal
    // gamma-row peaks lie outside this cropped vertical chemical-shift window.
    for(const [a,b] of [[69,62],[62,69],[24,62],[24,69]]){
      peak(c,X(a),Y(b),Math.max(1.2,w*.0035)*(a===24?1:1.3),th.fid);
    }
    c.save();c.setLineDash([3,3]);
    line(c,[[X(69),Y(69)],[X(69),Y(62)],[X(24),Y(62)],[X(24),Y(69)],[X(69),Y(69)]],th.fid,1);
    c.restore();
    c.save();c.globalAlpha*=join;
    // Longer-mixing diagonal signals at shared shifts and Ile C-alpha.
    // Side-chain diagonals (41, 26 ppm) lie outside the vertical window.
    for(const shift of [62,69,59]){
      c.save();c.translate(X(shift),Y(shift));c.rotate(-Math.atan2(ph/25,pw/60));
      c.strokeStyle=th.spec;c.lineWidth=.9;
      for(const k of [1,1.6,2.2]){
        c.beginPath();c.ellipse(0,0,Math.max(1.3,w*.0035)*k,Math.max(.65,w*.0015)*k,0,0,TAU);c.stroke();
      }
      c.restore();
    }
    // Unannotated longer-mixing contacts, paired where both rows are visible.
    c.save();c.globalAlpha*=.55;
    for(const [a,b] of [[55,59],[51,69],[35,62],[32,71],[20,65]]){
      for(const [horizontal,vertical] of [[a,b],[b,a]]){
        if(vertical>=48&&vertical<=73)peak(c,X(horizontal),Y(vertical),Math.max(.8,w*.0025),th.spec);
      }
    }
    c.restore();
    // Ile32 alpha and side-chain correlations on both Thr33 rows in the 200 ms overlay.
    for(const thr of [62,69])for(const ile of [59,41,26])peak(c,X(ile),Y(thr),Math.max(1.2,w*.0035),th.spec);
    c.setLineDash([3,3]);
    for(const ile of [59,41,26])line(c,[[X(ile),Y(62)],[X(ile),Y(69)]],th.spec,1);
    c.restore();
    if(!small){
      text(c,th,'¹³C / ppm',x+pw,y+ph+13,th.muted,'right');
      text(c,th,'50 ms',x,y-16,th.fid);c.save();c.globalAlpha*=join;text(c,th,'200 ms',x+pw,y-16,th.spec,'right');c.restore();
      for(const v of [70,50,30])text(c,th,String(v),X(v),y+ph+13,th.muted,'center');
      const tx=w*.66,ty=h*.28;
      text(c,th,'Thr33',tx,ty,th.fid);
      ['Cα  62 ppm','Cβ  69 ppm','Cγ  24 ppm'].forEach((v,i)=>text(c,th,v,tx,ty+20+i*17,th.fid));
      c.save();c.globalAlpha*=join;text(c,th,'Ile32',tx,ty+89,th.spec);
      text(c,th,'Cα  59 ppm',tx,ty+109,th.spec);text(c,th,'Cβ  41 ppm',tx,ty+126,th.spec);text(c,th,'Cγ1 26 ppm',tx,ty+143,th.spec);c.restore();
    }else{
      text(c,th,'Thr: α62 · β69 · γ24 ppm',p,h-p-26,th.fid);
    }
    cap(c,th,t<13?'Blue correlations identify a single threonine spin system':'Orange: Ile Cα / Cβ / Cγ1 correlate with Thr Cα / Cβ',t<13?'PDSD · 50 ms mixing':'Ile: α59 · β41 · γ1 26 ppm',w,p,h-p-7);
  }
  // Packed molecular cartoon inspired by the supplied assembly and contact diagram.
  // Repeated projected backbone is derived from chain J; packing and restraint endpoints are illustrative.
  const subunitBackbone=[[0.5,0.2003],[0.3971,0.2149],[0.3098,0.1946],[0.2059,0.188],[0.1306,0.224],[0.0713,0.1969],[-0.0133,0.2223],[-0.0451,0.2096],[-0.1214,0.167],[-0.0441,0.1421],[0.0203,0.1376],[-0.0638,0.1109],[-0.073,0.0667],[0.037,0.0572],[0.0343,0.0544],[-0.041,0.0079],[0.0102,-0.023],[0.1069,-0.019],[0.073,-0.0621],[0.0278,-0.0996],[0.0969,-0.0901],[0.1232,-0.1515],[0.017,-0.1698],[-0.0038,-0.1574],[0.0865,-0.1893],[0.0643,-0.2387],[-0.0411,-0.2457],[-0.0114,-0.2365],[0.0651,-0.2823],[-0.009,-0.3183],[-0.0782,-0.3091],[0.0024,-0.3228],[0.0223,-0.378],[-0.085,-0.3911],[-0.1049,-0.3824],[-0.0378,-0.4316],[-0.0863,-0.4686],[-0.1856,-0.4452],[-0.208,-0.5],[-0.1242,-0.4931],[-0.1643,-0.4853],[-0.0691,-0.4572],[-0.0741,-0.4146],[-0.183,-0.4059],[-0.1715,-0.3959],[-0.0825,-0.3584],[-0.1249,-0.325],[-0.2265,-0.3186],[-0.184,-0.3027],[-0.1208,-0.2578],[-0.2034,-0.2423],[-0.2729,-0.23],[-0.1939,-0.19],[-0.1799,-0.1686],[-0.2882,-0.1545],[-0.261,-0.11],[-0.1699,-0.0949],[-0.2417,-0.0653],[-0.3309,-0.0563],[-0.2836,-0.0347],[-0.2099,-0.0023],[-0.2885,0.0311],[-0.3469,0.0363],[-0.2662,0.0657],[-0.2453,0.104],[-0.3534,0.1188],[-0.3559,0.1346],[-0.2648,0.1706],[-0.3137,0.1973],[-0.409,0.2031],[-0.3595,0.2375],[-0.3168,0.2717],[-0.4199,0.2835],[-0.4511,0.2962],[-0.3737,0.3414],[-0.3911,0.3686],[-0.5,0.3665],[-0.4763,0.4123],[-0.4088,0.4419],[-0.4471,0.5]];
  function boundedSubunit(c,x,y,W,H,col,th,central){
    // The supplied chain's projected C-alpha fold, gently smoothed into a backbone cartoon.
    const pts=subunitBackbone.map(v=>[x+v[0]*W,y+v[1]*H]);
    function path(){
      c.beginPath();c.moveTo(...pts[0]);
      for(let i=0;i<pts.length-1;i++){
        const a=pts[Math.max(0,i-1)],b=pts[i],d=pts[i+1],e=pts[Math.min(pts.length-1,i+2)];
        c.bezierCurveTo(b[0]+(d[0]-a[0])/6,b[1]+(d[1]-a[1])/6,d[0]-(e[0]-b[0])/6,d[1]-(e[1]-b[1])/6,...d);
      }
    }
    c.save();
    // A narrow background stroke keeps boundaries legible where chains approach.
    if(central){path();c.strokeStyle=th.bg;c.lineWidth=4.5;c.stroke();}
    path();c.strokeStyle=col;c.lineWidth=central?2.6:1.8;c.stroke();
    c.restore();
  }
  const intraResiduePairs=[[8, 64], [26, 50], [15, 60], [33, 43]];
  function structureModel(c,w,h,t,th,p){
    const small=w<350,cx=w*.5,cy=h*(small?.43:.44),zoom=at(t,35,37);
    const magnification=mix(1,.44,zoom),dx=w*.185*magnification,dy=h*.19*magnification,W=w*.22*magnification,H=h*.26*magnification;
    const point=(col,row,i)=>[cx+col*dx+subunitBackbone[i][0]*W,cy+row*dy+subunitBackbone[i][1]*H];
    c.save();
    // Keep the faded continuation behind the header and legend rather than through them.
    c.beginPath();c.rect(p,p+23,w-2*p,h-2*p-80);c.clip();
    c.translate(cx,cy);c.rotate(-Math.PI/7.2);c.translate(-cx,-cy);
    const neighbours=[];
    for(let row=-9;row<=9;row++)for(let col=-1;col<=1;col++){
      const central=row===0&&col===0,near=Math.abs(row)<=1;
      c.save();c.globalAlpha*=(central?1:near?.47:mix(.12,.30,zoom))*(Math.abs(row)<=2?1:zoom);
      boundedSubunit(c,cx+col*dx,cy+row*dy,W,H,central?th.fid:th.muted,th,central);c.restore();
      if(!central&&near)neighbours.push([col,row]);
    }
    // Endpoints sit on explicit C-alpha backbone positions, not subunit centres.
    c.save();c.globalAlpha*=at(t,31,32);c.setLineDash([2,2]);
    for(const [i,j] of intraResiduePairs){
      const a=point(0,0,i),b=point(0,0,j);
      // Solid high-contrast links and ringed sites distinguish intra-subunit contacts.
      c.setLineDash([]);
      line(c,[a,b],th.bg,4.8);line(c,[a,b],th.ink,2.4);
      for(const v of [a,b]){
        dot(c,...v,small?3.1:3.6,th.bg);
        dot(c,...v,small?2.4:2.9,th.ink);
        dot(c,...v,small?1.1:1.4,th.bg);
      }
    }
    c.restore();
    c.save();c.globalAlpha*=at(t,32.5,34);c.setLineDash([3,3]);
    for(const [col,row] of neighbours){
      // Select nearby projected backbone sites for this illustrative packing.
      const candidates=[];
      for(let i=4;i<76;i+=3)for(let j=4;j<76;j+=3){
        const a=point(0,0,i),b=point(col,row,j),d=Math.hypot(a[0]-b[0],a[1]-b[1]);
        candidates.push({i,j,a,b,d});
      }
      candidates.sort((a,b)=>a.d-b.d);
      const used=[];
      for(const v of candidates){
        if(used.some(u=>Math.abs(u-v.i)<9))continue;
        line(c,[v.a,v.b],th.red,1.8);dot(c,...v.a,1.6,th.red);dot(c,...v.b,1.6,th.red);used.push(v.i);
        if(used.length===2)break;
      }
    }
    c.restore();c.restore();
    const ly=h-p-45;
    line(c,[[p,ly],[p+17,ly]],th.ink,2.4);text(c,th,'Intra: backbone sites',p+24,ly,th.soft);
    line(c,[[p,ly+18],[p+17,ly+18]],th.red,1.7);text(c,th,'Inter: nearby subunits',p+24,ly+18,th.soft);
    cap(c,th,'Cα backbone cartoon · illustrative contact network','Cα cartoon · mock contacts',w,p,h-p-7);
  }
  function contacts(c,w,h,t,th,p){
    const small=w<350,bind=at(t,23,25.5),evidence=at(t,25.5,28),pull=at(t,30,31.5);
    cap(c,th,t<23?'Which contacts join different subunits?':t<30?'Mixed labels isolate inter-subunit contacts':(t<35?'Atomic sites define local contacts':'Local contacts define an extended molecular fibre'),t<23?'Which contacts join subunits?':t<30?'Reveal inter-subunit contacts':(t<35?'Atomic contacts in a fibre':'Local contacts → extended fibre'),w,p,p+6);
    const r=w*(small?.135:.13)*(1-pull*.28),cy=h*.48;
    const xa=mix(w*.25,w*.39,bind),xb=mix(w*.75,w*.61,bind);
    c.save();c.globalAlpha*=1-pull;
    unit(c,th,xa,cy,r,th.fid);unit(c,th,xb,cy,r,th.spec);
    text(c,th,'¹⁵N only',xa-(small?6:0),cy-r-17,th.fid,'center');text(c,th,'¹³C only',xb+(small?6:0),cy-r-17,th.spec,'center');
    for(let i=0;i<3;i++){
      const a=[xa+r*(.35+i*.12),cy+r*(-.4+i*.3)],b=[xb-r*(.65-i*.12),cy+r*(-.32+i*.3)];
      dot(c,...a,2,th.fid);dot(c,...b,2,th.spec);
      c.save();c.globalAlpha*=evidence;c.setLineDash([3,3]);line(c,[a,b],th.red,1.6);c.restore();
    }
    text(c,th,'1:1 mixture before assembly',w*.5,h*.75,th.soft,'center');
    c.save();c.globalAlpha*=evidence;
    cap(c,th,'¹⁵N–¹³C PAIN-CP: signals cross subunit boundaries','PAIN-CP: between subunits',w,p,h-p-7);c.restore();c.restore();
    if(pull>0){c.save();c.globalAlpha*=pull;structureModel(c,w,h,t,th,p);c.restore();}
  }
  Anim.register('jove-2017',function(c,w,h,t,th){
    c.clearRect(0,0,w,h);c.lineCap='round';c.lineJoin='round';
    const s=t%39,p=Math.max(12,Math.round(w*.034));
    for(const [a,b,draw] of [[0,9,opening],[9,20,assignment],[20,39,contacts]]){
      const alpha=at(s,a,a+.5)*(1-at(s,b-.5,b));
      if(alpha>0){c.save();c.globalAlpha*=alpha;draw(c,w,h,s,th,p);c.restore();}
    }
  },{loop:39,still:34});
})();
