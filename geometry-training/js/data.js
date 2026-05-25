// 类别一：认识图形
const category1 = {
  id: 'recognize', title: '认识图形', icon: '△',
  desc: '认识和辨别基本平面图形，掌握图形特征与分类方法',
  color: '#4f46e5',
  problems: [
    { id: 're-e1', difficulty: 'easy', title: '辨认基本图形',
      question: '观察下面的图形，说出每个图形的名称。',
      answer: '依次为：长方形、正方形、三角形、圆、平行四边形。',
      thought: ['长方形：对边相等且平行，四个角都是直角。','正方形：四条边都相等，四个角都是直角。','三角形：有三条边、三个角。','圆：由一条封闭曲线围成。','平行四边形：对边平行且相等。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cl=[Draw.colors.primary,Draw.colors.green,Draw.colors.accent,Draw.colors.blue,Draw.colors.pink];
        const lb=['长方形','正方形','三角形','圆','平行四边形'];
        const cw=65,g=10,sx=(w-(cw*5+g*4))/2,cy=h/2-5;
        ctx.fillStyle=cl[0]+'20';ctx.fillRect(sx,cy-30,65,45);Draw.rect(ctx,sx,cy-30,65,45,{color:cl[0],width:2.5});Draw.label(ctx,lb[0],sx+32,cy-50,{size:12,color:cl[0]});
        const sx2=sx+cw+g;ctx.fillStyle=cl[1]+'20';ctx.fillRect(sx2,cy-25,45,45);Draw.rect(ctx,sx2,cy-25,45,45,{color:cl[1],width:2.5});Draw.label(ctx,lb[1],sx2+22,cy-45,{size:12,color:cl[1]});
        const tx=sx2+cw+g;const tp=[{x:tx+30,y:cy-30},{x:tx+5,y:cy+20},{x:tx+55,y:cy+20}];Draw.fillPolygon(ctx,tp,cl[2],0.15);Draw.polygon(ctx,tp,{color:cl[2],width:2.5});Draw.label(ctx,lb[2],tx+30,cy-45,{size:12,color:cl[2]});
        const cx2=tx+cw+g+30;ctx.fillStyle=cl[3]+'20';ctx.beginPath();ctx.arc(cx2,cy+2,25,0,Math.PI*2);ctx.fill();Draw.circle(ctx,cx2,cy+2,25,{color:cl[3],width:2.5});Draw.label(ctx,lb[3],cx2,cy-38,{size:12,color:cl[3]});
        const px=cx2+cw+g;const pp=[{x:px+5,y:cy-30},{x:px+60,y:cy-30},{x:px+50,y:cy+20},{x:px-5,y:cy+20}];Draw.fillPolygon(ctx,pp,cl[4],0.15);Draw.polygon(ctx,pp,{color:cl[4],width:2.5});Draw.label(ctx,lb[4],px+27,cy-45,{size:12,color:cl[4]});
      }
    },
    { id: 're-e2', difficulty: 'easy', title: '数一数正方形',
      question: '数一数，下图中共有几个正方形？',
      answer: '共有 5 个正方形（4个小正方形+1个大正方形）。',
      thought: ['先数小的正方形：每行2个有2行，共4个。','再数大的正方形：由4个小正方形拼成，有1个。','一共：4+1=5个。','注意：有序思考，先小后大，不重复不遗漏。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=70,x=(w-s*2)/2,y=(h-s*2)/2;
        Draw.grid(ctx,x,y,2,2,s,{color:Draw.colors.primary,lineWidth:2.5});
        for(let r=0;r<2;r++)for(let c2=0;c2<2;c2++)Draw.label(ctx,(r*2+c2+1)+'',x+c2*s+s/2,y+r*s+s/2,{size:16,color:Draw.colors.primary,bold:true,bg:'#eef2ff'});
        Draw.rect(ctx,x-3,y-3,s*2+6,s*2+6,{color:Draw.colors.accent,width:3,dash:[6,4]});
        Draw.label(ctx,'5',x+s,y+s,{size:22,color:Draw.colors.accent,bold:true,bg:'#fef3c7'});
      }
    },
    { id: 're-m1', difficulty: 'medium', title: '数三角形',
      question: '下图中有几个三角形？',
      answer: '共有 6 个三角形。',
      thought: ['单个小三角形：3个。','由2个小三角形组成：2个。','由3个小三角形组成的大三角形：1个。','一共：3+2+1=6个。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cx=w/2,cy=h/2-10,t={x:cx,y:cy-60},bl={x:cx-75,y:cy+40},br={x:cx+75,y:cy+40},mid={x:cx,y:cy+40};
        const l2={x:cx-38,y:cy+40},r2={x:cx+38,y:cy+40};
        Draw.polygon(ctx,[t,bl,br],{color:Draw.colors.primary,width:2.5});
        Draw.line(ctx,t.x,t.y,mid.x,mid.y,{color:Draw.colors.primary,width:2});
        Draw.line(ctx,t.x,t.y,l2.x,l2.y,{color:Draw.colors.primary,width:2});
        Draw.line(ctx,t.x,t.y,r2.x,r2.y,{color:Draw.colors.primary,width:2});
        Draw.label(ctx,'①',(l2.x+t.x)/2-5,(l2.y+t.y)/2-12,{size:15,bold:true,color:Draw.colors.blue});
        Draw.label(ctx,'②',(l2.x+r2.x)/2,(l2.y+r2.y)/2-8,{size:15,bold:true,color:Draw.colors.green});
        Draw.label(ctx,'③',(r2.x+br.x)/2-5,(r2.y+br.y)/2-12,{size:15,bold:true,color:Draw.colors.blue});
      }
    },
    { id: 're-m2', difficulty: 'medium', title: '判断轴对称图形',
      question: '下面哪些图形是轴对称图形？',
      answer: '等腰三角形、长方形、正五边形是轴对称图形。',
      thought: ['轴对称：沿一条直线对折，两边完全重合。','等腰三角形：沿高对折 ✓','长方形：沿对边中点连线对折 ✓','正五边形：有5条对称轴 ✓'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const drawShape=[(x,y)=>{const p=[{x,y:y-28},{x:x-25,y:y+22},{x:x+25,y:y+22}];Draw.polygon(ctx,p,{color:Draw.colors.primary,width:2});Draw.dashedLine(ctx,x,y-28,x,y+22,{color:Draw.colors.red,width:1.5});Draw.label(ctx,'√',x,y+38,{size:16,bold:true,color:Draw.colors.green});},
        (x,y)=>{const p=[{x:x-30,y:y-25},{x:x+25,y:y-25},{x:x+30,y:y+25},{x:x-35,y:y+25}];Draw.polygon(ctx,p,{color:'#94a3b8',width:2});Draw.label(ctx,'✗',x,y+38,{size:16,bold:true,color:Draw.colors.red});},
        (x,y)=>{Draw.rect(ctx,x-30,y-20,60,40,{color:Draw.colors.primary,width:2});Draw.dashedLine(ctx,x,y-20,x,y+20,{color:Draw.colors.red,width:1.5});Draw.label(ctx,'√',x,y+38,{size:16,bold:true,color:Draw.colors.green});},
        (x,y)=>{const p=[{x:x-30,y:y-22},{x:x+30,y:y-22},{x:x+20,y:y+22},{x:x-40,y:y+22}];Draw.polygon(ctx,p,{color:'#94a3b8',width:2});Draw.label(ctx,'✗',x,y+38,{size:16,bold:true,color:Draw.colors.red});},
        (x,y)=>{const p=[];for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;p.push({x:x+28*Math.cos(a),y:y+28*Math.sin(a)});}Draw.polygon(ctx,p,{color:Draw.colors.primary,width:2});Draw.dashedLine(ctx,x,y-28,x,y+28,{color:Draw.colors.red,width:1.5});Draw.label(ctx,'√',x,y+38,{size:16,bold:true,color:Draw.colors.green});}];
        const gap=w/6;drawShape.forEach((fn,i)=>fn(gap*(i+1),h/2-5));
      }
    },
    { id: 're-h1', difficulty: 'hard', title: '数长方形',
      question: '下图中共有几个长方形（含正方形）？（3列×2行网格）',
      answer: '共有 18 个长方形。',
      thought: ['使用公式：列选法×行选法。','3列中选2条竖线：C(4,2)=6种。','2行中选2条横线：C(3,2)=3种。','一共：6×3=18个长方形。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=45,cols=3,rows=2,gx=(w-cell*cols)/2,gy=(h-cell*rows)/2;
        Draw.grid(ctx,gx,gy,cols,rows,cell,{color:Draw.colors.primary,lineWidth:2});
        Draw.label(ctx,'3列',w/2,gy+rows*cell+25,{size:13,color:'#64748b'});
        Draw.label(ctx,'2行',gx+cols*cell+25,h/2,{size:13,color:'#64748b'});
        Draw.label(ctx,'C(4,2)×C(3,2)=6×3=18',w/2,25,{size:14,bold:true,color:Draw.colors.accent,bg:'#fef3c7'});
      }
    },
    { id: 're-h2', difficulty: 'hard', title: '图形找规律',
      question: '观察图形变化规律，画出第4个图形。',
      answer: '第4个图形由16个小三角形组成。',
      thought: ['第1个：1=1²个小三角形。','第2个：4=2²个小三角形。','第3个：9=3²个小三角形。','规律：第n个由n²个小三角形组成。','第4个：16=4²个小三角形。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const n=4,size=38,totalW=n*size,cx=(w-totalW)/2,cy=(h-n*size*0.866)/2+15;
        for(let row=0;row<n;row++){for(let col=0;col<=row;col++){const x=cx+col*size-row*size/2,y=cy+row*size*0.866;
        const up=[{x,y},{x:x-size/2,y:y+size*0.866},{x:x+size/2,y:y+size*0.866}];
        Draw.polygon(ctx,up,{color:Draw.colors.primary,width:1.5});
        if(row<n-1){const down=[{x:x-size/2,y:y+size*0.866},{x:x+size/2,y:y+size*0.866},{x:x,y:y+size*1.732}];Draw.polygon(ctx,down,{color:'#cbd5e1',width:1,dash:[3,3]});}}}
        Draw.label(ctx,'第4个图形 — 16个小三角形',w/2,22,{size:14,bold:true,color:Draw.colors.primary});
        Draw.label(ctx,'规律：n²',w/2,cy+n*size*0.866+25,{size:12,color:'#64748b'});
      }
    }
  ]
};

