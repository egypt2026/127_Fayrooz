const SB="https://jekjuhzjckmiquxraygs.supabase.co",KEY="sb_publishable_Ku3tNDxkjgCKulAIiUTdPQ_NYvd4eow";
const ADMIN=!!window.ADMIN;
const $=id=>document.getElementById(id),fmt=n=>(+n||0).toLocaleString("en-US"),sum=a=>a.reduce((t,x)=>t+(+x.amount||0),0);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const MN=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const APTS=[["الأرضي","إسلام"],["الأرضي","صابر حسن"],["الأرضي","عاطف"],["الأرضي","إسلام خالد"],["الأول","مايكل"],["الأول","محمد زكريا"],["الأول","أيمن محمدين"],["الأول","حسام خشانة"],["الثاني","أحمد المصري"],["الثاني","رامي جمال محمود"],["الثاني","محمد سيد"],["الثاني","عماد عز الدين"],["الثالث","أحمد ناصر"],["الثالث","مدام سعاد"],["الثالث","ناصر عبدالظاهر"],["الثالث","إبراهيم معتز"],["الرابع","مدام رضوى"],["الرابع","حماده علي"],["الرابع","محمد علي"],["الرابع","هاني عبدالعزيز"],["الخامس","إسلام سيد"],["الخامس","خالد أحمد"],["الخامس","خليفة"],["الخامس","عماد حنا"]];
let sess=null;try{sess=JSON.parse(localStorage.getItem("fs"))}catch(e){}
let D={s:{adjustment:0,due25:740,schedule:[50,50,50,50,50,200,50,50,50,50,50,50]},P:[],E:[],A:[]};
let tab="apt",RM=today().slice(0,7),offline=false,onSave=null;

async function refresh(){
 try{const r=await fetch(SB+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:sess.refresh_token})});
 if(!r.ok)throw 0;sess=await r.json();localStorage.setItem("fs",JSON.stringify(sess));return true}
 catch(e){sess=null;localStorage.removeItem("fs");return false}}
async function api(p,o={},retry=true){
 const h={apikey:KEY,"Content-Type":"application/json",...(o.headers||{})};
 if(sess)h.Authorization="Bearer "+sess.access_token;
 const r=await fetch(SB+p,{method:o.method,body:o.body,headers:h});
 if(r.status==401&&sess&&retry&&await refresh())return api(p,o,false);
 if(!r.ok)throw new Error(r.status);
 const t=await r.text();return t?JSON.parse(t):null}
async function load(){
 try{const q=t=>api(`/rest/v1/${t}?select=*&order=${t=="settings"?"id":"date.desc,id.desc"}`);
  const [s,P,E,A]=await Promise.all(["settings","payments","expenses","additions"].map(q));
  if(s&&s[0])D.s=s[0];D.P=P;D.E=E;D.A=A;localStorage.setItem("fd",JSON.stringify(D));offline=false}
 catch(e){const c=localStorage.getItem("fd");if(c){D=JSON.parse(c);offline=true}}
 render()}
const cum=m=>(D.s.schedule||[]).slice(0,m).reduce((a,b)=>a+(+b),0);
const monthsNow=()=>{const d=new Date();return d.getFullYear()>2026?12:d.getFullYear()<2026?0:d.getMonth()+1};
const c25=m=>[270,30,30,30,30,50,50,50,50,50,50,50].slice(0,m).reduce((a,b)=>a+b,0);
const adj=()=>+D.s.adjustment||0;

function boot(){
 $("app").innerHTML=`<h1>🏢 صندوق العمارة${ADMIN?" · الماستر":""}</h1>
 ${ADMIN?'<div class="bar"><button class="c" id="cfg">⚙️ الإعدادات</button><button class="c" id="out">خروج</button></div>':""}
 <div class="hero">رصيد الصندوق الحالي<b id="bal">…</b></div>
 <div class="row3"><div class="k">إجمالي المدفوع<b id="tp">0</b></div><div class="k">الإضافات<b id="ta">0</b></div><div class="k">المصروفات<b id="te">0</b></div></div>
 <div class="tabs" id="tabs"></div><div id="list"></div><p class="note" id="nt"></p>
 <dialog id="dlg"><div id="fields"></div><div class="btns"><button class="c" id="cancel">إلغاء</button><button class="a" id="save">حفظ</button></div></dialog>`;
 const T=[["apt","الشقق"],["exp","المصروفات"],["add","الإضافات"],["rep","تقرير"]];if(ADMIN)T.push(["pay","الدفعات"]);
 $("tabs").innerHTML=T.map(([k,l])=>`<button data-t="${k}" class="${k==tab?"on":""}">${l}</button>`).join("");
 document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{tab=b.dataset.t;document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x===b));render()});
 $("cancel").onclick=()=>$("dlg").close();
 $("save").onclick=async()=>{try{await onSave();$("dlg").close();await load()}catch(e){alert("تعذّر الحفظ")}};
 if(ADMIN){$("out").onclick=()=>{localStorage.removeItem("fs");location.reload()};$("cfg").onclick=openCfg}
}
function ask(html,cb){$("fields").innerHTML=html;onSave=cb;$("dlg").showModal()}
const post=(t,b)=>api("/rest/v1/"+t,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(b)});
function openPay(n){ask(`<b>دفعة من شقة ${n} · ${esc(APTS[n-1][1])}</b><label>المبلغ (ج)</label><input id="v1" type="number" inputmode="numeric" value="50"><label>التاريخ</label><input id="v2" type="date" value="${today()}">`,
 ()=>{const a=+$("v1").value;if(!a)throw 0;return post("payments",{apt:n,amount:a,date:$("v2").value})})}
