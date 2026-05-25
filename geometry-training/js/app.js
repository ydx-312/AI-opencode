(function(){'use strict';
let currentCategory=0,currentDiff='easy';
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
function renderSidebar(){
  const s=document.getElementById('sidebar');
  s.innerHTML='<div class="sidebar-title">题 目 分 类</div>';
  problemDB.forEach((cat,i)=>{
    const div=document.createElement('div');
    div.className='sidebar-item'+(i===currentCategory?' active':'');
    div.innerHTML='<span class="icon" style="background:'+cat.color+'20;color:'+cat.color+'">'+cat.icon+'</span><span>'+cat.title+'</span><span class="count">'+cat.problems.length+'</span>';
    div.onclick=function(){selectCategory(i)};
    s.appendChild(div);
  });
}
function selectCategory(idx){
  currentCategory=idx;currentDiff='easy';
  renderSidebar();renderCategory();
  if(window.innerWidth<=768){document.getElementById('sidebar').classList.remove('mobile-open');document.getElementById('sidebarOverlay').classList.remove('open')}
}
function renderCategory(){
  const cat=problemDB[currentCategory];
  const main=document.getElementById('mainContent');
  let html='<div class="category-header"><h2 style="color:'+cat.color+'">'+cat.icon+' '+cat.title+'</h2><p>'+cat.desc+'</p></div>';
  const diffs=[{key:'easy',label:'\u7B80\u5355',badge:'\u2605'},{key:'medium',label:'\u4E2D\u5EA6',badge:'\u2605\u2605'},{key:'hard',label:'\u96BE\u5EA6',badge:'\u2605\u2605\u2605'}];
  html+='<div class="diff-tabs">';
  diffs.forEach(d=>{html+='<button class="diff-tab'+(d.key===currentDiff?' active':'')+'" data-diff="'+d.key+'" onclick="window._selectDiff(\''+d.key+'\')">'+d.label+'<span class="badge">'+d.badge+'</span></button>'});
  html+='</div>';
  const probs=cat.problems.filter(p=>p.difficulty===currentDiff);
  html+='<div class="problems-grid">';
  probs.forEach((p,i)=>{
    const diffLabel={easy:'\u7B80\u5355',medium:'\u4E2D\u5EA6',hard:'\u96BE\u5EA6'}[p.difficulty];
    const diffCls={easy:'easy',medium:'medium',hard:'hard'}[p.difficulty];
    html+='<div class="problem-card"><div class="card-header"><span class="num">\u4F8B\u9898 '+(i+1)+'</span><span class="diff-label '+diffCls+'">'+diffLabel+'</span></div>';
    html+='<div class="card-body"><p class="question"><strong>'+p.title+'</strong><br>'+p.question+'</p>';
    html+='<div class="canvas-wrap"><canvas id="canvas_'+p.id+'" width="400" height="280"></canvas></div>';
    html+='<div class="solution-area"><button class="solution-toggle" onclick="window._toggleSolution(\''+p.id+'\')">\u663E\u793A\u89E3\u9898\u601D\u8DEF <span class="arrow">\u25BC</span></button>';
    html+='<div class="solution-content" id="sol_'+p.id+'"><div class="thought">';
    p.thought.forEach(s=>{html+='<span class="step">'+s+'</span>'});
    html+='</div><div class="answer">\u7B54\u6848\uFF1A'+p.answer+'</div></div></div></div></div>';
  });
  html+='</div>';
  main.innerHTML=html;
  probs.forEach(p=>{const canvas=document.getElementById('canvas_'+p.id);if(canvas){try{p.draw(canvas.getContext('2d'),canvas)}catch(e){console.warn('Draw error for '+p.id,e)}}});
}
window._selectDiff=function(key){currentDiff=key;renderCategory()};
window._toggleSolution=function(id){
  const el=document.getElementById('sol_'+id);
  const btn=el.previousElementSibling;
  if(el.classList.contains('open')){el.classList.remove('open');btn.classList.remove('open');btn.innerHTML='\u663E\u793A\u89E3\u9898\u601D\u8DEF <span class="arrow">\u25BC</span>'}
  else{el.classList.add('open');btn.classList.add('open');btn.innerHTML='\u9690\u85CF\u89E3\u9898\u601D\u8DEF <span class="arrow">\u25B2</span>'}
};
window._toggleMobileMenu=function(){document.getElementById('sidebar').classList.toggle('mobile-open');document.getElementById('sidebarOverlay').classList.toggle('open')};
function init(){renderSidebar();renderCategory();let timer;window.addEventListener('resize',function(){clearTimeout(timer);timer=setTimeout(renderCategory,300)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