// 类别二：周长
const category2 = {
  id: 'perimeter', title: '周长', icon: '□',
  desc: '掌握长方形、正方形及不规则图形的周长计算方法',
  color: '#10b981',
  problems: [
    { id: 'pe-e1', difficulty: 'easy', title: '正方形周长',
      question: '正方形边长5厘米，周长是多少？',
      answer: '周长=20厘米。',
      thought: ['正方形四条边相等。','周长=边长×4。','5×4=20厘米。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=110,x=(w-s)/2,y=(h-s)/2;
        ctx.fillStyle=Draw.colors.green+'15';ctx.fillRect(x,y,s,s);
        Draw.rect(ctx,x,y,s,s,{color:Draw.colors.green,width:2.5});
        Draw.label(ctx,'5cm',x+s/2,y+s+22,{size:14,color:'#333',bold:true});
        Draw.label(ctx,'5cm',x+s+22,y+s/2,{size:14,color:'#333',bold:true});
        Draw.label(ctx,'5cm',x+s/2,y-18,{size:14,color:'#333',bold:true});
        Draw.label(ctx,'5cm',x-18,y+s/2,{size:14,color:'#333',bold:true});
        Draw.label(ctx,'周长=5×4=20cm',w/2,h-15,{size:14,bold:true,color:Draw.colors.green});
      }
    },
    { id: 'pe-e2', difficulty: 'easy', title: '长方形周长',
      question: '长方形长8cm、宽3cm，周长是多少？',
      answer: '周长=22厘米。',
      thought: ['长方形对边相等。','周长=(长+宽)×2。','(8+3)×2=22厘米。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const rw=150,rh=60,x=(w-rw)/2,y=(h-rh)/2;
        ctx.fillStyle=Draw.colors.green+'15';ctx.fillRect(x,y,rw,rh);
        Draw.rect(ctx,x,y,rw,rh,{color:Draw.colors.green,width:2.5});
        Draw.label(ctx,'8cm',x+rw/2,y+rh+22,{size:14,color:'#333',bold:true});
        Draw.label(ctx,'3cm',x+rw+22,y+rh/2,{size:14,color:'#333',bold:true});
        Draw.label(ctx,'周长=(8+3)×2=22cm',w/2,h-15,{size:14,bold:true,color:Draw.colors.green});
      }
    },
    { id: 'pe-m1', difficulty: 'medium', title: 'L形周长',
      question: '求下面L形图形的周长（单位：cm）。',
      answer: '周长=30厘米。',
      thought: ['L形的周长即外围一周总长。','将所有外围边长相加。','也可补成长方形计算：(9+6)×2=30cm。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=22,pts=[{x:0,y:0},{x:7*s,y:0},{x:7*s,y:3*s},{x:4*s,y:3*s},{x:4*s,y:6*s},{x:3*s,y:6*s},{x:3*s,y:3*s},{x:0,y:3*s}];
        const ox=(w-7*s)/2,oy=(h-6*s)/2;const dp=pts.map(p=>({x:p.x+ox,y:p.y+oy}));
        Draw.fillPolygon(ctx,dp,Draw.colors.green,0.12);Draw.polygon(ctx,dp,{color:Draw.colors.green,width:2.5});
        Draw.label(ctx,'7',ox+3.5*s,oy-12,{size:12,color:'#64748b'});
        Draw.label(ctx,'3',ox+7*s+12,oy+1.5*s,{size:12,color:'#64748b'});
        Draw.label(ctx,'4',ox+5.5*s,oy+3*s+12,{size:12,color:'#64748b'});
        Draw.label(ctx,'3',ox+3.5*s,oy+6*s+12,{size:12,color:'#64748b'});
        Draw.label(ctx,'3',ox-12,oy+1.5*s,{size:12,color:'#64748b'});
        Draw.label(ctx,'周长=30cm',w/2,h-12,{size:14,bold:true,color:Draw.colors.green});
      }
    },
    { id: 'pe-m2', difficulty: 'medium', title: '已知周长求边长',
      question: '正方形周长20cm，边长是多少？',
      answer: '边长=5厘米。',
      thought: ['正方形周长=边长×4。','边长=周长÷4。','20÷4=5厘米。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=80,x=(w-s)/2,y=(h-s)/2;
        ctx.fillStyle=Draw.colors.green+'15';ctx.fillRect(x,y,s,s);
        Draw.rect(ctx,x,y,s,s,{color:Draw.colors.green,width:2.5});
        Draw.label(ctx,'?cm',x+s/2,y+s/2,{size:18,bold:true,color:Draw.colors.accent});
        Draw.label(ctx,'周长=20cm',x+s/2,y-18,{size:13,color:'#64748b'});
        Draw.label(ctx,'边长=20÷4=5cm',w/2,h-15,{size:14,bold:true,color:Draw.colors.green});
      }
    },
    { id: 'pe-h1', difficulty: 'hard', title: '不规则图形周长（平移法）',
      question: '求台阶形图形的周长（单位：cm）。',
      answer: '周长=30厘米。',
      thought: ['用平移法：将凹凸边平移。','平移后变成一个长方形。','大长方形长9cm宽6cm，(9+6)×2=30cm。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=18;const pts=[{x:0,y:6*s},{x:6*s,y:6*s},{x:6*s,y:4*s},{x:4*s,y:4*s},{x:4*s,y:2*s},{x:2*s,y:2*s},{x:2*s,y:0},{x:0,y:0}];
        const ox=(w-6*s)/2,oy=(h-6*s)/2;const dp=pts.map(p=>({x:p.x+ox,y:p.y+oy}));
        Draw.fillPolygon(ctx,dp,Draw.colors.accent,0.12);Draw.polygon(ctx,dp,{color:Draw.colors.accent,width:2.5});
        Draw.rect(ctx,ox,oy,6*s,6*s,{color:Draw.colors.red,width:1.5,dash:[5,4]});
        Draw.label(ctx,'平移法→大长方形',w/2,18,{size:13,bold:true,color:Draw.colors.red});
        Draw.label(ctx,'(9+6)×2=30cm',w/2,h-12,{size:14,bold:true,color:Draw.colors.accent});
      }
    },
    { id: 'pe-h2', difficulty: 'hard', title: '凹凸形周长比较',
      question: '下面三个图形，哪个周长最长？',
      answer: '周长相等，均为24cm（平移法）。',
      thought: ['用平移法将凹凸边向外平移。','每个图形都可补成6×6正方形。','正方形周长=6×4=24cm，三者相等。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=15,gap=20,totalW=3*6*s+2*gap,ox=(w-totalW)/2,oy=(h-6*s)/2;
        const shapes=[
          [{x:0,y:6*s},{x:6*s,y:6*s},{x:6*s,y:2*s},{x:5*s,y:2*s},{x:5*s,y:s},{x:4*s,y:s},{x:4*s,y:0},{x:0,y:0}],
          [{x:0,y:6*s},{x:6*s,y:6*s},{x:6*s,y:0},{x:5*s,y:0},{x:5*s,y:s},{x:4*s,y:s},{x:4*s,y:2*s},{x:2*s,y:2*s},{x:2*s,y:s},{x:s,y:s},{x:s,y:0},{x:0,y:0}],
          [{x:0,y:6*s},{x:2*s,y:6*s},{x:2*s,y:5*s},{x:4*s,y:5*s},{x:4*s,y:4*s},{x:5*s,y:4*s},{x:5*s,y:3*s},{x:6*s,y:3*s},{x:6*s,y:0},{x:0,y:0}]
        ];
        const colors=[Draw.colors.blue,Draw.colors.green,Draw.colors.accent];
        const labels=['①','②','③'];
        shapes.forEach((s,i)=>{
          const oxx=ox+i*(6*s+gap);const d=s.map(p=>({x:p.x+oxx,y:p.y+oy}));
          Draw.fillPolygon(ctx,d,colors[i],0.1);Draw.polygon(ctx,d,{color:colors[i],width:2});
          Draw.label(ctx,labels[i],oxx+3*s,oy+3*s,{size:16,bold:true,color:colors[i]});
        });
        Draw.label(ctx,'周长都等于24cm（平移法）',w/2,h-10,{size:13,bold:true,color:Draw.colors.red});
      }
    }
  ]
};