function openSimple(t){ask(`<b>${t=="expenses"?"مصروف جديد":"إضافة جديدة"}</b><label>البيان</label><input id="v0"><label>المبلغ (ج)</label><input id="v1" type="number" inputmode="numeric"><label>التاريخ</label><input id="v2" type="date" value="${today()}">`,
 ()=>{const a=+$("v1").value,d=$("v0").value.trim();if(!a||!d)throw 0;return post(t,{description:d,amount:a,date:$("v2").value})})}
function openCfg(){ask(`<b>الإعدادات</b><label>التسوية على الرصيد</label><input id="v1" type="number" value="${adj()}"><label>المطلوب من كل شقة عن 2025</label><input id="v2" type="number" value="${D.s.due25}">`,
 ()=>api("/rest/v1/settings?id=eq.1",{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({adjustment:+$("v1").value||0,due25:+$("v2").value||0})}))}
async function del(t,id){if(confirm("حذف هذا البند؟"))try{await api(`/rest/v1/${t}?id=eq.${id}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});await load()}catch(e){alert("تعذّر الحذف")}}

function render(){
 if(!$("list"))return;
 const tp=sum(D.P),ta=sum(D.A),te=sum(D.E);
 $("bal").textContent=fmt(tp+ta-te+adj())+" ج";$("tp").textContent=fmt(tp);$("ta").textContent=fmt(ta);$("te").textContent=fmt(te);
 let h="",nt=offline?"⚠️ لا يوجد اتصال — يتم عرض آخر نسخة محفوظة":"";
 if(tab=="apt"){
  const due=(+D.s.due25||0)+cum(monthsNow());
  nt=(nt?nt+" · ":"")+"الرقم الكبير = إجمالي المدفوع من أول 2025. المطلوب من كل شقة حتى الآن: "+fmt(due)+" ج";
  h=APTS.map((a,i)=>{const n=i+1,p=D.P.filter(x=>+x.apt===n),p5=sum(p.filter(x=>x.date<"2026-01-01")),p6=sum(p)-p5,t=p5+p6,d=due-t;
   return `<div class="it"><div class="m"><b>${n} · ${esc(a[1])}</b><div class="s">الدور ${a[0]} · 2025: ${fmt(p5)} · 2026: ${fmt(p6)}</div></div>
   <div style="text-align:left"><div class="n">${fmt(t)} ج</div><span class="pill ${d>0?"l":""}">${d>0?"متبقي "+fmt(d):d<0?"مقدّم "+fmt(-d):"خالص"}</span></div>
   ${ADMIN?`<button class="a" onclick="openPay(${n})">+ دفع</button>`:""}</div>`}).join("")}
 else if(tab=="exp"||tab=="add"){
  const E=tab=="exp",t=E?"expenses":"additions",arr=E?D.E:D.A;
  h=`<div class="bar"><b>${E?"المصروفات 2025+2026":"الإضافات"}: ${fmt(E?te:ta)} ج</b>${ADMIN?`<button class="a" onclick="openSimple('${t}')">+ إضافة</button>`:""}</div>`+
  (arr.map(x=>`<div class="it"><div class="m"><b>${esc(x.description)}</b><div class="s">${esc(x.date)}</div></div><div class="n ${E?"late":"ok"}">${E?"−":"+"}${fmt(x.amount)}</div>${ADMIN?`<button class="x" onclick="del('${t}',${x.id})">✕</button>`:""}</div>`).join("")||'<p class="note">لا يوجد شيء بعد</p>')}
 else if(tab=="pay"){
  h=`<div class="bar"><b>كل الدفعات (${D.P.length})</b></div>`+D.P.map(x=>`<div class="it"><div class="m"><b>${x.apt} · ${esc(APTS[x.apt-1][1])}</b><div class="s">${esc(x.date)} ${esc(x.note||"")}</div></div><div class="n ok">${fmt(x.amount)}</div><button class="x" onclick="del('payments',${x.id})">✕</button></div>`).join("")}
 else{h=report()}
 $("list").innerHTML=h;$("nt").textContent=nt;
 if(tab=="rep"){$("rm").onchange=e=>{if(e.target.value){RM=e.target.value;render()}};$("cp").onclick=async()=>{try{await navigator.clipboard.writeText(window._t);$("cp").textContent="تم النسخ ✓"}catch(e){prompt("انسخ التقرير:",window._t)}}}
}
function report(){
 const st=RM+"-01",[y,m]=RM.split("-").map(Number),en=m==12?(y+1)+"-01-01":y+"-"+String(m+1).padStart(2,"0")+"-01";
 const bf=a=>a.filter(x=>x.date<st),im=a=>a.filter(x=>x.date>=st&&x.date<en);
 const op=(y>=2026?adj():0)+sum(bf(D.P))+sum(bf(D.A))-sum(bf(D.E)),mp=im(D.P),ma=im(D.A),me=im(D.E),tp=sum(mp),ta=sum(ma),te=sum(me),end=op+tp+ta-te;
 const dueM=y==2025?c25(m):y==2026?(+D.s.due25||0)+cum(m):y>2026?(+D.s.due25||0)+cum(12):0;
 const late=APTS.map((a,i)=>({n:i+1,name:a[1],d:dueM-sum(D.P.filter(p=>+p.apt===i+1&&p.date<en))})).filter(x=>x.d>0);
 const by={};mp.forEach(p=>by[p.apt]=(by[p.apt]||0)+(+p.amount));const pk=Object.keys(by);
 let t="📊 تقرير صندوق العمارة – "+MN[m-1]+" "+y+"\n\nرصيد أول الشهر: "+fmt(op)+"\nالمدفوع: "+fmt(tp)+"\nالإضافات: "+fmt(ta)+"\nالمصروفات: "+fmt(te)+"\n✅ رصيد آخر الشهر: "+fmt(end)+" ج";
 if(me.length)t+="\n\nالمصروفات:\n"+me.map(x=>"- "+x.description+": "+fmt(x.amount)).join("\n");
 if(ma.length)t+="\n\nالإضافات:\n"+ma.map(x=>"- "+x.description+": "+fmt(x.amount)).join("\n");
 if(pk.length)t+="\n\nالمدفوع من الشقق:\n"+pk.map(k=>"- "+k+" "+APTS[k-1][1]+": "+fmt(by[k])).join("\n");
 if(late.length)t+="\n\nمتبقي على الشقق (حتى "+MN[m-1]+"):\n"+late.map(x=>"- "+x.n+" "+x.name+": "+fmt(x.d)).join("\n");
 window._t=t;
 const li=(a,c)=>a.length?a.map(x=>`<div class="it"><div class="m"><b>${esc(x.description)}</b><div class="s">${esc(x.date)}</div></div><div class="n ${c}">${fmt(x.amount)}</div></div>`).join(""):'<p class="note">لا يوجد</p>';
 const row=(k,v,c)=>`<div class="it"><div class="m"><b>${k}</b></div><div class="n ${c}">${v}</div></div>`;
 return `<div class="bar"><b>تقرير شهر</b><input type="month" id="rm" min="2025-01" value="${RM}" style="width:auto"></div>
 <div class="row3"><div class="k">أول الشهر<b>${fmt(op)}</b></div><div class="k">المدفوع + الإضافات<b class="ok">+${fmt(tp+ta)}</b></div><div class="k">المصروفات<b class="late">−${fmt(te)}</b></div></div>
 <div class="hero" style="margin-bottom:10px">رصيد آخر الشهر<b>${fmt(end)} ج</b></div>
 <div class="btns" style="margin-bottom:12px"><a class="a" style="background:#25a244" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(t)}">📲 مشاركة على واتساب</a><button class="c" id="cp">نسخ التقرير</button></div>
 <b>مصروفات الشهر</b>${li(me,"late")}<b>إضافات الشهر</b>${li(ma,"ok")}
 <b>مدفوعات الشهر</b>${pk.length?pk.map(k=>row(k+" · "+esc(APTS[k-1][1]),fmt(by[k]),"ok")).join(""):'<p class="note">لا يوجد</p>'}
 <b>متبقي على الشقق</b>${late.length?late.map(x=>row(x.n+" · "+esc(x.name),fmt(x.d),"late")).join(""):'<p class="note">الكل خالص 🎉</p>'}`}

function showLogin(msg){
 $("app").innerHTML=`<h1>🔐 دخول الماستر</h1><div class="it" style="display:block"><label>الإيميل</label><input id="em" type="email" autocomplete="username"><label>كلمة السر</label><input id="pw" type="password" autocomplete="current-password"><p class="late" id="er">${msg||""}</p><button class="a" id="go" style="width:100%">دخول</button></div>`;
 $("go").onclick=async()=>{
  try{const r=await fetch(SB+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({email:$("em").value.trim(),password:$("pw").value})});
  if(!r.ok)throw 0;sess=await r.json();localStorage.setItem("fs",JSON.stringify(sess));start()}
  catch(e){$("er").textContent="بيانات الدخول غير صحيحة"}}}
async function start(){
 if(ADMIN&&!sess){showLogin();return}
 boot();const c=localStorage.getItem("fd");if(c){try{D=JSON.parse(c);render()}catch(e){}}
 await load()}
start();
if("serviceWorker" in navigator&&!ADMIN)addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