// 类别三：面积
const category3 = {
  id: 'area', title: '面积', icon: '▣',
  desc: '理解面积概念，掌握基本图形及组合图形面积计算',
  color: '#f59e0b',
  problems: [
    { id: 'ar-e1', difficulty: 'easy', title: '正方形面积',
      question: '正方形边长4cm，面积是多少？',
      answer: '面积=16平方厘米。',
      thought: ['正方形面积=边长×边长。','4×4=16平方厘米。','面积单位用平方厘米。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=120,x=(w-s)/2,y=(h-s)/2;
        ctx.fillStyle=Draw.colors.accent+'15';ctx.fillRect(x,y,s,s);
        Draw.rect(ctx,x,y,s,s,{color:Draw.colors.accent,width:2.5});
        Draw.grid(ctx,x,y,4,4,s/4,{color:Draw.colors.accent+'40',lineWidth:1});
        Draw.label(ctx,'4cm',x+s/2,y+s+22,{size:14,bold:true,color:'#333'});
        Draw.label(ctx,'4cm',x+s+22,y+s/2,{size:14,bold:true,color:'#333'});
        Draw.label(ctx,'面积=4×4=16cm²',w/2,h-15,{size:14,bold:true,color:Draw.colors.accent});
      }
    },
    { id: 'ar-e2', difficulty: 'easy', title: '长方形面积',
      question: '长方形长6cm、宽4cm，面积是多少？',
      answer: '面积=24平方厘米。',
      thought: ['长方形面积=长×宽。','6×4=24平方厘米。','也可理解：一行6个小正方形，有4行。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const rw=160,rh=100,x=(w-rw)/2,y=(h-rh)/2;
        ctx.fillStyle=Draw.colors.accent+'15';ctx.fillRect(x,y,rw,rh);
        Draw.rect(ctx,x,y,rw,rh,{color:Draw.colors.accent,width:2.5});
        Draw.grid(ctx,x,y,6,4,rw/6,{color:Draw.colors.accent+'40',lineWidth:1});
        Draw.label(ctx,'6cm',x+rw/2,y+rh+22,{size:14,bold:true,color:'#333'});
        Draw.label(ctx,'4cm',x+rw+22,y+rh/2,{size:14,bold:true,color:'#333'});
        Draw.label(ctx,'面积=6×4=24cm²',w/2,h-15,{size:14,bold:true,color:Draw.colors.accent});
      }
    },
    { id: 'ar-m1', difficulty: 'medium', title: '三角形面积',
      question: '三角形底6cm、高4cm，面积是多少？',
      answer: '面积=12平方厘米。',
      thought: ['三角形面积=底×高÷2。','为什么要÷2？两个一样的三角形拼成平行四边形。','6×4÷2=12平方厘米。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const base=140,hv=90,bx=(w-base)/2,by=(h+hv)/2;
        const t={x:w/2,y:by-hv},bl={x:bx,y:by},br={x:bx+base,y:by};
        Draw.fillPolygon(ctx,[t,bl,br],Draw.colors.accent,0.12);
        Draw.polygon(ctx,[t,bl,br],{color:Draw.colors.accent,width:2.5});
        Draw.dashedLine(ctx,t.x,t.y,t.x,by,{color:Draw.colors.red,width:2});
        Draw.label(ctx,'高4cm',t.x+18,(t.y+by)/2,{size:13,color:Draw.colors.red,bold:true});
        Draw.label(ctx,'底6cm',w/2,by+20,{size:13,color:'#333',bold:true});
        Draw.rightAngle(ctx,t.x,by,10,10);
        Draw.label(ctx,'面积=6×4÷2=12cm²',w/2,20,{size:14,bold:true,color:Draw.colors.accent});
      }
    },
    { id: 'ar-m2', difficulty: 'medium', title: '平行四边形面积',
      question: '平行四边形底8cm、高3cm，面积是多少？',
      answer: '面积=24平方厘米。',
      thought: ['平行四边形面积=底×高。','沿高剪开可拼成长方形。','8×3=24平方厘米。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const base=150,hv=70,sk=30,bx=(w-base)/2,by=(h+hv)/2;
        const pts=[{x:bx+sk,y:by-hv},{x:bx+base+sk,y:by-hv},{x:bx+base,y:by},{x:bx,y:by}];
        Draw.fillPolygon(ctx,pts,Draw.colors.accent,0.12);Draw.polygon(ctx,pts,{color:Draw.colors.accent,width:2.5});
        const ax=bx+sk+20;Draw.dashedLine(ctx,ax,by-hv,ax,by,{color:Draw.colors.red,width:2});
        Draw.label(ctx,'高3cm',ax+18,by-hv/2,{size:12,color:Draw.colors.red,bold:true});
        Draw.label(ctx,'底8cm',bx+base/2+sk/2,by+20,{size:13,bold:true,color:'#333'});
        Draw.rightAngle(ctx,ax,by,10,10);
        Draw.label(ctx,'面积=8×3=24cm²',w/2,20,{size:14,bold:true,color:Draw.colors.accent});
      }
    },
    { id: 'ar-h1', difficulty: 'hard', title: '组合图形面积',
      question: '求组合图形面积（单位：cm）。',
      answer: '面积=36平方厘米。',
      thought: ['分解为长方形+三角形。','长方形：8×3=24cm²。','三角形底8cm高3cm：8×3÷2=12cm²。','总面积：24+12=36cm²。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const rw=140,rh=50,th=50,bx=(w-rw)/2,by=(h-rh-th)/2+th;
        ctx.fillStyle=Draw.colors.accent+'15';ctx.fillRect(bx,by,rw,rh);
        Draw.rect(ctx,bx,by,rw,rh,{color:Draw.colors.accent,width:2});
        Draw.label(ctx,'长方形8×3=24',bx+rw/2,by+rh/2,{size:11,color:Draw.colors.accent});
        const tri=[{x:bx,y:by},{x:bx+rw,y:by},{x:w/2,y:by-th}];
        Draw.fillPolygon(ctx,tri,Draw.colors.blue,0.1);Draw.polygon(ctx,tri,{color:Draw.colors.blue,width:2});
        Draw.label(ctx,'三角形8×3÷2=12',w/2,by-th/2,{size:11,color:Draw.colors.blue});
        Draw.label(ctx,'总面积=24+12=36cm²',w/2,h-12,{size:14,bold:true,color:Draw.colors.primary});
      }
    },
    { id: 'ar-h2', difficulty: 'hard', title: '等积变形',
      question: '下面两个三角形面积相等吗？为什么？',
      answer: '相等。等底（同底BC）等高。',
      thought: ['△ABC和△DBC共用底边BC。','AD∥BC，平行线间距离相等，所以高相等。','等底等高→面积相等。','这就是等积变形原理。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const base=160,triH=80,bx=(w-base)/2,by=(h+triH)/2;
        const A={x:bx+15,y:by-triH},D={x:bx+base-15,y:by-triH},B={x:bx,y:by},C={x:bx+base,y:by};
        Draw.fillPolygon(ctx,[A,B,C],Draw.colors.blue,0.08);Draw.fillPolygon(ctx,[D,B,C],Draw.colors.accent,0.08);
        Draw.polygon(ctx,[A,B,C],{color:Draw.colors.blue,width:2});Draw.polygon(ctx,[D,B,C],{color:Draw.colors.accent,width:2});
        Draw.dashedLine(ctx,A.x,A.y,D.x,D.y,{color:Draw.colors.red,width:1.5});
        Draw.label(ctx,'AD∥BC',w/2,A.y-15,{size:13,color:Draw.colors.red,bold:true});
        Draw.point(ctx,A.x,A.y,'A',{color:Draw.colors.blue});Draw.point(ctx,D.x,D.y,'D',{color:Draw.colors.accent});
        Draw.point(ctx,B.x,B.y,'B',{color:'#333'});Draw.point(ctx,C.x,C.y,'C',{color:'#333'});
        Draw.dashedLine(ctx,A.x,A.y,A.x,by,{color:Draw.colors.gray,width:1,dash:[3,3]});
        Draw.rightAngle(ctx,A.x,by,8,8);
        Draw.label(ctx,'△ABC=△DBC（等底等高）',w/2,18,{size:14,bold:true,color:Draw.colors.primary});
      }
    }
  ]
};

// 类别四：角度
const category4 = {
  id: 'angle', title: '角度', icon: '∠',
  desc: '认识角的概念，学会角的分类、度量和角度计算',
  color: '#ec4899',
  problems: [
    { id: 'an-e1', difficulty: 'easy', title: '角的分类',
      question: '判断三个角是直角、锐角还是钝角？',
      answer: '①锐角 ②直角 ③钝角。',
      thought: ['锐角<90°','直角=90°','钝角>90°且<180°','与直角比较即可判断。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const angles=[{s:-0.4,e:0.4,l:'锐角',cl:Draw.colors.green,d:'40°'},{s:-0.79,e:0.79,l:'直角',cl:Draw.colors.primary,d:'90°'},{s:-1.1,e:1.1,l:'钝角',cl:Draw.colors.red,d:'130°'}];
        const gap=w/4;angles.forEach((a,i)=>{const cx=gap*(i+1),cy=h/2-5,r=50;
          Draw.line(ctx,cx,cy,cx+r*Math.cos(a.s),cy+r*Math.sin(a.s),{color:a.cl,width:2.5});
          Draw.line(ctx,cx,cy,cx+r*Math.cos(a.e),cy+r*Math.sin(a.e),{color:a.cl,width:2.5});
          Draw.angleArc(ctx,cx,cy,18,a.s,a.e,{color:a.cl,width:2,label:a.d});
          Draw.label(ctx,a.l,cx,cy+r+22,{size:14,bold:true,color:a.cl});
          Draw.point(ctx,cx,cy,'',{r:3,color:'#333'});});
        Draw.label(ctx,'←小于90°    等于90°    大于90°→',w/2,h-12,{size:11,color:'#94a3b8'});
      }
    },
    { id: 'an-e2', difficulty: 'easy', title: '比较角的大小',
      question: '下面两个角，哪个大？哪个小？',
      answer: '∠2>∠1。角的大小看张开程度，与边长短无关。',
      thought: ['角的大小由两边张开程度决定。','与边的长短无关！','∠1边虽长但张开小。','∠2边虽短但张开大。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cx1=w*0.28,cy1=h/2+10;const a1s=-0.2,a1e=0.2,r1=100;
        Draw.line(ctx,cx1,cy1,cx1+r1*Math.cos(a1s),cy1+r1*Math.sin(a1s),{color:Draw.colors.blue,width:2});
        Draw.line(ctx,cx1,cy1,cx1+r1*Math.cos(a1e),cy1+r1*Math.sin(a1e),{color:Draw.colors.blue,width:2});
        Draw.angleArc(ctx,cx1,cy1,20,a1s,a1e,{color:Draw.colors.blue,label:'∠1'});Draw.point(ctx,cx1,cy1,'',{r:3,color:'#333'});
        const cx2=w*0.72,cy2=h/2+10;const a2s=-0.7,a2e=0.7,r2=55;
        Draw.line(ctx,cx2,cy2,cx2+r2*Math.cos(a2s),cy2+r2*Math.sin(a2s),{color:Draw.colors.accent,width:2});
        Draw.line(ctx,cx2,cy2,cx2+r2*Math.cos(a2e),cy2+r2*Math.sin(a2e),{color:Draw.colors.accent,width:2});
        Draw.angleArc(ctx,cx2,cy2,20,a2s,a2e,{color:Draw.colors.accent,label:'∠2'});Draw.point(ctx,cx2,cy2,'',{r:3,color:'#333'});
        Draw.label(ctx,'∠2 > ∠1',w/2,h-12,{size:14,bold:true,color:Draw.colors.red});
      }
    },
    { id: 'an-m1', difficulty: 'medium', title: '角的度量',
      question: '用量角器量一量，这个角的度数是多少？',
      answer: '度数为60°。',
      thought: ['中心点与顶点重合。','0°刻度线与一边重合。','看另一边所指刻度。','该角为60°，是锐角。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cx=w/2,cy=h/2+20,aS=-0.8,aE=0.3,r=85;
        Draw.line(ctx,cx,cy,cx+r*Math.cos(aS),cy+r*Math.sin(aS),{color:'#333',width:2});
        Draw.line(ctx,cx,cy,cx+r*Math.cos(aE),cy+r*Math.sin(aE),{color:'#333',width:2});
        for(let d=0;d<=180;d+=10){const rad=(d-90)*Math.PI/180;const px=cx+(r+5)*Math.cos(rad),py=cy+(r+5)*Math.sin(rad);
          if(d%30===0||d%10===0){const inner=d%30===0?12:8;const ix=cx+(r+5+inner)*Math.cos(rad),iy=cy+(r+5+inner)*Math.sin(rad);
          Draw.line(ctx,px,py,ix,iy,{color:'#94a3b8',width:1});if(d%30===0){const tx=cx+(r+22)*Math.cos(rad),ty=cy+(r+22)*Math.sin(rad);
          Draw.label(ctx,d+'°',tx,ty,{size:9,color:'#64748b'});}}}
        Draw.angleArc(ctx,cx,cy,25,aS,aE,{color:Draw.colors.pink,width:2.5,label:'60°'});
        Draw.point(ctx,cx,cy,'O',{color:'#333',labelOffsetX:-15,labelOffsetY:10});
        Draw.label(ctx,'用量角器测量→60°',w/2,22,{size:14,bold:true,color:Draw.colors.pink});
      }
    },
    { id: 'an-m2', difficulty: 'medium', title: '角的计算',
      question: '下图中，∠1=30°，求∠2。',
      answer: '∠2=60°。',
      thought: ['∠1和∠2拼成直角。','直角=90°。','∠2=90°-30°=60°。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cx=w/2-20,cy=h/2+20,r=80;
        Draw.line(ctx,cx,cy,cx+r,cy,{color:'#333',width:2});
        Draw.line(ctx,cx,cy,cx,cy-r,{color:'#333',width:2});
        Draw.line(ctx,cx,cy,cx+r*0.5,cy-r*0.55,{color:Draw.colors.primary,width:2});
        Draw.angleArc(ctx,cx,cy,25,-Math.atan2(r*0.55,r*0.5),0,{color:Draw.colors.green,label:'∠1=30°'});
        Draw.angleArc(ctx,cx,cy,25,-Math.PI/2,-Math.atan2(r*0.55,r*0.5),{color:Draw.colors.pink,label:'∠2=?'});
        Draw.rightAngle(ctx,cx+8,cy-8,8,-8);Draw.point(ctx,cx,cy,'O',{color:'#333',labelOffsetX:-12,labelOffsetY:10});
        Draw.label(ctx,'∠2=90°-30°=60°',w/2,h-12,{size:14,bold:true,color:Draw.colors.pink});
      }
    },
    { id: 'an-h1', difficulty: 'hard', title: '三角形内角和',
      question: '已知∠A=50°，∠B=60°，求∠C。',
      answer: '∠C=70°。',
      thought: ['三角形内角和=180°。','∠C=180°-∠A-∠B。','=180°-50°-60°=70°。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cx=w/2,cy=h/2+20,r=90;
        const A={x:cx,y:cy-r},B={x:cx-r*0.866,y:cy+r*0.5},C={x:cx+r*0.6,y:cy+r*0.6};
        Draw.fillPolygon(ctx,[A,B,C],Draw.colors.pink,0.08);Draw.polygon(ctx,[A,B,C],{color:Draw.colors.pink,width:2.5});
        Draw.angleArc(ctx,A.x,A.y,20,Math.atan2(C.y-A.y,C.x-A.x),Math.atan2(B.y-A.y,B.x-A.x),{color:Draw.colors.green,label:'50°'});
        Draw.angleArc(ctx,B.x,B.y,20,Math.atan2(A.y-B.y,A.x-B.x),Math.atan2(C.y-B.y,C.x-B.x),{color:Draw.colors.blue,label:'60°'});
        Draw.angleArc(ctx,C.x,C.y,20,Math.atan2(B.y-C.y,B.x-C.x),Math.atan2(A.y-C.y,A.x-C.x),{color:Draw.colors.red,label:'?'});
        Draw.point(ctx,A.x,A.y,'A',{color:Draw.colors.green});Draw.point(ctx,B.x,B.y,'B',{color:Draw.colors.blue});Draw.point(ctx,C.x,C.y,'C',{color:Draw.colors.red});
        Draw.label(ctx,'∠C=180°-50°-60°=70°',w/2,h-12,{size:14,bold:true,color:Draw.colors.pink});
      }
    },
    { id: 'an-h2', difficulty: 'hard', title: '折叠角度',
      question: '长方形纸折叠后，∠1=40°，求∠2。',
      answer: '∠2=10°。',
      thought: ['长方形四角为90°。','折叠时折痕两侧角相等。','∠2=90°-2×40°=10°。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cw=180,ch=100,bx=(w-cw)/2,by=(h-ch)/2;
        Draw.rect(ctx,bx,by,cw,ch,{color:'#cbd5e1',width:1.5,dash:[4,4]});
        const fold=55;const pts=[{x:bx,y:by},{x:bx+cw,y:by},{x:bx+cw,y:by+ch},{x:bx+cw-fold,y:by+ch-fold}];
        Draw.fillPolygon(ctx,pts,Draw.colors.pink,0.08);Draw.polygon(ctx,pts,{color:Draw.colors.pink,width:2});
        Draw.line(ctx,bx+cw-fold,by+ch,bx+cw,by+ch-fold,{color:Draw.colors.red,width:2.5});
        Draw.angleArc(ctx,bx+cw,by+ch-fold,18,-Math.PI/2,-Math.PI/4,{color:Draw.colors.green,label:'∠1=40°'});
        Draw.angleArc(ctx,bx+cw-fold,by+ch-fold,18,Math.PI*0.75,Math.PI,{color:Draw.colors.blue,label:'∠2=?'});
        Draw.label(ctx,'∠2=90°-2×40°=10°',w/2,h-10,{size:14,bold:true,color:Draw.colors.pink});
      }
    }
  ]
};

// 类别五：图形的运动
const category5 = {
  id: 'transform', title: '图形的运动', icon: '⟳',
  desc: '理解轴对称、平移、旋转三种基本图形运动方式',
  color: '#8b5cf6',
  problems: [
    { id: 'tr-e1', difficulty: 'easy', title: '认识轴对称图形',
      question: '哪些是轴对称图形？在对的下面画√。',
      answer: '蝴蝶、枫叶、五角星是对称的。',
      thought: ['沿直线对折后两边完全重合。','蝴蝶沿身体中线对折重合✓','五角星有5条对称轴✓'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const items=[(x,y)=>{ctx.beginPath();ctx.ellipse(x-12,y,10,16,-0.3,0,Math.PI*2);ctx.fillStyle=Draw.colors.pink+'30';ctx.fill();ctx.strokeStyle=Draw.colors.pink;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.ellipse(x+12,y,10,16,0.3,0,Math.PI*2);ctx.fillStyle=Draw.colors.pink+'30';ctx.fill();ctx.strokeStyle=Draw.colors.pink;ctx.lineWidth=2;ctx.stroke();Draw.dashedLine(ctx,x,y-20,x,y+20,{color:Draw.colors.red,width:1.5});Draw.label(ctx,'√',x,y+30,{size:16,bold:true,color:Draw.colors.green});},
        (x,y)=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18*Math.cos(a),y+18*Math.sin(a));ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.stroke();}Draw.circle(ctx,x,y,5,{color:'#333',fill:'#fff'});Draw.label(ctx,'✗',x,y+30,{size:16,bold:true,color:Draw.colors.red});},
        (x,y)=>{Draw.label(ctx,'🍁',x,y,{size:30});Draw.dashedLine(ctx,x,y-20,x,y+20,{color:Draw.colors.red,width:1.5});Draw.label(ctx,'√',x,y+30,{size:16,bold:true,color:Draw.colors.green});},
        (x,y)=>{Draw.rect(ctx,x-15,y-5,30,25,{color:'#333',width:2});Draw.polygon(ctx,[{x:x-18,y:y-5},{x:x+18,y:y-5},{x:x,y:y-25}],{color:'#333',width:2});Draw.label(ctx,'✗',x,y+30,{size:16,bold:true,color:Draw.colors.red});},
        (x,y)=>{for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5,a2=a+Math.PI/5;if(i===0)ctx.beginPath();ctx.lineTo(x+20*Math.cos(a),y+20*Math.sin(a));ctx.lineTo(x+8*Math.cos(a2),y+8*Math.sin(a2));}ctx.closePath();ctx.fillStyle=Draw.colors.accent+'30';ctx.fill();ctx.strokeStyle=Draw.colors.accent;ctx.lineWidth=2;ctx.stroke();Draw.dashedLine(ctx,x,y-22,x,y+22,{color:Draw.colors.red,width:1.5});Draw.label(ctx,'√',x,y+30,{size:16,bold:true,color:Draw.colors.green});}];
        const gap=w/6;items.forEach((f,i)=>f(gap*(i+1),h/2-5));
      }
    },
    { id: 'tr-e2', difficulty: 'easy', title: '图形的平移',
      question: '三角形向右平移6格，画出平移后的三角形。',
      answer: '各顶点向右平移6格后连线。',
      thought: ['平移：形状/大小/方向不变，位置变。','各点沿同方向移动相同距离。','将三个顶点分别右移6格后连线。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=30,cols=12,rows=6,gx=(w-cell*cols)/2,gy=(h-cell*rows)/2;
        Draw.grid(ctx,gx,gy,cols,rows,cell,{color:'#e2e8f0',lineWidth:0.5});
        const t1=[{x:gx+2*cell,y:gy+1*cell},{x:gx+1*cell,y:gy+4*cell},{x:gx+3*cell,y:gy+4*cell}];
        Draw.fillPolygon(ctx,t1,Draw.colors.blue,0.15);Draw.polygon(ctx,t1,{color:Draw.colors.blue,width:2.5});
        Draw.label(ctx,'原图',gx+2*cell,gy+3*cell,{size:11,color:Draw.colors.blue});
        Draw.arrow(ctx,gx+4*cell,gy+3*cell,gx+6*cell,gy+3*cell,{color:Draw.colors.red,width:2.5});
        const t2=[{x:gx+8*cell,y:gy+1*cell},{x:gx+7*cell,y:gy+4*cell},{x:gx+9*cell,y:gy+4*cell}];
        Draw.fillPolygon(ctx,t2,Draw.colors.green,0.15);Draw.polygon(ctx,t2,{color:Draw.colors.green,width:2.5,dash:[5,4]});
        Draw.label(ctx,'平移后',gx+8*cell,gy+3*cell,{size:11,color:Draw.colors.green});
      }
    },
    { id: 'tr-m1', difficulty: 'medium', title: '补全轴对称图形',
      question: '虚线为对称轴，请画出另一半。',
      answer: '根据对称性，在另一侧画出对应半部分。',
      thought: ['各点到对称轴距离相等。','找出关键点的对称点。','连接对称点得到另一半。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const midX=w/2;Draw.dashedLine(ctx,midX,20,midX,h-20,{color:Draw.colors.red,width:2});
        Draw.label(ctx,'对称轴',midX+15,22,{size:11,color:Draw.colors.red});
        const pts=[{x:midX,y:40},{x:midX-60,y:80},{x:midX-40,y:90},{x:midX-50,y:130},{x:midX-30,y:140},{x:midX-35,y:170},{x:midX,y:200}];
        ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);
        ctx.strokeStyle=Draw.colors.purple;ctx.lineWidth=2.5;ctx.fillStyle=Draw.colors.purple+'15';ctx.fill();ctx.stroke();
        const mirror=pts.map(p=>({x:2*midX-p.x,y:p.y})).reverse();
        ctx.beginPath();ctx.moveTo(mirror[0].x,mirror[0].y);for(let i=1;i<mirror.length;i++)ctx.lineTo(mirror[i].x,mirror[i].y);
        ctx.strokeStyle=Draw.colors.purple;ctx.lineWidth=2.5;ctx.setLineDash([5,4]);ctx.fillStyle=Draw.colors.purple+'08';ctx.fill();ctx.stroke();ctx.setLineDash([]);
        Draw.label(ctx,'补全另一半',w/2,h-10,{size:13,bold:true,color:Draw.colors.purple});
      }
    },
    { id: 'tr-m2', difficulty: 'medium', title: '图形的旋转',
      question: '三角形绕O点顺时针旋转90°，画出旋转后图形。',
      answer: '各边绕O点旋转90°得到新三角形。',
      thought: ['旋转中心O不变。','顺时针90°：右变下，上变右。','形状大小不变，方向改变。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cx=w/2,cy=h/2+20;
        Draw.circle(ctx,cx,cy,4,{fill:Draw.colors.red,color:Draw.colors.red});Draw.label(ctx,'O',cx-18,cy+18,{size:14,bold:true,color:Draw.colors.red});
        const t1=[{x:cx,y:cy},{x:cx+50,y:cy},{x:cx,y:cy+70}];
        Draw.fillPolygon(ctx,t1,Draw.colors.blue,0.12);Draw.polygon(ctx,t1,{color:Draw.colors.blue,width:2.5});Draw.label(ctx,'原图',cx+18,cy+40,{size:11,color:Draw.colors.blue});
        Draw.angleArc(ctx,cx,cy,45,0,Math.PI/2,{color:Draw.colors.red,width:2.5});
        const t2=[{x:cx,y:cy},{x:cx,y:cy-70},{x:cx+50,y:cy}];
        Draw.fillPolygon(ctx,t2,Draw.colors.green,0.12);Draw.polygon(ctx,t2,{color:Draw.colors.green,width:2.5,dash:[5,4]});Draw.label(ctx,'旋转后',cx+20,cy-40,{size:11,color:Draw.colors.green});
        Draw.label(ctx,'绕O点顺时针旋转90°',w/2,h-12,{size:13,bold:true,color:Draw.colors.purple});
      }
    },
    { id: 'tr-h1', difficulty: 'hard', title: '综合运动',
      question: '先右移5格，再绕O逆时针旋转90°，画出最终图形。',
      answer: '先平移再旋转，O点随之平移。',
      thought: ['第一步：向右平移5格。','第二步：绕新O点逆时针旋转90°。','注意旋转中心已移动。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=28,ox=(w-13*cell)/2,oy=(h-7*cell)/2;
        Draw.grid(ctx,ox,oy,13,7,cell,{color:'#e2e8f0',lineWidth:0.5});
        const orig=[{x:ox+cell,y:oy+5*cell},{x:ox+3*cell,y:oy+5*cell},{x:ox+3*cell,y:oy+4*cell},{x:ox+2*cell,y:oy+4*cell},{x:ox+2*cell,y:oy+2*cell},{x:ox+cell,y:oy+2*cell}];
        Draw.fillPolygon(ctx,orig,Draw.colors.blue,0.12);Draw.polygon(ctx,orig,{color:Draw.colors.blue,width:2});Draw.label(ctx,'原图',ox+2*cell,oy+3.5*cell,{size:9,color:Draw.colors.blue});
        const trans=orig.map(p=>({x:p.x+5*cell,y:p.y}));Draw.fillPolygon(ctx,trans,Draw.colors.accent,0.1);Draw.polygon(ctx,trans,{color:Draw.colors.accent,width:2,dash:[4,3]});Draw.label(ctx,'平移后',ox+7*cell,oy+3.5*cell,{size:9,color:Draw.colors.accent});
        const rot=trans.map(p=>{const dx=p.x-(ox+7*cell),dy=p.y-(oy+5*cell);return{x:ox+7*cell+dy,y:oy+5*cell-dx};});
        Draw.fillPolygon(ctx,rot,Draw.colors.green,0.12);Draw.polygon(ctx,rot,{color:Draw.colors.green,width:2.5,dash:[5,4]});Draw.label(ctx,'最终',ox+8*cell,oy+2*cell,{size:9,color:Draw.colors.green});
        Draw.arrow(ctx,ox+4*cell,oy+5*cell,ox+5.5*cell,oy+5*cell,{color:Draw.colors.red,width:2});
        Draw.arrow(ctx,ox+8.5*cell,oy+4.5*cell,ox+8.5*cell,oy+3*cell,{color:Draw.colors.red,width:2});
      }
    },
    { id: 'tr-h2', difficulty: 'hard', title: '找对称轴',
      question: '正五边形和圆各有几条对称轴？',
      answer: '正五边形：5条。圆：无数条。',
      thought: ['正五边形每条顶点到对边中点连线是对称轴，有5条。','圆沿任何直径对折都重合，有无数条。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const gap=w/3,cx1=gap,cy1=h/2-5;
        const pp=[];for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;pp.push({x:cx1+50*Math.cos(a),y:cy1+50*Math.sin(a)});}
        Draw.fillPolygon(ctx,pp,Draw.colors.purple,0.1);Draw.polygon(ctx,pp,{color:Draw.colors.purple,width:2.5});
        for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;Draw.dashedLine(ctx,cx1+55*Math.cos(a),cy1+55*Math.sin(a),cx1+55*Math.cos(a+Math.PI),cy1+55*Math.sin(a+Math.PI),{color:Draw.colors.red,width:1.5});}
        Draw.label(ctx,'5条',cx1,cy1+68,{size:13,bold:true,color:Draw.colors.purple});
        const cx2=gap*2,cy2=h/2-5,r=50;
        ctx.fillStyle=Draw.colors.purple+'08';ctx.beginPath();ctx.arc(cx2,cy2,r,0,Math.PI*2);ctx.fill();
        Draw.circle(ctx,cx2,cy2,r,{color:Draw.colors.purple,width:2.5});
        for(let i=0;i<12;i++){const a=i*Math.PI/12;Draw.dashedLine(ctx,cx2+(r+5)*Math.cos(a),cy2+(r+5)*Math.sin(a),cx2+(r+5)*Math.cos(a+Math.PI),cy2+(r+5)*Math.sin(a+Math.PI),{color:Draw.colors.red,width:1});}
        Draw.label(ctx,'无数条',cx2,cy2+68,{size:13,bold:true,color:Draw.colors.purple});
      }
    }
  ]
};

// 类别六：立体图形
const category6 = {
  id: 'solid', title: '立体图形', icon: '■',
  desc: '认识常见立体图形，掌握表面积和体积计算方法',
  color: '#14b8a6',
  problems: [
    { id: 'so-e1', difficulty: 'easy', title: '认识长方体和正方体',
      question: '长方体有几个面？几条棱？几个顶点？',
      answer: '6个面、12条棱、8个顶点。',
      thought: ['6个面：上、下、左、右、前、后。','12条棱：分3组，每组4条相等。','8个顶点。','正方体是特殊的长方体。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        Draw.box3D(ctx,w/2-50,h/2-25,100,65,40,{color:Draw.colors.teal,frontColor:Draw.colors.teal+'25',topColor:Draw.colors.teal+'40',rightColor:Draw.colors.teal+'15'});
        Draw.label(ctx,'6个面  12条棱  8个顶点',w/2,h-15,{size:13,bold:true,color:Draw.colors.teal});
      }
    },
    { id: 'so-e2', difficulty: 'easy', title: '认识圆柱和圆锥',
      question: '圆柱和圆锥各有几个面？',
      answer: '圆柱3个面（2底面+1侧面）；圆锥2个面（1底面+1侧面）。',
      thought: ['圆柱：上下两个圆底面+曲面侧面。','圆锥：一个圆底面+曲面侧面+一个顶点。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const gap=w/3,cx1=gap,cy1=h/2+15,r1=40,h1=70;
        ctx.fillStyle=Draw.colors.teal+'15';ctx.fillRect(cx1-r1,cy1-h1,r1*2,h1);
        ctx.beginPath();ctx.ellipse(cx1,cy1-h1,r1,12,0,0,Math.PI*2);ctx.fillStyle=Draw.colors.teal+'20';ctx.fill();ctx.strokeStyle=Draw.colors.teal;ctx.lineWidth=2;ctx.stroke();
        Draw.line(ctx,cx1-r1,cy1-h1,cx1-r1,cy1,{color:Draw.colors.teal,width:2});Draw.line(ctx,cx1+r1,cy1-h1,cx1+r1,cy1,{color:Draw.colors.teal,width:2});
        ctx.beginPath();ctx.ellipse(cx1,cy1,r1,12,0,0,Math.PI*2);ctx.fillStyle=Draw.colors.teal+'10';ctx.fill();ctx.strokeStyle=Draw.colors.teal;ctx.lineWidth=2;ctx.stroke();
        Draw.label(ctx,'圆柱 3个面',cx1,cy1+40,{size:12,bold:true,color:Draw.colors.teal});
        const cx2=gap*2,cy2=h/2+15,r2=38,h2=75;
        Draw.fillPolygon(ctx,[{x:cx2,y:cy2-h2},{x:cx2-r2,y:cy2},{x:cx2+r2,y:cy2}],Draw.colors.teal,0.1);
        Draw.polygon(ctx,[{x:cx2,y:cy2-h2},{x:cx2-r2,y:cy2},{x:cx2+r2,y:cy2}],{color:Draw.colors.teal,width:2});
        ctx.beginPath();ctx.ellipse(cx2,cy2,r2,10,0,0,Math.PI*2);ctx.fillStyle=Draw.colors.teal+'10';ctx.fill();ctx.strokeStyle=Draw.colors.teal;ctx.lineWidth=2;ctx.stroke();
        Draw.label(ctx,'圆锥 2个面',cx2,cy2+40,{size:12,bold:true,color:Draw.colors.teal});
      }
    },
    { id: 'so-m1', difficulty: 'medium', title: '长方体表面积',
      question: '长方体长5cm、宽3cm、高4cm，求表面积。',
      answer: '表面积=94cm²。',
      thought: ['S=2×(长×宽+长×高+宽×高)。','=2×(5×3+5×4+3×4)。','=2×(15+20+12)=94cm²。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        Draw.box3D(ctx,w/2-55,h/2-20,110,60,50,{color:Draw.colors.teal,frontColor:Draw.colors.teal+'25',topColor:Draw.colors.teal+'35',rightColor:Draw.colors.teal+'12'});
        Draw.label(ctx,'5cm',w/2,h/2+55,{size:13,bold:true,color:'#333'});Draw.label(ctx,'3cm',w/2+70,h/2+8,{size:13,bold:true,color:'#333'});Draw.label(ctx,'4cm',w/2-10,h/2-55,{size:13,bold:true,color:'#333'});
        Draw.label(ctx,'S=(5×3+5×4+3×4)×2=94cm²',w/2,h-12,{size:14,bold:true,color:Draw.colors.teal});
      }
    },
    { id: 'so-m2', difficulty: 'medium', title: '正方体体积',
      question: '正方体棱长3cm，体积是多少？',
      answer: '体积=27cm³。',
      thought: ['V=棱长³。','=3×3×3=27cm³。','也可用底面积×高。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=80;Draw.box3D(ctx,w/2-s/2,h/2-s/2,s,s,s*0.5,{color:Draw.colors.teal,frontColor:Draw.colors.teal+'25',topColor:Draw.colors.teal+'35',rightColor:Draw.colors.teal+'12'});
        Draw.label(ctx,'V=3³=27cm³',w/2,22,{size:15,bold:true,color:Draw.colors.teal});
        Draw.label(ctx,'棱长3cm',w/2,h-12,{size:13,bold:true,color:'#333'});
      }
    },
    { id: 'so-h1', difficulty: 'hard', title: '组合体体积',
      question: '组合体由两个长方体组成，求体积。',
      answer: '体积=144cm³。',
      thought: ['下面大长方体：8×4×3=96cm³。','上面小长方体：4×4×3=48cm³。','总体积=96+48=144cm³。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        Draw.box3D(ctx,w/2-60,h/2+5,120,55,40,{color:Draw.colors.teal,frontColor:Draw.colors.teal+'20',topColor:Draw.colors.teal+'30',rightColor:Draw.colors.teal+'10'});
        Draw.box3D(ctx,w/2-35,h/2-40,70,45,25,{color:Draw.colors.primary,frontColor:Draw.colors.primary+'20',topColor:Draw.colors.primary+'30',rightColor:Draw.colors.primary+'10'});
        Draw.label(ctx,'V=8×4×3+4×4×3=144cm³',w/2,18,{size:14,bold:true,color:Draw.colors.teal});
      }
    },
    { id: 'so-h2', difficulty: 'hard', title: '等积变形（立体）',
      question: '正方体容器（棱长6cm）装满水，倒入长9cm宽8cm长方体容器，水深？',
      answer: '水深=3cm。',
      thought: ['水的体积不变：6³=216cm³。','长方体底面积：9×8=72cm²。','水深=216÷72=3cm。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const gap=w/5,cs=65;Draw.box3D(ctx,gap-cs/2,h/2-cs/2,cs,cs,cs*0.4,{color:Draw.colors.blue,frontColor:Draw.colors.blue+'20',topColor:Draw.colors.blue+'30',rightColor:Draw.colors.blue+'10'});
        Draw.label(ctx,'6³=216cm³',gap,h/2+50,{size:11,color:'#64748b'});
        Draw.arrow(ctx,gap+50,h/2,w-gap-50,h/2,{color:Draw.colors.red,width:2});
        Draw.label(ctx,'倒水',w/2,h/2-18,{size:12,color:Draw.colors.red});
        const cw2=110,ch2=55;Draw.box3D(ctx,w-gap-cw2/2,h/2-ch2/2,cw2,ch2,40,{color:Draw.colors.teal,frontColor:Draw.colors.teal+'15',topColor:Draw.colors.teal+'25',rightColor:Draw.colors.teal+'8'});
        ctx.fillStyle=Draw.colors.blue+'25';ctx.fillRect(w-gap-cw2/2+2,h/2+ch2/2-20,cw2-4,20);
        Draw.label(ctx,'水深？',w-gap,h/2+10,{size:13,bold:true,color:Draw.colors.blue});
        Draw.label(ctx,'216÷72=3cm',w-gap,h/2+50,{size:11,color:'#64748b'});
        Draw.label(ctx,'等积变形：体积不变',w/2,22,{size:14,bold:true,color:Draw.colors.teal});
      }
    }
  ]
};

// 类别七：图形分割与组合
const category7 = {
  id: 'divide', title: '图形分割与组合', icon: '⊞',
  desc: '学习图形的等分、割补、剪拼等空间操作技巧',
  color: '#f97316',
  problems: [
    { id: 'di-e1', difficulty: 'easy', title: '等分正方形',
      question: '将正方形分成4个完全相同的小正方形。',
      answer: '连接对边中点，分成4个小正方形。',
      thought: ['横竖各画一条中线（连接对边中点）。','4个小正方形大小形状完全相同。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const s=130,x=(w-s)/2,y=(h-s)/2;
        ctx.fillStyle=Draw.colors.orange+'10';ctx.fillRect(x,y,s,s);
        Draw.rect(ctx,x,y,s,s,{color:Draw.colors.orange,width:2.5});
        Draw.line(ctx,x+s/2,y,x+s/2,y+s,{color:Draw.colors.red,width:2,dash:[6,4]});
        Draw.line(ctx,x,y+s/2,x+s,y+s/2,{color:Draw.colors.red,width:2,dash:[6,4]});
        Draw.label(ctx,'①',x+s/4,y+s/4,{size:18,bold:true,color:Draw.colors.orange});
        Draw.label(ctx,'②',x+3*s/4,y+s/4,{size:18,bold:true,color:Draw.colors.orange});
        Draw.label(ctx,'③',x+s/4,y+3*s/4,{size:18,bold:true,color:Draw.colors.orange});
        Draw.label(ctx,'④',x+3*s/4,y+3*s/4,{size:18,bold:true,color:Draw.colors.orange});
      }
    },
    { id: 'di-e2', difficulty: 'easy', title: '三角形拼平行四边形',
      question: '用两个完全一样的三角形拼成平行四边形。',
      answer: '将相等边重合，反向放置拼接。',
      thought: ['两个完全一样的三角形可拼成平行四边形。','拼成的平行四边形面积=三角形面积×2。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const gap=20,ts=55;const t1=[{x:gap,y:h/2+ts/2},{x:gap+ts,y:h/2+ts/2},{x:gap,y:h/2-ts/2}];
        Draw.fillPolygon(ctx,t1,Draw.colors.orange,0.15);Draw.polygon(ctx,t1,{color:Draw.colors.orange,width:2});
        Draw.label(ctx,'△',gap+ts/3,h/2,{size:16,bold:true,color:Draw.colors.orange});
        const t2=[{x:gap+ts+10,y:h/2+ts/2},{x:gap+ts+10+ts,y:h/2+ts/2},{x:gap+ts+10+ts,y:h/2-ts/2}];
        Draw.fillPolygon(ctx,t2,Draw.colors.blue,0.15);Draw.polygon(ctx,t2,{color:Draw.colors.blue,width:2});
        Draw.label(ctx,'△',gap+1.5*ts+10+ts/3,h/2,{size:16,bold:true,color:Draw.colors.blue});
        Draw.arrow(ctx,gap+2*ts+25,h/2,gap+2*ts+55,h/2,{color:Draw.colors.red,width:2});
        const pgx=gap+2*ts+60;const pp=[{x:pgx,y:h/2+ts/2},{x:pgx+ts,y:h/2+ts/2},{x:pgx+ts+ts/2,y:h/2-ts/2},{x:pgx+ts/2,y:h/2-ts/2}];
        Draw.fillPolygon(ctx,pp,Draw.colors.green,0.12);Draw.polygon(ctx,pp,{color:Draw.colors.green,width:2.5});
        Draw.label(ctx,'平行四边形',pgx+ts*0.75,h/2+3,{size:10,color:Draw.colors.green});
      }
    },
    { id: 'di-m1', difficulty: 'medium', title: '割补法求面积',
      question: '用割补法将平行四边形变成长方形求面积。',
      answer: '沿高切割，平移后拼成长方形，面积=底×高。',
      thought: ['沿高画垂线切下直角三角形。','将三角形补到另一侧拼成长方形。','长方形长=底、宽=高，面积=底×高。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const base=150,hv=70,sk=30,bx=(w-base)/2-sk/2,by=(h+hv)/2+5;
        const pts=[{x:bx+sk,y:by-hv},{x:bx+base+sk,y:by-hv},{x:bx+base,y:by},{x:bx,y:by}];
        Draw.fillPolygon(ctx,pts,Draw.colors.orange,0.1);Draw.polygon(ctx,pts,{color:Draw.colors.orange,width:2.5});
        const cutX=bx+sk;Draw.dashedLine(ctx,cutX,by-hv,cutX,by,{color:Draw.colors.red,width:2.5});
        Draw.fillPolygon(ctx,[{x:cutX,y:by-hv},{x:cutX,y:by},{x:bx,y:by}],Draw.colors.red,0.15);
        Draw.arrow(ctx,(bx+cutX)/2,by+15,cutX+base/2,by+15,{color:Draw.colors.red,width:2});
        Draw.label(ctx,'割补法→长方形',w/2,20,{size:14,bold:true,color:Draw.colors.orange});
      }
    },
    { id: 'di-m2', difficulty: 'medium', title: '图形等分',
      question: '将梯形分成两个面积相等的部分。',
      answer: '连接两腰中点（中位线）。',
      thought: ['连接两腰中点的线段叫中位线。','中位线将梯形分成两个面积相等的部分。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const top=60,bot=150,hv=80,bx=(w-bot)/2,by=(h+hv)/2;
        const pts=[{x:bx+(bot-top)/2,y:by-hv},{x:bx+(bot+top)/2,y:by-hv},{x:bx+bot,y:by},{x:bx,y:by}];
        Draw.fillPolygon(ctx,pts,Draw.colors.orange,0.1);Draw.polygon(ctx,pts,{color:Draw.colors.orange,width:2.5});
        const m1={x:(pts[0].x+pts[3].x)/2,y:(pts[0].y+pts[3].y)/2};
        const m2={x:(pts[1].x+pts[2].x)/2,y:(pts[1].y+pts[2].y)/2};
        Draw.line(ctx,m1.x,m1.y,m2.x,m2.y,{color:Draw.colors.red,width:2.5,dash:[6,4]});
        Draw.fillPolygon(ctx,[pts[3],m1,m2,pts[2]],Draw.colors.blue,0.08);
        Draw.fillPolygon(ctx,[pts[0],pts[1],m2,m1],Draw.colors.green,0.08);
        Draw.label(ctx,'S₁',(bx+m1.x+m2.x)/2,by-hv/3,{size:15,bold:true,color:Draw.colors.blue});
        Draw.label(ctx,'S₂',(bx+bot+m1.x+m2.x)/2-10,by-hv/3,{size:15,bold:true,color:Draw.colors.green});
        Draw.label(ctx,'S₁=S₂',w/2,20,{size:14,bold:true,color:Draw.colors.orange});
      }
    },
    { id: 'di-h1', difficulty: 'hard', title: '剪拼正方形',
      question: '将长方形（9×4）剪一刀拼成正方形。',
      answer: '剪成两部分重新拼成6×6正方形。',
      thought: ['面积=36cm²，正方形边长=6cm。','将长方形分成6×4和3×4两部分。','将3×4对角线剪开拼到两侧成6×6。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const rw=160,rh=70,bx=(w-rw)/2,by=(h-rh)/2;
        ctx.fillStyle=Draw.colors.orange+'12';ctx.fillRect(bx,by,rw,rh);
        Draw.rect(ctx,bx,by,rw,rh,{color:Draw.colors.orange,width:2});
        Draw.label(ctx,'9cm',bx+rw/2,by+rh+18,{size:12,color:'#333'});Draw.label(ctx,'4cm',bx+rw+18,by+rh/2,{size:12,color:'#333'});
        const cutX=bx+rw*6/9;Draw.dashedLine(ctx,cutX,by,cutX,by+rh,{color:Draw.colors.red,width:2});
        Draw.line(ctx,cutX,by+rh,bx+rw,by,{color:Draw.colors.red,width:2.5});Draw.label(ctx,'剪',cutX+12,by+8,{size:14,bold:true,color:Draw.colors.red});
        Draw.arrow(ctx,bx+rw+30,h/2,bx+rw+60,h/2,{color:Draw.colors.red,width:2});
        const sq=90,sqx=bx+rw+65,sqy=(h-sq)/2;
        ctx.fillStyle=Draw.colors.green+'12';ctx.fillRect(sqx,sqy,sq,sq);
        Draw.rect(ctx,sqx,sqy,sq,sq,{color:Draw.colors.green,width:2});
        Draw.label(ctx,'6×6正方形',sqx+sq/2,sqy+sq/2,{size:12,color:Draw.colors.green});
      }
    },
    { id: 'di-h2', difficulty: 'hard', title: '面积守恒',
      question: '两个图形都由7个小正方形组成，面积和周长相等吗？',
      answer: '面积相等（都是7个小正方形），但周长不同。',
      thought: ['都由7个相同小正方形组成，面积相等。','但拼法不同，外围边数不同。','面积相同≠周长相同。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=32,gap=50,ox1=(w-5*cell-gap)/2,oy=(h-3*cell)/2;
        for(let r=0;r<3;r++)for(let c2=0;c2<3;c2++)if(!(r===2&&c2===2))Draw.rect(ctx,ox1+c2*cell,oy+r*cell,cell,cell,{color:Draw.colors.orange,width:1.5,fill:Draw.colors.orange+'15'});
        Draw.label(ctx,'图形A',ox1+1.5*cell,oy-15,{size:12,bold:true,color:Draw.colors.orange});
        const ox2=ox1+5*cell+gap;
        for(let r=0;r<3;r++)for(let c2=0;c2<3;c2++)if(!((r===0||r===2)&&(c2===0||c2===2)))Draw.rect(ctx,ox2+c2*cell,oy+r*cell,cell,cell,{color:Draw.colors.blue,width:1.5,fill:Draw.colors.blue+'15'});
        Draw.label(ctx,'图形B',ox2+1.5*cell,oy-15,{size:12,bold:true,color:Draw.colors.blue});
        Draw.label(ctx,'面积相同，周长不同！',w/2,h-12,{size:14,bold:true,color:Draw.colors.red});
      }
    }
  ]
};

// 类别八：观察物体
const category8 = {
  id: 'observe', title: '观察物体', icon: '◉',
  desc: '从不同方向观察立体图形，培养空间想象力和视图还原能力',
  color: '#3b82f6',
  problems: [
    { id: 'ob-e1', difficulty: 'easy', title: '从正面观察',
      question: '用小正方体搭成的图形，从正面看是什么形状？',
      answer: '看到3个正方形并排。',
      thought: ['从正面看，每列最高者可见。','3列各能看到1个，共3个正方形排成一排。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=30,ox=(w-5*cell)/3,oy=(h-3*cell)/2+10;
        const color=Draw.colors.blue;const rows=[1,2,3];
        rows.forEach((n,i)=>{for(let r=0;r<n;r++){Draw.rect(ctx,ox+i*cell,oy+(3-n+r)*cell,cell,cell,{color:color,fill:color+['20','30','40'][r],width:1.5});}});
        Draw.arrow(ctx,ox+cell,oy+3*cell+10,ox+cell,oy+3*cell+30,{color:Draw.colors.red,width:2});
        Draw.label(ctx,'正面',ox+cell+20,oy+3*cell+25,{size:11,color:Draw.colors.red});
        const fx=ox+4*cell+20,fy=oy+cell;
        Draw.rect(ctx,fx,fy,cell,cell,{color:Draw.colors.green,fill:Draw.colors.green+'25',width:2});
        Draw.rect(ctx,fx+cell,fy,cell,cell,{color:Draw.colors.green,fill:Draw.colors.green+'25',width:2});
        Draw.rect(ctx,fx+2*cell,fy,cell,cell,{color:Draw.colors.green,fill:Draw.colors.green+'25',width:2});
        Draw.label(ctx,'从正面看',fx+1.5*cell,fy+cell+15,{size:11,color:Draw.colors.green});
      }
    },
    { id: 'ob-e2', difficulty: 'easy', title: '从上面观察',
      question: '立体图形从上面看是什么形状？',
      answer: '看到3个正方形呈L形排列。',
      thought: ['从上往下看，每个小正方体顶面都能看到。','3个顶面呈L形排列。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=32,ox=(w-5*cell)/3,oy=(h-3*cell)/2+5,color=Draw.colors.blue;
        const blocks=[{x:ox+cell,y:oy+2*cell},{x:ox+2*cell,y:oy+cell},{x:ox+2*cell,y:oy+2*cell}];
        blocks.forEach(b=>{Draw.rect(ctx,b.x,b.y,cell,cell,{color,fill:color+'25',width:1.5});Draw.rect(ctx,b.x,b.y,cell,cell,{color:color+'60',width:1});});
        Draw.label(ctx,'立体图',ox+2*cell,oy+3*cell+10,{size:10,color});
        const fx=ox+4*cell+20,fy=oy+cell;
        Draw.rect(ctx,fx+cell,fy,cell,cell,{color:Draw.colors.green,fill:Draw.colors.green+'25',width:2});
        Draw.rect(ctx,fx+2*cell,fy,cell,cell,{color:Draw.colors.green,fill:Draw.colors.green+'25',width:2});
        Draw.rect(ctx,fx+2*cell,fy+cell,cell,cell,{color:Draw.colors.green,fill:Draw.colors.green+'25',width:2});
        Draw.label(ctx,'从上面看(L形)',fx+1.8*cell,fy+cell+20,{size:10,color:Draw.colors.green});
        Draw.label(ctx,'从上面观察',w/2,h-10,{size:12,color:'#64748b'});
      }
    },
    { id: 'ob-m1', difficulty: 'medium', title: '不同方向观察',
      question: '将下面图形从正面、上面、左面看到的形状连一连。',
      answer: '正面：2个竖排；上面：L形；左面：2个竖排。',
      thought: ['正面：看到两列，左边1个右边2个。','上面：俯视图为L形。','左面：看到2个竖排。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=25;const ox=(w-9*cell)/2,oy=(h-3*cell)/2;
        const color=Draw.colors.blue;
        Draw.rect(ctx,ox,oy+cell,cell,cell,{color,fill:color+'20',width:1.5});
        Draw.rect(ctx,ox+cell,oy,cell,cell,{color,fill:color+'20',width:1.5});
        Draw.rect(ctx,ox+cell,oy+cell,cell,cell,{color,fill:color+'30',width:1.5});
        Draw.rect(ctx,ox+2*cell,oy+cell,cell,cell,{color,fill:color+'20',width:1.5});
        Draw.label(ctx,'立体图形',ox+1.5*cell,oy+3*cell+8,{size:9,color});
        const views=['正面','上面','左面'];const clr=[Draw.colors.green,Draw.colors.accent,Draw.colors.pink];
        views.forEach((v,i)=>{
          const fx=ox+5*cell,fy=oy+i*cell*1.3;
          if(v==='正面'){Draw.rect(ctx,fx+cell/2,fy+cell/2,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+cell/2,fy+1.5*cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});}
          else if(v==='上面'){Draw.rect(ctx,fx+cell/2,fy+cell/2,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+1.5*cell,fy+cell/2,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+1.5*cell,fy+1.5*cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});}
          else{Draw.rect(ctx,fx+cell/2,fy+cell/2,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+cell/2,fy+1.5*cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});}
          Draw.label(ctx,v,fx+cell,fy+2.5*cell,{size:9,color:clr[i]});
        });
      }
    },
    { id: 'ob-m2', difficulty: 'medium', title: '根据视图搭积木',
      question: '根据三视图，需要几个小正方体？',
      answer: '需要4个小正方体。',
      thought: ['正面看2列（左1右2），上面看3个呈L形，左面看2列。','综合三个视图，最少需要4个。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=28,ox=(w-8*cell)/3,oy=(h-3*cell)/2+5,color=Draw.colors.blue;
        const bps=[{x:ox+cell,y:oy+2*cell},{x:ox+2*cell,y:oy+cell},{x:ox+2*cell,y:oy+2*cell},{x:ox+2*cell,y:oy}];
        bps.forEach(b=>{Draw.rect(ctx,b.x,b.y,cell,cell,{color,fill:color+'20',width:1.5});});
        Draw.label(ctx,'立体图',ox+2*cell,oy+3*cell+10,{size:9,color});
        const views=['正面','上面','左面'];const clr=[Draw.colors.green,Draw.colors.accent,Draw.colors.pink];
        views.forEach((v,i)=>{
          const fx=ox+4*cell+i*cell*2,fy=oy+cell;
          if(v==='正面'){Draw.rect(ctx,fx+cell/2,fy,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+cell/2,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+1.5*cell,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});}
          else if(v==='上面'){Draw.rect(ctx,fx+cell/2,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+1.5*cell,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+1.5*cell,fy,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});}
          else{Draw.rect(ctx,fx+cell/2,fy,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});Draw.rect(ctx,fx+cell/2,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'25',width:2});}
          Draw.label(ctx,v,fx+cell,fy+2.5*cell,{size:9,color:clr[i]});
        });
        Draw.label(ctx,'三视图 → 4个小正方体',w/2,h-10,{size:13,bold:true,color:Draw.colors.blue});
      }
    },
    { id: 'ob-h1', difficulty: 'hard', title: '判断视图',
      question: '从正面、上面、左面观察立体图形，选出正确的视图。',
      answer: '正面：左1右3；上面：L形；左面：左2右1。',
      thought: ['正面看：左边1个，右边3个竖排。','上面看：2列呈倒L形。','左面看：左边2个，右边1个。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=24,ox=(w-7*cell)/2,oy=(h-4*cell)/2+5,color=Draw.colors.blue;
        const layout=[{x:ox,y:oy+2*cell},{x:ox+cell,y:oy+cell},{x:ox+cell,y:oy},{x:ox+cell,y:oy+2*cell}];
        layout.forEach(b=>{Draw.rect(ctx,b.x,b.y,cell,cell,{color,fill:color+'20',width:1.5});});
        Draw.label(ctx,'立体图',ox+cell,oy+4*cell+5,{size:8,color});
        const views=['正面','上面','左面'];const clr=[Draw.colors.green,Draw.colors.accent,Draw.colors.pink];
        views.forEach((v,i)=>{
          const fx=ox+3.5*cell+i*cell*1.8,fy=oy+cell*0.5;
          if(v==='正面'){Draw.rect(ctx,fx,fy,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});Draw.rect(ctx,fx,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});Draw.rect(ctx,fx,fy+2*cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});Draw.rect(ctx,fx+cell,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});}
          else if(v==='上面'){Draw.rect(ctx,fx,fy,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});Draw.rect(ctx,fx+cell,fy,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});Draw.rect(ctx,fx+cell,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});}
          else{Draw.rect(ctx,fx,fy,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});Draw.rect(ctx,fx,fy+cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});Draw.rect(ctx,fx+cell,fy,cell,cell,{color:clr[i],fill:clr[i]+'20',width:2});}
          Draw.label(ctx,v,fx+cell/2,fy+3.5*cell,{size:9,color:clr[i]});
        });
      }
    },
    { id: 'ob-h2', difficulty: 'hard', title: '还原立体图形',
      question: '根据三视图还原立体图形（用几个小正方体？）。',
      answer: '需要6个小正方体。',
      thought: ['正面4列，上面L形分布，左面2列。','综合三个方向信息，确定每层每列的数量。','最少需要6个。'],
      draw: function(ctx,c) {
        const w=c.width,h=c.height;Draw.clear(ctx,w,h);
        const cell=22,ox=(w-12*cell)/3,oy=(h-4*cell)/2+5;
        const views=['正面','上面','左面'];const clr=[Draw.colors.green,Draw.colors.accent,Draw.colors.pink];
        views.forEach((v,i)=>{
          const fx=ox+i*cell*3.5,fy=oy+cell;
          if(v==='正面'){for(let r=0;r<3;r++)for(let c2=0;c2<4;c2++){const m=[[1,1,1,1],[0,1,1,0],[0,1,0,0]];if(m[r][c2])Draw.rect(ctx,fx+c2*cell,fy+r*cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:1.5});}}
          else if(v==='上面'){for(let r=0;r<3;r++)for(let c2=0;c2<3;c2++){const m=[[1,1,0],[1,1,0],[1,0,0]];if(m[r][c2])Draw.rect(ctx,fx+c2*cell,fy+r*cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:1.5});}}
          else{for(let r=0;r<3;r++)for(let c2=0;c2<2;c2++){const m=[[1,1],[1,0],[1,0]];if(m[r][c2])Draw.rect(ctx,fx+c2*cell,fy+r*cell,cell,cell,{color:clr[i],fill:clr[i]+'20',width:1.5});}}
          Draw.label(ctx,v,fx+cell,fy+3.5*cell,{size:9,color:clr[i]});
        });
        Draw.label(ctx,'三视图还原 → 6个小正方体',w/2,h-10,{size:13,bold:true,color:Draw.colors.blue});
      }
    }
  ]
};

const problemDB = [category1, category2, category3, category4, category5, category6, category7, category8];
