/* Nitty Gritty – tiny patch build (rev.4)
   - Import: robust header/row mapping so *all* rows/columns are captured
             (trims, case-insensitive, space/underscore-insensitive, common synonyms,
              Excel serial dates ➜ ISO yyyy-mm-dd, tolerant numeric parsing)
   - Notes: uniform preview list (same width, nice wrapping & 3-line clamp)
   - Login: hero background is deep blue (CSS), no image
   - Kept exactly as-is: Reset History, Best Strategy, Settings icon, Forgot password
*/
const {useState,useMemo,useEffect,useRef} = React;

/* ---------- Icons (unchanged) ---------- */
const iconCls="h-5 w-5";
const IconUser=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>);
const IconLogout=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>);
const IconDownload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>);
const IconUpload=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 21V11"/><path d="M8 15l4-4 4 4"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></svg>);
const IconCalendar=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>);
const IconPlus=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 5v14M5 12h14"/></svg>);
const IconHistory=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/></svg>);
/* Professional gear (already approved) */
const IconSettings=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={iconCls} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .6-1.8 1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 6.4 2.9l.1.1A1.7 1.7 0 0 0 8.3 4a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .4.2.8.4 1a1.7 1.7 0 0 0 1 .4c.6 0 1.2-.2 1.6-.7l.1-.1A2 2 0 1 1 21.1 6.2l-.1.1c-.3.3-.4.6-.4 1s.1.8.4 1c.3.3.6.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1 .4c-.4.3-.6.6-.7 1Z"/></svg>);
const IconHome=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/></svg>);
const IconNote=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M3 7a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M13 3v4h4"/></svg>);
const IconSave=(p)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2Z"/><path d="M7 3v5h8"/><path d="M7 13h10"/><path d="M7 17h6"/></svg>);

/* ---------- Data & Utils ---------- */
const LOGO_PUBLIC="/logo-ng.png"; const LOGO_FALLBACK="./logo-ng.png.png";
const DEFAULT_SYMBOLS=["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES=[
  {name:"Trend Line Bounce", color:"default"},
  {name:"2 Touch Point Trend Line Break", color:"default"},
  {name:"3 / 3+ Touch Point Trend Line Break", color:"default"},
  {name:"Trend Line Break & Re-test", color:"default"},
  {name:"Trend Continuation", color:"default"}
];
const STRAT_COLORS = { default:"", green:"text-green-400", red:"text-red-400", mustard:"text-amber-400" };
const EXIT_TYPES=["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES=["Cent Account","Dollar Account"];
const r2=n=>Math.round(n*100)/100;
const fmt$=n=>"$"+(isFinite(n)?r2(n):0).toFixed(2);
const todayISO=()=>{const d=new Date();const tz=d.getTimezoneOffset();return new Date(d.getTime()-tz*60000).toISOString().slice(0,10)};
const CURR_KEY="ng_current_user_v1";
const fresh=()=>({name:"",accType:ACC_TYPES[1],capital:0,depositDate:todayISO(),trades:[]});
const getCurrent=()=>{try{return localStorage.getItem(CURR_KEY)||""}catch{return""}};
const saveCurrent=e=>{try{localStorage.setItem(CURR_KEY,e)}catch{}};

/* Tick/pip → $ approximation (unchanged) */
function perLotValueForMove(symbol,delta,accType){
  const abs=Math.abs(delta);const isStd=accType==="Dollar Account";const mult=std=>isStd?std:std/100;
  switch(symbol){
    case"US30":case"US100":return abs*mult(10);
    case"XAUUSD":return abs*mult(100);
    case"BTCUSD":return abs*mult(1);
    case"EURUSD":case"GBPUSD":{const pips=abs/0.0001;return pips*mult(10)}
    case"AUDCAD":case"USDCAD":{const pips=abs/0.0001;return pips*mult(7.236)}
    case"USDJPY":{const pips=abs/0.01;return pips*mult(6.795)}
    default:return 0;
  }
}
function legPnL(symbol,side,entry,exit,lot,accType){
  const raw=perLotValueForMove(symbol,exit-entry,accType)*(lot||0);
  const s=side==="BUY"?Math.sign(exit-entry):-Math.sign(exit-entry);
  return raw*s;
}
function computeDollarPnL(t,accType){
  if (typeof t.pnlOverride === "number" && isFinite(t.pnlOverride)) return t.pnlOverride;
  if(t.exitType === "Trade In Progress") return null;
  if(typeof t.exit==="number"&&(!t.exitType||t.exitType==="TP")) return legPnL(t.symbol,t.side,t.entry,t.exit,t.lotSize,accType);
  const has=v=>typeof v==="number"&&isFinite(v);const{entry,sl,tp1,tp2,lotSize:lot}=t;
  switch(t.exitType){
    case"SL":if(!has(sl))return null;return legPnL(t.symbol,t.side,entry,sl,lot,accType);
    case"TP":if(has(tp2))return legPnL(t.symbol,t.side,entry,tp2,lot,accType);if(has(tp1))return legPnL(t.symbol,t.side,entry,tp1,lot,accType);return null;
    case"TP1_BE":if(!has(tp1))return null;return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+0)/2;
    case"TP1_SL":if(!has(tp1)||!has(sl))return null;return (legPnL(t.symbol,t.side,entry,tp1,lot,accType)+legPnL(t.symbol,t.side,entry,sl,lot,accType))/2;
    case"BE":return 0;
    default:return null;
  }
}
const formatPnlDisplay=(accType,v)=>accType==="Cent Account"?(r2(v*100)).toFixed(2)+" ¢":fmt$(v);
const formatUnits=(accType,v)=>accType==="Dollar Account"?r2(v).toFixed(2):r2(v*100).toFixed(2);

/* CSV export (unchanged) */
function toCSV(rows,accType){
  const H=["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
  const NL="\n"; const BOM="﻿";
  const esc=s=>{if(s===null||s===undefined)return"";const v=String(s);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const out=[H.join(",")];
  for(const t of rows){
    const v=computeDollarPnL(t,accType); const units=v===null?"":formatUnits(accType,v);
    const dollars=v===null?"":r2(v);
    const row=[t.date,t.symbol,t.side,t.lotSize,(t.entry??""),(t.exit??""),(t.tp1??""),(t.tp2??""),(t.sl??""),t.strategy,(t.exitType||""),dollars,units];
    out.push(row.map(esc).join(","));
  }
  return BOM+out.join(NL);
}

/* ---------- Small UI helpers ---------- */
function Stat({label,value,children,className}){return(<div className={`bg-slate-900/50 border border-slate-700 rounded-xl p-3 ${className||""}`}><div className="text-slate-400 text-xs">{label}</div><div className="text-2xl font-bold mt-1">{value}</div>{children}</div>)}
function Th({children,className,...rest}){return(<th {...rest} className={(className?className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>)}
function Td({children,className,...rest}){return(<td {...rest} className={(className?className+" ":"")+"px-4 py-3 align-top"}>{children}</td>)}
function Modal({title,children,onClose,maxClass}){
  return(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3">
      <div className={`relative w-[95vw] ${maxClass||"max-w-3xl"} max-h-[80vh] overflow-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
function Confirm({title,message,confirmText="Continue",cancelText="Discard",onConfirm,onCancel}){
  return(
    <Modal title={title} onClose={onCancel} maxClass="max-w-md">
      <div className="space-y-4">
        <div className="text-slate-200">{message}</div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">{confirmText}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- Error Boundary ---------- */
class ErrorBoundary extends React.Component{
  constructor(p){super(p);this.state={err:null}}
  static getDerivedStateFromError(e){return{err:e}}
  componentDidCatch(e,info){console.error("View crash:",e,info)}
  render(){ if(this.state.err) return <div className="p-4 text-red-300 bg-red-950/30 border border-red-800 rounded-xl">Something went wrong in this view. Please reload or go back.</div>;
    return this.props.children;
  }
}

/* ---------- Account Setup Modal (unchanged) ---------- */
function AccountSetupModal({name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,onClose,email}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    firebase.auth().currentUser.updatePassword(pw1).then(()=>{setMsg("Password updated."); setPw1(""); setPw2("")}).catch(e=>setMsg(e.message));
  };
  return(
    <Modal title="Account Setup" onClose={onClose} maxClass="max-w-2xl">
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Personal Info</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
      </div>
      {tab==="personal"?(
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label><select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label><input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/></div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label><input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          </div>
          <div className="text-right"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Save & Close</button></div>
        </div>
      ):(
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}
    </Modal>
  )
}

/* ---------- Settings Panel (unchanged UI/glyph) ---------- */
function SettingsPanel({name,setName,accType,setAccType,capital,setCapital,depositDate,setDepositDate,email,cfg,setCfg}){
  const [tab,setTab]=useState("personal");
  const [pw1,setPw1]=useState(""); const [pw2,setPw2]=useState(""); const [msg,setMsg]=useState("");
  const savePw=()=>{ if(!pw1||pw1.length<6){setMsg("Password must be at least 6 characters.");return}
    if(pw1!==pw2){setMsg("Passwords do not match.");return}
    firebase.auth().currentUser.updatePassword(pw1).then(()=>{setMsg("Password updated."); setPw1(""); setPw2("")}).catch(e=>setMsg(e.message));
  };
  const [symText,setSymText]=useState("");
  const [stratText,setStratText]=useState(""); const [stratColor,setStratColor]=useState("default");
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings/><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("personal")} className={`px-3 py-1.5 rounded-lg border ${tab==="personal"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Account Setup</button>
        <button onClick={()=>setTab("security")} className={`px-3 py-1.5 rounded-lg border ${tab==="security"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
        <button onClick={()=>setTab("customize")} className={`px-3 py-1.5 rounded-lg border ${tab==="customize"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Customize Journal</button>
      </div>
      {tab==="personal"&&(
        <div className="space-y-4">
          <div><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm text-slate-300">Acc Type</label><select value={accType} onChange={e=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="text-sm text-slate-300">Account Capital ($)</label><input type="number" value={capital} onChange={e=>setCapital(parseFloat(e.target.value||"0"))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00"/></div>
            <div><label className="text-sm text-slate-300">Capital Deposit Date</label><input type="date" value={depositDate} onChange={e=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          </div>
        </div>
      )}
      {tab==="security"&&(
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">New Password</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div><label className="text-sm text-slate-300">Confirm Password</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right"><button onClick={savePw} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button></div>
        </div>
      )}
      {tab==="customize"&&(
        <div className="space-y-6">
          <div>
            <div className="font-semibold mb-2">Symbols</div>
            <div className="flex gap-2 mb-2">
              <input value={symText} onChange={e=>setSymText(e.target.value.toUpperCase())} placeholder="e.g., XAUUSD" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <button onClick={()=>{if(symText && !cfg.symbols.includes(symText)){const n={...cfg,symbols:[...cfg.symbols,symText]};setCfg(n);}}} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{cfg.symbols.map(s=>(<span key={s} className="px-2 py-1 rounded-lg border border-slate-700">{s} <button onClick={()=>{const n={...cfg,symbols:cfg.symbols.filter(x=>x!==s)};setCfg(n)}} className="ml-1 text-red-300">×</button></span>))}</div>
          </div>
          <div>
            <div className="font-semibold mb-2">Strategies (color used in tables)</div>
            <div className="flex gap-2 mb-2">
              <input value={stratText} onChange={e=>setStratText(e.target.value)} placeholder="Strategy name" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
              <select value={stratColor} onChange={e=>setStratColor(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <option value="default">Default</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
                <option value="mustard">Mustard orange</option>
              </select>
              <button onClick={()=>{if(stratText){const n={...cfg,strategies:[...cfg.strategies,{name:stratText,color:stratColor}]};setCfg(n);}}} className="px-3 py-2 rounded-lg border border-slate-700">Add</button>
            </div>
            <div className="space-y-2">
              {cfg.strategies.map((st,idx)=>(
                <div key={idx} className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg border border-slate-700 ${STRAT_COLORS[st.color]||""}`}>{st.name}</span>
                  <select value={st.color} onChange={e=>{const ns=[...cfg.strategies];ns[idx]={...st,color:e.target.value};setCfg({...cfg,strategies:ns})}} className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                    <option value="default">Default</option><option value="green">Green</option><option value="red">Red</option><option value="mustard">Mustard</option>
                  </select>
                  <button onClick={()=>{const n={...cfg,strategies:cfg.strategies.filter((_,i)=>i!==idx)};setCfg(n)}} className="text-red-300 px-2 py-1 rounded-lg border border-red-700">Remove</button>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-400">Changes save automatically.</div>
        </div>
      )}
    </div>
  )
}

/* ---------- Trade Modal (unchanged) ---------- */
function TradeModal({initial,onClose,onSave,onDelete,accType,symbols,strategies}){
  const i=initial||{}; const [symbol,setSymbol]=useState(i.symbol||symbols[0]); const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||todayISO()); const [lotSize,setLotSize]=useState(i.lotSize??0.01);
  const [entry,setEntry]=useState(i.entry??""); const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??""); const [tp2,setTp2]=useState(i.tp2??""); const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||(strategies[0]?.name||"")); const [exitType,setExitType]=useState(i.exitType||"TP");
  const [pnlOverride,setPnlOverride]=useState(i.pnlOverride ?? "");
  const num=v=>{
    if (v === "" || v === undefined || v === null) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };
  const draft=useMemo(()=>({
    id:i.id,
    date,
    symbol,
    side,
    lotSize: num(lotSize) ?? 0.01,
    entry:num(entry),
    exit:num(exit),
    tp1:num(tp1),
    tp2:num(tp2),
    sl:num(sl),
    strategy,
    exitType,
    pnlOverride: num(pnlOverride)
  }),[i.id,date,symbol,side,lotSize,entry,exit,tp1,tp2,sl,strategy,exitType,pnlOverride]);
  const preview=useMemo(()=>{const v=computeDollarPnL(draft,accType);if(v===null||!isFinite(v))return"-";return`${formatPnlDisplay(accType,v)} (${formatUnits(accType,v)})`},[draft,accType]);
  return(
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose} maxClass="max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div><label className="text-sm text-slate-300">Symbol</label><select value={symbol} onChange={e=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{symbols.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className="text-sm text-slate-300">Action</label><div className="mt-1 grid grid-cols-2 gap-2">{["BUY","SELL"].map(s=>(<button key={s} onClick={()=>setSide(s)} className={`px-2 py-2 rounded-lg border ${side===s ? (s==="BUY" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500") : "border-slate-700"}`}>{s}</button>))}</div></div>
        <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Lot size</label>
          <input type="number" step="0.01" value={lotSize} onChange={e=>setLotSize(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
        </div>
        <div><label className="text-sm text-slate-300">Entry price</label><input type="number" step="0.0001" value={entry} onChange={e=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Exit Price</label><input type="number" step="0.0001" value={exit} onChange={e=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN"/></div>
        <div><label className="text-sm text-slate-300">TP 1</label><input type="number" step="0.0001" value={tp1} onChange={e=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">TP 2</label><input type="number" step="0.0001" value={tp2} onChange={e=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">P&L Override ($)</label>
          <input type="number" step="0.01" value={pnlOverride} onChange={e=>setPnlOverride(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Optional"/>
        </div>
        <div><label className="text-sm text-slate-300">Stop-Loss</label><input type="number" step="0.0001" value={sl} onChange={e=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><label className="text-sm text-slate-300">Strategy</label>
          <select value={strategy} onChange={e=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {strategies.map(s=><option key={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div><label className="text-sm text-slate-300">Exit Type</label><select value={exitType} onChange={e=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-300">P&L preview: <span className="font-semibold">{preview}</span></div>
        <div className="flex items-center gap-2">
          {i.id&&(<button onClick={()=>onDelete(i.id)} className="px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20">Delete</button>)}
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Cancel</button>
          <button onClick={()=>onSave(draft)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- Calendar (unchanged) ---------- */
function CalendarModal({onClose,trades,view,setView,month,setMonth,year,setYear,selectedDate,setSelectedDate,accType}){
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dim=(y,m)=>new Date(y,m+1,0).getDate(); const fd=(y,m)=>new Date(y,m,1).getDay();
  const byDate=useMemo(()=>{const m={};for(const t of trades){m[t.date]=m[t.date]||[];m[t.date].push(t)}return m},[trades]);
  const pnlByDate=useMemo(()=>{const m={};for(const date in byDate){const ts=byDate[date].filter(t=>t.exitType && t.exitType !== "Trade In Progress");const pnl=ts.reduce((a,t)=>a+ (computeDollarPnL(t,accType) || 0),0);m[date]=pnl}return m},[byDate,accType]);
  return(
    <Modal title="Calendar" onClose={onClose} maxClass="max-w-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">{['year','month','day'].map(v=>(<button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-lg border ${view===v?'bg-slate-700 border-slate-600':'border-slate-700'}`}>{v.toUpperCase()}</button>))}</div>
        {view!=="day"&&(<div className="flex items-center gap-2">
          <button onClick={()=>view==='month'?(setMonth(m=>(m+11)%12),setYear(year-(month===0?1:0))):setYear(year-1)} className="px-2 py-1 border border-slate-700 rounded-lg">&lt;</button>
          <div className="text-sm">{view==='month'?`${monthNames[month]} ${year}`:year}</div>
          <button onClick={()=>view==='month'?(setMonth(m=>(m+1)%12),setYear(year+(month===11?1:0))):setYear(year+1)} className="px-2 py-1 border border-slate-700 rounded-lg">&gt;</button>
        </div>)}
      </div>
      {view==="year"&&(
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {monthNames.map((mn,i)=>(<button key={mn} onClick={()=>{setMonth(i);setView('month')}} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-left">
            <div className="font-semibold mb-1">{mn}</div>
            <div className="text-slate-400 text-xs">Trades: {trades.filter(t=>(new Date(t.date)).getMonth()===i&&(new Date(t.date)).getFullYear()===year).length}</div>
          </button>))}
        </div>
      )}
      {view==="month"&&(
        <div>
          <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-1">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length:fd(year,month)}).map((_,i)=>(<div key={"e"+i}/>))}
            {Array.from({length:dim(year,month)}).map((_,d)=>{const day=String(d+1).padStart(2,'0');const dateISO=`${year}-${String(month+1).padStart(2,'0')}-${day}`;const items=byDate[dateISO]||[];const pnl=pnlByDate[dateISO]||0;
              const colorClass=pnl>0 ? 'border-green-700/60 bg-green-900/10' : pnl<0 ? 'border-red-700/60 bg-red-900/10' : items.length ? 'border-blue-700/60 bg-blue-900/10' : 'border-slate-700 bg-slate-900/30';
              return(<button key={dateISO} onClick={()=>{setSelectedDate(dateISO);setView('day')}} className={`text-left p-1 rounded-lg border ${colorClass}`}>
                <div className="text-xs text-slate-400">{d+1}</div>
                <div className={`text-xs ${pnl>0?'text-green-400':pnl<0?'text-red-400':'text-slate-400'}`}>{pnl!==0 ? formatPnlDisplay(accType,pnl) : ''}</div>
              </button>)})}
          </div>
        </div>
      )}
      {view==="day"&&(
        <div>
          <div className="text-sm text-slate-300 mb-2">{selectedDate}</div>
          {(byDate[selectedDate]||[]).length===0?(<div className="text-slate-400 text-sm">No trades this day.</div>):(
            <div className="space-y-2">{(byDate[selectedDate]||[]).map(t=>(<div key={t.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
              <div className="text-sm"><span className="text-blue-300 font-medium">{t.symbol}</span> · {t.side} · Lot {t.lotSize}</div>
              <div className="text-sm">{typeof t.entry==='number'?fmt$(t.entry):''} → {typeof t.exit==='number'?fmt$(t.exit):''}</div>
            </div>))}</div>
          )}
        </div>
      )}
    </Modal>
  )
}

/* ---------- Dashboard blocks (updated) ---------- */
function getFilteredTrades(trades, timeframe, depositDate){
  const now = new Date();
  const closedTrades = trades.filter(t => t.exitType && t.exitType !== "Trade In Progress");
  let filtered = closedTrades;
  if(timeframe === "since_deposit"){
    filtered = filtered.filter(t => new Date(t.date) >= new Date(depositDate));
  } else if(timeframe === "last_30_days"){
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    filtered = filtered.filter(t => new Date(t.date) >= cutoff);
  } else if(timeframe === "last_7_days"){
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 7);
    filtered = filtered.filter(t => new Date(t.date) >= cutoff);
  } else if(timeframe === "last_20_trades"){
    const sorted = [...closedTrades].sort((a,b) => new Date(b.date) - new Date(a.date));
    filtered = sorted.slice(0,20);
  }
  return filtered;
}
function computeCumulAndDD(filtered, accType, capital){
  const sorted = [...filtered].sort((a,b) => new Date(a.date) - new Date(b.date));
  let cumul = [];
  let sum = 0;
  let maxPeak = 0;
  let maxDD = 0;
  sorted.forEach(t => {
    const pnl = computeDollarPnL(t, accType) || 0;
    sum += pnl;
    cumul.push(sum);
    maxPeak = Math.max(maxPeak, sum);
    maxDD = Math.max(maxDD, maxPeak - sum);
  });
  const ddPct = capital > 0 ? (maxDD / capital) * 100 : 0;
  return {cumul, maxDD: r2(maxDD), ddPct: r2(ddPct)};
}
function EquitySparkline({cumul}){
  if(cumul.length < 2) return null;
  const w = 220, h = 40;
  const minV = Math.min(...cumul, 0);
  const maxV = Math.max(...cumul, 0);
  const range = maxV - minV || 1;
  const points = cumul.map((v,i) => {
    const x = (i / (cumul.length - 1)) * w;
    const y = h - ((v - minV) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const color = cumul[cumul.length-1] > 0 ? '#22c55e' : '#ef4444';
  return <svg width={w} height={h} className="mt-1"><polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>;
}
function GeneralStats({trades, filteredTrades, accType, capital, depositDate, timeframe}){
  const realizedPnls = filteredTrades.map(t => computeDollarPnL(t, accType)).filter(v => v !== null && isFinite(v));
  const total = realizedPnls.reduce((a,b)=>a+b,0);
  const wins = realizedPnls.filter(v=>v>0).length;
  const losses = realizedPnls.filter(v=>v<0).length;
  const open = trades.filter(t=> !t.exitType || t.exitType === "Trade In Progress").length;
  const wr = (wins+losses)>0 ? Math.round((wins/(wins+losses))*100) : 0;
  const {cumul, ddPct} = useMemo(() => computeCumulAndDD(filteredTrades, accType, capital), [filteredTrades, accType, capital]);
  const equityChange = formatPnlDisplay(accType, total);
  const ddValue = ddPct > 0 ? `-${ddPct}%` : '0%';
  const timeframeLabel = timeframe === "since_deposit" ? `Since ${depositDate}` : timeframe.replace(/_/g,' ').replace('last','Last');
  if(filteredTrades.length === 0){
    return <div className="text-slate-400 text-sm">No closed trades yet in this timeframe. Once you log a few, we’ll show your statistics here.</div>;
  }
  return(<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Equity Change" value={equityChange} className={total>0 ? 'border-green-700/60' : total<0 ? 'border-red-700/60' : ''}>
      <EquitySparkline cumul={cumul} />
      <div className="text-xs text-slate-400 mt-1">{timeframeLabel}</div>
    </Stat>
    <Stat label="Win Rate" value={`${wr}%`} />
    <Stat label="Open Trades" value={open} />
    <Stat label="Drawdown (approx)" value={ddValue} className={ddPct>0 ? 'text-amber-400' : ''} />
  </div>)
}
function DashboardSummary({filteredTrades, accType, capital, depositDate, timeframe, bestSymbol, bestStrategy}){
  const realizedPnls = filteredTrades.map(t => computeDollarPnL(t, accType)).filter(v => v !== null && isFinite(v));
  const total = realizedPnls.reduce((a,b)=>a+b,0);
  const pct = capital > 0 ? r2((total / capital) * 100) : 0;
  const wr = realizedPnls.length > 0 ? Math.round((realizedPnls.filter(v=>v>0).length / realizedPnls.length) * 100) : 0;
  const sign = total > 0 ? 'up' : total < 0 ? 'down' : 'flat at';
  const timeframeText = timeframe === "since_deposit" ? `since ${depositDate}` : `in ${timeframe.replace(/_/g,' ').replace('last','the last')}`;
  const bestSymText = bestSymbol ? `Best symbol: ${bestSymbol}` : '';
  const bestStratText = bestStrategy ? `best strategy: ${bestStrategy}` : '';
  return <div className="text-slate-300 text-sm mt-3">You’re {sign} {formatPnlDisplay(accType, Math.abs(total))} ({pct}%) {timeframeText} with a {wr}% win rate. {bestSymText}, {bestStratText}.</div>;
}
function BestStrategy({filteredTrades, accType, strategies}){
  const data = useMemo(()=>{
    const map = new Map();
    for(const t of filteredTrades){
      const v = computeDollarPnL(t,accType);
      if(v===null || !isFinite(v)) continue;
      const key = t.strategy || "N/A";
      const rec = map.get(key) || {count:0,wins:0,losses:0,pnl:0,trades:[]};
      rec.count += 1; rec.pnl += v; if(v>0) rec.wins += 1; else if(v<0) rec.losses += 1;
      rec.trades.push({date: t.date, pnl: v});
      map.set(key,rec);
    }
    const rows = [...map.entries()].map(([name,rec])=>({
      name, ...rec, winRate: rec.count? Math.round((rec.wins/rec.count)*100):0,
      color: (strategies.find(s=>s.name===name)?.color)||"default"
    }));
    rows.sort((a,b)=> b.winRate - a.winRate || b.pnl - a.pnl);
    return rows;
  },[filteredTrades,accType,strategies]);
  const [compareTo, setCompareTo] = useState(null);
  if(data.length === 0) return <div className="text-slate-400 text-sm">No strategies with trades yet.</div>;
  const best = data[0];
  const avgPerTrade = best.count > 0 ? r2(best.pnl / best.count) : 0;
  const sortedTrades = best.trades.sort((a,b) => new Date(a.date) - new Date(b.date));
  let maxWinStreak = 0, maxLoseStreak = 0, currentStreak = 0;
  let isWinning = null;
  sortedTrades.forEach(t => {
    if(t.pnl > 0){
      if(isWinning === true) currentStreak++;
      else {currentStreak = 1; isWinning = true;}
      maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else if(t.pnl < 0){
      if(isWinning === false) currentStreak++;
      else {currentStreak = 1; isWinning = false;}
      maxLoseStreak = Math.max(maxLoseStreak, currentStreak);
    } else {
      currentStreak = 0; isWinning = null;
    }
  });
  const pct = best.winRate;
  const R=60, C=2*Math.PI*R, val = (pct/100)*C;
  const compare = compareTo ? data.find(s => s.name === compareTo) : null;
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Best Strategy</div>
      <div className="flex items-center gap-6">
        <svg width="160" height="100" viewBox="0 0 160 100">
          <g transform="translate(20,90)">
            <path d={`M0 0 A ${R} ${R} 0 1 1 ${2*R} 0`} fill="none" stroke="#1f2937" strokeWidth="10" />
            <path d={`M0 0 A ${R} ${R} 0 1 1 ${2*R} 0`} fill="none" stroke="#0ea5e9" strokeWidth="10" strokeDasharray={`${val} ${C-val}`} strokeLinecap="round"/>
            <text x="60" y="-10" textAnchor="middle" className="svg-text" fill="#e5e7eb" fontSize="18" fontWeight="700">{pct}%</text>
          </g>
        </svg>
        <div>
          <div className={`text-lg font-semibold ${STRAT_COLORS[best.color]||""}`}>{best.name}</div>
          <div className="text-slate-300 text-sm">Win rate: {pct}% · Trades: {best.count}</div>
          <div className={`text-sm ${best.pnl>0?'text-green-400':best.pnl<0?'text-red-400':'text-amber-400'}`}>P&L: {formatPnlDisplay(accType,best.pnl)}</div>
          <div className="text-slate-400 text-xs mt-2">Avg $/trade: {formatPnlDisplay(accType, avgPerTrade)}</div>
          <div className="text-slate-400 text-xs">Max win streak: {maxWinStreak}</div>
          <div className="text-slate-400 text-xs">Max lose streak: {maxLoseStreak}</div>
        </div>
      </div>
      <div className="text-slate-400 text-xs mt-2">Tip: consider increasing risk slightly when this strategy aligns with HTF bias.</div>
      <div className="mt-3">
        <select value={compareTo || ""} onChange={e=>setCompareTo(e.target.value || null)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-sm">
          <option value="">Compare with...</option>
          {data.slice(1).map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
        {compare && <div className="text-slate-300 text-sm mt-2">Best: {best.winRate}% vs {compare.name}: {compare.winRate}%</div>}
      </div>
    </div>
  )
}
function DetailedStats({filteredTrades, accType}){
  const [sortBy, setSortBy] = useState("recent");
  const rows=useMemo(()=>{
    const m={}; const dateMap = {}; const winMap = {}; const lossMap = {};
    for(const t of filteredTrades){
      const k=t.symbol||"N/A"; const v=computeDollarPnL(t,accType);
      const s=m[k]||{count:0,pnl:0}; s.count+=1; s.pnl+=(v&&isFinite(v))?v:0; m[k]=s;
      const currentMaxDate = dateMap[k] || '0000-00-00';
      if (t.date > currentMaxDate) dateMap[k] = t.date;
      if(v > 0) winMap[k] = (winMap[k] || 0) + 1;
      else if(v < 0) lossMap[k] = (lossMap[k] || 0) + 1;
    }
    const entries = Object.entries(m).map(([sym,v])=>({
      sym, count:v.count, pnl:v.pnl, maxDate:dateMap[sym],
      winRate: v.count > 0 ? Math.round(((winMap[sym] || 0) / v.count) * 100) : 0
    }));
    if(sortBy === "pnl") entries.sort((a,b) => b.pnl - a.pnl);
    else if(sortBy === "winrate") entries.sort((a,b) => b.winRate - a.winRate);
    else entries.sort((a,b) => b.maxDate.localeCompare(a.maxDate));
    return entries.slice(0,3);
  },[filteredTrades,accType,sortBy]);
  if(rows.length === 0) return <div className="text-slate-400 text-sm">No symbols with trades yet.</div>;
  const pill = pnl => pnl > 0 ? '✅' : pnl < 0 ? '❌' : '⚠️';
  return(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
    <div className="flex justify-between mb-2">
      <div className="text-sm font-semibold">Detailed Statistics</div>
      <div className="flex gap-1 text-xs">
        <button onClick={()=>setSortBy("pnl")} className={`px-2 py-1 rounded-lg border ${sortBy==="pnl"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>By P&L</button>
        <button onClick={()=>setSortBy("winrate")} className={`px-2 py-1 rounded-lg border ${sortBy==="winrate"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>By Win Rate</button>
        <button onClick={()=>setSortBy("recent")} className={`px-2 py-1 rounded-lg border ${sortBy==="recent"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Most recent</button>
      </div>
    </div>
    <div className="overflow-auto"><table className="min-w-full text-sm"><thead><tr><Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th></tr></thead>
      <tbody>{rows.map(r=>(
        <tr key={r.sym} className="border-t border-slate-700">
          <Td>{r.sym} · {pill(r.pnl)}</Td><Td>{r.count}</Td>
          <Td className={r.pnl>0?'text-green-400':r.pnl<0?'text-red-400':'text-amber-400'}>{formatPnlDisplay(accType,r.pnl)}</Td>
          <Td className={r.pnl>0?'text-green-400':r.pnl<0?'text-red-400':'text-amber-400'}>{formatUnits(accType,r.pnl)}</Td>
        </tr>))}</tbody></table></div>
  </div>)
}
function PerformanceBadge({trades, filteredTrades, timeframe, accType}){
  const totalTrades = trades.filter(t => t.exitType && t.exitType !== "Trade In Progress").length;
  const realizedPnls = filteredTrades.map(t => computeDollarPnL(t, accType)).filter(v => v !== null && isFinite(v));
  const wr = realizedPnls.length > 0 ? Math.round((realizedPnls.filter(v=>v>0).length / realizedPnls.length) * 100) : 0;
  let mode = "Building";
  if(totalTrades >= 200 && wr > 55) mode = "Consistency";
  else if(totalTrades >= 50) mode = "Sharpening";
  if(timeframe !== "since_deposit" && wr < 45) mode = "Review & Repair";
  return <div className="bg-blue-900 text-xs px-2 py-0.5 rounded-md inline-block">Mode: {mode} · Based on {totalTrades} trades</div>;
}
function QuickActions({onAddTrade, onWriteNote, onReviewWorst, worstTrade}){
  return <div className="flex flex-wrap gap-3 mt-4">
    <button onClick={onAddTrade} className="px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2"><IconPlus />Add a new trade</button>
    <button onClick={onWriteNote} className="px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2"><IconNote />Write note for today’s trades</button>
    <button onClick={onReviewWorst} className="px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2" disabled={!worstTrade}>Review worst losing trade this month</button>
  </div>;
}

/* ---------- Histories (unchanged; Reset works) ---------- */
function Histories({trades,accType,onEdit,onDelete,strategies,onClearAll}){
  const [ask,setAsk]=useState(false);
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Trade History</div>
        <button onClick={()=>setAsk(true)} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700">Reset History</button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th>
              <Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th>
              <Th>Strategy</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t=>{
              const v=computeDollarPnL(t,accType);
              const status = (t.exitType && t.exitType!=="Trade In Progress") ? "CLOSED" : "OPEN";
              const color = v===0? "text-amber-400" : v>0? "text-green-400" : v<0? "text-red-400":"";
              const strat = strategies.find(s => s.name === t.strategy);
              const stratColor = strat ? strat.color : "default";
              return (
                <tr key={t.id} className="tr-row">
                  <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
                  <Td>{typeof t.entry==='number'?t.entry:''}</Td><Td>{typeof t.exit==='number'?t.exit:''}</Td>
                  <Td>{typeof t.tp1==='number'?t.tp1:''}</Td><Td>{typeof t.tp2==='number'?t.tp2:''}</Td><Td>{typeof t.sl==='number'?t.sl:''}</Td>
                  <Td className={STRAT_COLORS[stratColor] || ""}>{t.strategy||""}</Td><Td>{t.exitType||""}</Td>
                  <Td className={color}>{v===null?'-':formatPnlDisplay(accType,v)}</Td>
                  <Td className={color}>{v===null?'-':formatUnits(accType,v)}</Td>
                  <Td>{status}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
                      <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {ask && (
        <Confirm
          title="Reset trade history?"
          message="This will permanently delete all imported and saved trades from your history. Do you want to continue?"
          confirmText="Continue"
          cancelText="Discard"
          onConfirm={()=>{ setAsk(false); onClearAll(); }}
          onCancel={()=>setAsk(false)}
        />
      )}
    </div>
  )
}

/* ---------- Notes (uniform preview width; everything else unchanged) ---------- */
function NotesPanel({trades, notes, setNotes}){
  const [show,setShow]=useState(false);
  const [draft,setDraft]=useState(null);
  const save=rec=>{let arr=[...notes]; if(rec.id){const i=arr.findIndex(x=>x.id===rec.id);if(i>=0)arr[i]=rec}else{arr.unshift({...rec,id:Math.random().toString(36).slice(2)})} setNotes(arr); setShow(false);};
  const del=id=>{const arr=notes.filter(x=>x.id!==id); setNotes(arr);};
  return(
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><IconNote/><div className="text-sm font-semibold">Notes</div></div>
        <button onClick={()=>{setDraft(null);setShow(true)}} className="px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-2"><IconNote/>New note</button>
      </div>
      <div className="space-y-3">
        {notes.map(n=>(
          <div key={n.id} className="note-card bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex flex-col">
            <div className="font-semibold mb-1 truncate">{n.title}</div>
            <div className="text-slate-400 text-xs mb-2">{n.date}</div>
            <div className="note-preview text-sm whitespace-pre-wrap break-words flex-1">
              <div dangerouslySetInnerHTML={{__html:n.content}}/>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={()=>{setDraft(n);setShow(true)}} className="px-2 py-1 rounded-lg border border-slate-700">✎</button>
              <button onClick={()=>del(n.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300">✕</button>
            </div>
          </div>
        ))}
      </div>
      {show&&<NoteModal onClose={()=>setShow(false)} onSave={save} initial={draft} trades={trades}/>}
    </div>
  )
}
function NoteModal({onClose,onSave,initial,trades}){
  const i=initial||{}; const [title,setTitle]=useState(i.title||""); const [date,setDate]=useState(i.date||todayISO());
  const [content,setContent]=useState(i.content||"");
  const todaysTrades = trades.filter(t=>t.date===date);
  const [refId,setRefId]=useState(i.refId||"");
  const editorRef=useRef(null);
  useEffect(()=>{if(editorRef.current) editorRef.current.innerHTML = content;},[]);
  const exec=(cmd)=>document.execCommand(cmd,false,null);
  const changeSize=(px)=>{
    const sel=window.getSelection?.(); if(!sel||sel.rangeCount===0) return;
    const range=sel.getRangeAt(0);
    if(!editorRef.current || !editorRef.current.contains(range.commonAncestorContainer)) return;
    document.execCommand("fontSize",false,7);
    const fontNodes=editorRef.current.querySelectorAll('font[size="7"]');
    fontNodes.forEach(n=>{n.removeAttribute("size"); n.style.fontSize=px;});
  };
  const save=()=>{const rec={id:i.id,title,date,content:editorRef.current?editorRef.current.innerHTML:content,refId}; onSave(rec)};
  return(
    <Modal title={i.id?"Edit note":"New note"} onClose={onClose} maxClass="max-w-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <div><label className="text-sm text-slate-300">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div>
            <label className="text-sm text-slate-300">Content</label>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <button onClick={()=>exec("bold")} className="px-2 py-1 rounded-lg border border-slate-700">B</button>
              <button onClick={()=>exec("italic")} className="px-2 py-1 rounded-lg border border-slate-700">I</button>
              <button onClick={()=>exec("underline")} className="px-2 py-1 rounded-lg border border-slate-700">U</button>
              <select defaultValue="Size" onChange={e=>{if(e.target.value!=="Size") changeSize(e.target.value)}} className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700">
                <option>Size</option>
                <option value="20px">Heading</option>
                <option value="16px">Subheading</option>
                <option value="13px">Body</option>
              </select>
            </div>
            <div ref={el=>{editorRef.current=el}} contentEditable className="mt-2 min-h-[200px] h-[260px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 overflow-auto"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div><label className="text-sm text-slate-300">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
          <div>
            <label className="text-sm text-slate-300">Reference Trade (today)</label>
            <div className="mt-1 space-y-2 max-h-[140px] overflow-auto">
              {todaysTrades.map(t=>(
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="ref" checked={refId===t.id} onChange={()=>setRefId(t.id)} />
                  <span>{t.symbol} · {t.side} · Lot {t.lotSize}</span>
                </label>
              ))}
              {todaysTrades.length===0 && <div className="text-xs text-slate-400">No trades for selected date.</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 whitespace-nowrap">Discard</button>
        <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center gap-2 whitespace-nowrap"><IconSave/>Save</button>
      </div>
    </Modal>
  )
}

/* ---------- Header / Shell (unchanged) ---------- */
function UserMenu({onExport,onImport,onLogout}){
  const [open,setOpen]=useState(false);
  return(
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser/></button>
      {open&&(<div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <button onClick={()=>{setOpen(false);onImport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconUpload/>Import (.csv/.xls/.xlsx)</button>
        <button onClick={()=>{setOpen(false);onExport()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload/>Export CSV</button>
        <button onClick={()=>{setOpen(false);onLogout()}} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout/>Logout</button>
      </div>)}
    </div>
  )
}
function Header({logoSrc,onToggleSidebar,onExport,onImport,onLogout}){
  return(<div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
      <div className="flex items-center gap-3">
        <img src={logoSrc} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-7 w-7"/>
        <div className="font-bold">Nitty Gritty</div>
        <span className="bg-blue-900 text-xs px-2 py-0.5 rounded-md">Trading Journal</span>
      </div>
    </div>
    <UserMenu onExport={onExport} onImport={onImport} onLogout={onLogout}/>
  </div>)
}
function AppShell({children,capitalPanel,nav,logoSrc,onToggleSidebar,onExport,onImport,onLogout,sidebarCollapsed}){
  return(<div className="min-h-screen">
    <Header logoSrc={logoSrc} onToggleSidebar={onToggleSidebar} onExport={onExport} onImport={onImport} onLogout={onLogout}/>
    <div className="flex">
      {!sidebarCollapsed&&(<div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
      </div>)}
      <div className="flex-1 p-4 md:p-6"><ErrorBoundary>{children}</ErrorBoundary></div>
    </div>
  </div>)
}

/* ---------- Login & Forgot Password (unchanged behavior) ---------- */
function ResetModal({email,onClose}){
  const [e,setE]=useState(email||""); const [msg,setMsg]=useState("");
  const start=()=>{firebase.auth().sendPasswordResetEmail(e).then(()=>{setMsg('Reset email sent successfully. Check your inbox (or spam).')}).catch(error=>{setMsg('Failed to send email: ' + error.message);})};
  return(<Modal title="Password reset" onClose={onClose} maxClass="max-w-md">
    <div className="space-y-3">
      <div><label className="text-sm text-slate-300">Your email</label><input value={e} onChange={ev=>setE(ev.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
      <button onClick={start} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Send reset link</button>
      {msg&&<div className="text-sky-400 text-sm">{msg}</div>}
    </div>
  </Modal>)
}
function LoginView({onLogin,onSignup,resetStart}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [showPw,setShowPw]=useState(false);
  const [name,setName]=useState(""); const [confirm,setConfirm]=useState(""); const [err,setErr]=useState("");
  const [showSignupMsg,setShowSignupMsg]=useState(false);
  const submit=()=>{setErr(""); if(mode==="login"){if(!email||!password)return setErr("Fill all fields."); onLogin(email,password,setErr)}
    else{setShowSignupMsg(true);}};
  return(<div className="min-h-screen grid md:grid-cols-2">
    {/* Left panel – now solid deep blue (no image); color via CSS class `.hero` */}
    <div className="hidden md:flex hero items-center justify-center">
      <div className="max-w-sm text-center px-6">
        <div className="text-3xl font-semibold">Trade smart. Log smarter.</div>
        <div className="mt-3 text-slate-300">“Discipline is choosing what you want most over what you want now.”</div>
      </div>
    </div>
    <div className="flex items-center justify-center p-6">
      <div className="w-[92vw] max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={LOGO_PUBLIC} onError={e=>{e.currentTarget.src=LOGO_FALLBACK}} className="h-8 w-8"/><div className="text-xl font-bold">Nitty Gritty</div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode("login")} className={`flex-1 px-3 py-2 rounded-lg border ${mode==="login"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Login</button>
          <button onClick={()=>setMode("signup")} className={`flex-1 px-3 py-2 rounded-lg border ${mode==="signup"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Sign up</button>
        </div>
        {mode==="signup"&&(<div className="mb-3"><label className="text-sm text-slate-300">Name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>)}
        <div className="mb-3"><label className="text-sm text-slate-300">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div className="mb-2">
          <label className="text-sm text-slate-300">Password</label>
          <div className="mt-1 flex gap-2">
            <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/>
            <button onClick={()=>setShowPw(v=>!v)} className="px-3 py-2 rounded-lg border border-slate-700">{showPw?"Hide":"Show"}</button>
          </div>
        </div>
        <div className="text-right text-sm mb-4"><button onClick={()=>resetStart(email)} className="text-blue-400 hover:underline">Forgot password?</button></div>
        {mode==="signup"&&(<div className="mb-4"><label className="text-sm text-slate-300">Confirm Password</label><input type={showPw?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>)}
        {err&&<div className="text-red-400 text-sm mb-3">{err}</div>}
        <div className="flex items-center justify-between">
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Continue</button>
        </div>
      </div>
    </div>
    {showSignupMsg&&<Modal title="Sign Up Unavailable" onClose={()=>setShowSignupMsg(false)} maxClass="max-w-md"><div className="text-slate-200">Sign up is not available at the moment.</div></Modal>}
  </div>)
}

/* ---------- App ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyCkLuIUtUP3EgMS2-LDqbJsYn7WBKV6-kA",
  authDomain: "nitty-gritty-9dd61.firebaseapp.com",
  projectId: "nitty-gritty-9dd61",
  storageBucket: "nitty-gritty-9dd61.appspot.com",
  messagingSenderId: "418979704771",
  appId: "1:418979704771:web:fe9bc3427f586778ced776"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function App(){
  const [currentEmail,setCurrentEmail]=useState(getCurrent());
  const [currentUid,setCurrentUid]=useState("");
  const [state,setState]=useState(null);
  const [cfg,setCfg]=useState(null);
  const [notes,setNotes]=useState([]);
  const [page,setPage]=useState("dashboard");
  const [showTrade,setShowTrade]=useState(false); const [editItem,setEditItem]=useState(null);
  const [showAcct,setShowAcct]=useState(false);
  const [showCal,setShowCal]=useState(false); const now=new Date(); const [calView,setCalView]=useState("month"); const [calMonth,setCalMonth]=useState(now.getMonth()); const [calYear,setCalYear]=useState(now.getFullYear()); const [calSel,setCalSel]=useState(todayISO());
  const [collapsed,setCollapsed]=useState(false);
  const [showReset,setShowReset]=useState(false);
  const [timeframe, setTimeframe] = useState("since_deposit");
  const [dashTab, setDashTab] = useState("symbols");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentEmail(user.email);
        setCurrentUid(user.uid);
        saveCurrent(user.email);
      } else {
        setCurrentEmail("");
        setCurrentUid("");
        saveCurrent("");
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUid) {
      setState(null);
      setCfg(null);
      setNotes([]);
      return;
    }
    const docRef = db.collection('users').doc(currentUid);
    const unsubscribe = docRef.onSnapshot(snap => {
      if (snap.exists) {
        const data = snap.data();
        let loadedState = data.state || fresh();
        loadedState.trades = loadedState.trades.map(t => ({
          ...t,
          entry: t.entry ?? null,
          exit: t.exit ?? null,
          tp1: t.tp1 ?? null,
          tp2: t.tp2 ?? null,
          sl: t.sl ?? null,
          pnlOverride: t.pnlOverride ?? null,
          lotSize: t.lotSize ?? 0.01
        }));
        setState(loadedState);
        setCfg(data.cfg || {symbols:DEFAULT_SYMBOLS, strategies:DEFAULT_STRATEGIES});
        setNotes(data.notes || []);
      } else {
        const initialState = fresh();
        const initialCfg = {symbols:DEFAULT_SYMBOLS, strategies:DEFAULT_STRATEGIES};
        docRef.set({
          state: initialState,
          cfg: initialCfg,
          notes: []
        });
        setState(initialState);
        setCfg(initialCfg);
        setNotes([]);
      }
    });
    return unsubscribe;
  }, [currentUid]);

  useEffect(() => {
    if (!currentUid || !state) return;
    db.collection('users').doc(currentUid).update({state});
  }, [state, currentUid]);

  useEffect(() => {
    if (!currentUid || !cfg) return;
    db.collection('users').doc(currentUid).update({cfg});
  }, [cfg, currentUid]);

  useEffect(() => {
    if (!currentUid) return;
    db.collection('users').doc(currentUid).update({notes});
  }, [notes, currentUid]);

  useEffect(()=>{if(state&&(!state.name||!state.depositDate)) setShowAcct(true)},[state]);

  const onExport=()=>{const csv=toCSV(state.trades,state.accType);const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Nitty_Gritty_Template_Export.csv";a.click();URL.revokeObjectURL(url)};

  /* ---- Import (robust): ALWAYS SheetJS, tolerant header mapping ---- */
  const __importEl = (window.__ngImportEl ||= (() => {
    const el = document.createElement('input');
    el.type = 'file';
    el.accept = '.csv,.xls,.xlsx';
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  })());
  function openImportDialog(){ __importEl.value = ''; __importEl.click(); }

  function normalizeKey(k){
    return String(k||"").trim().toLowerCase().replace(/[^a-z0-9]/g,"");
  }
  const FIELD_ALIASES = {
    date:      ["date","tradedate","datetime","time"],
    symbol:    ["symbol","pair","instrument","market","ticker"],
    side:      ["side","action","direction","position","type"],
    lotsize:   ["lotsize","lot","volume","qty","quantity","size","lotqty","position_size"],
    entry:     ["entry","entryprice","pricein","open","openprice","buyprice","sellprice","entryrate"],
    exit:      ["exit","exitprice","priceout","close","closeprice","exitrate"],
    tp1:       ["tp1","tp01","tp_1","takeprofit1","takeprofit","tp"],
    tp2:       ["tp2","tp02","tp_2","takeprofit2"],
    sl:        ["sl","stop","stoploss","stoplossprice","stoplevel"],
    strategy:  ["strategy","setup","playbook"],
    exittype:  ["exittype","exitstatus","closetype","closuretype","outcome"]
  };
  function getFirst(norm, candidates){
    for(const c of candidates){
      if(c in norm){
        const v = norm[c];
        if(v!=="" && v!==null && v!==undefined) return v;
      }
    }
    return undefined;
  }
  function excelSerialToISO(n){
    // Excel serial date: days since 1899-12-30
    const ms = (n - 25569) * 86400 * 1000;
    const d = new Date(ms);
    const tz = d.getTimezoneOffset()*60000;
    return new Date(ms - tz).toISOString().slice(0,10);
  }
  function coerceISODate(v){
    if(v===undefined || v===null || v==="") return todayISO();
    if(typeof v==="number" && isFinite(v)) return excelSerialToISO(v);
    if(v instanceof Date && !isNaN(v)) return new Date(v.getTime()-v.getTimezoneOffset()*60000).toISOString().slice(0,10);
    const s=String(v).trim();
    const tryD=new Date(s);
    if(!isNaN(tryD)) return new Date(tryD.getTime()-tryD.getTimezoneOffset()*60000).toISOString().slice(0,10);
    return todayISO();
  }
  function toNumberMaybe(v){
    if(v===undefined||v===null||v==="") return null;
    if(typeof v==="number") return v;
    const s=String(v).replace(/,/g,"").trim();
    const n=parseFloat(s);
    return isNaN(n)?null:n;
  }

  function rowsToTrades(rows){
    const out = [];
    for(const r of rows){
      // Build one normalized dictionary per row
      const norm = {};
      for(const k of Object.keys(r||{})){
        norm[normalizeKey(k)] = r[k];
      }
      // Map values using aliases
      const t = {};
      t.id = Math.random().toString(36).slice(2);
      t.date     = coerceISODate( getFirst(norm, FIELD_ALIASES.date) );
      t.symbol   = String( getFirst(norm, FIELD_ALIASES.symbol) || "" ).toUpperCase();
      const rawSide = String( getFirst(norm, FIELD_ALIASES.side) || "BUY" ).toUpperCase();
      t.side     = rawSide.includes("SELL") ? "SELL" : "BUY";
      t.lotSize  = toNumberMaybe( getFirst(norm, FIELD_ALIASES.lotsize) ) ?? 0.01;
      t.entry    = toNumberMaybe( getFirst(norm, FIELD_ALIASES.entry) );
      t.exit     = toNumberMaybe( getFirst(norm, FIELD_ALIASES.exit) );
      t.tp1      = toNumberMaybe( getFirst(norm, FIELD_ALIASES.tp1) );
      t.tp2      = toNumberMaybe( getFirst(norm, FIELD_ALIASES.tp2) );
      t.sl       = toNumberMaybe( getFirst(norm, FIELD_ALIASES.sl) );
      t.strategy = String( getFirst(norm, FIELD_ALIASES.strategy) || DEFAULT_STRATEGIES[0].name );
      t.exitType = String( getFirst(norm, FIELD_ALIASES.exittype) || "Trade In Progress" );

      // Skip totally empty rows (no symbol, no numbers)
      const hasAny = t.symbol || t.entry!==null || t.exit!==null || t.tp1!==null || t.tp2!==null || t.sl!==null;
      if(hasAny) out.push(t);
    }
    return out;
  }

  if (!__importEl.__ngBound){
    __importEl.addEventListener('change', async (e)=>{
      const f = e.target.files?.[0]; if(!f) return;
      try{
        const buf = await f.arrayBuffer();
        const wb  = XLSX.read(buf, { type:'array' });
        const ws  = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval:'', raw:true, blankrows:false });
        const trades = rowsToTrades(rows);
        setState(s => ({ ...s, trades: [...trades.reverse(), ...s.trades] })); // keep existing order as before
      }catch(err){
        console.error('Import error:', err);
        alert('Unable to import this file. Please check the format.');
      }
    });
    __importEl.__ngBound = true;
  }

  const onLogout=()=>{auth.signOut()};
  const login=(email,password,setErr)=>{auth.signInWithEmailAndPassword(email,password).catch(e=>setErr(e.message))};
  const resetStart=()=>{setShowReset(true)};
  const addOrUpdate=(draft)=>{const id=draft.id||Math.random().toString(36).slice(2); const arr=state.trades.slice(); const idx=arr.findIndex(t=>t.id===id); const rec={...draft,id}; if(idx>=0)arr[idx]=rec; else arr.unshift(rec); setState({...state,trades:arr}); setShowTrade(false); setEditItem(null)};
  const delTrade=(id)=>setState({...state,trades:state.trades.filter(t=>t.id!==id)});
  const clearAllTrades=()=>setState({...state,trades:[]});

  if(!currentEmail){return <><LoginView onLogin={login} onSignup={()=>{}} resetStart={resetStart}/>{showReset&&<ResetModal email="" onClose={()=>setShowReset(false)}/>}</>}

  if (!state || !cfg) {
    return <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-100">Loading...</div>;
  }

  const openTrades = state.trades?.filter(t => !t.exitType || t.exitType === "Trade In Progress")?.length ?? 0;
  const realized = state.trades?.filter(t => new Date(t.date) >= new Date(state.depositDate) && t.exitType && t.exitType !== "Trade In Progress")?.map(t => computeDollarPnL(t, state.accType))?.filter(v => v !== null && isFinite(v))?.reduce((a, b) => a + b, 0) ?? 0;
  const effectiveCapital = (state.capital ?? 0) + realized;

  const navBtn=(label,pageKey,Icon)=>(<button onClick={()=>setPage(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===pageKey?'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>{Icon?<Icon/>:null}<span>{label}</span></button>);
  const capitalPanel=(<div>
    <div className="text-sm text-slate-300">Account Type</div><div className="font-semibold mb-3">{state.accType}</div>
    <div className="text-sm text-slate-300">Capital</div><div className="text-2xl font-bold mb-1">{state.accType==='Cent Account'?`${r2(effectiveCapital*100).toFixed(2)} ¢`:fmt$(effectiveCapital)}</div>
    <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
    <div className="mt-3 text-sm text-slate-300">Open trades</div><div className="text-lg font-semibold">{openTrades}</div>
    <div className="pt-2"><button onClick={()=>{setEditItem(null);setShowTrade(true)}} className="w-full px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"><IconPlus/>Add trade</button></div>
  </div>);
  const nav=(<>
    {navBtn("Dashboard","dashboard",IconHome)}
    {navBtn("Histories","histories",IconHistory)}
    <button onClick={()=>{setShowCal(true);setCalView("month")}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
    {navBtn("Notes","notes",IconNote)}
    {navBtn("Settings","settings",IconSettings)}
  </>);

  const filteredTrades = useMemo(() => getFilteredTrades(state.trades, timeframe, state.depositDate), [state.trades, timeframe, state.depositDate]);
  const bestSymbol = useMemo(() => {
    const symPnls = filteredTrades.reduce((m,t) => {
      const sym = t.symbol || "N/A";
      const pnl = computeDollarPnL(t, state.accType) || 0;
      m[sym] = (m[sym] || 0) + pnl;
      return m;
    }, {});
    const best = Object.entries(symPnls).sort((a,b) => b[1] - a[1])[0];
    return best ? best[0] : null;
  }, [filteredTrades, state.accType]);
  const bestStrategy = useMemo(() => {
    const stratData = filteredTrades.reduce((m,t) => {
      const strat = t.strategy || "N/A";
      const pnl = computeDollarPnL(t, state.accType);
      if(pnl !== null && isFinite(pnl)){
        if(!m[strat]) m[strat] = {pnl:0, wins:0, count:0};
        m[strat].pnl += pnl;
        m[strat].count += 1;
        if(pnl > 0) m[strat].wins += 1;
      }
      return m;
    }, {});
    const sorted = Object.entries(stratData).sort((a,b) => (b[1].wins / b[1].count || 0) - (a[1].wins / a[1].count || 0));
    return sorted[0] ? sorted[0][0] : null;
  }, [filteredTrades, state.accType]);
  const worstTradeThisMonth = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyClosed = state.trades.filter(t => new Date(t.date) >= cutoff && t.exitType && t.exitType !== "Trade In Progress");
    if(monthlyClosed.length === 0) return null;
    return monthlyClosed.reduce((worst, t) => {
      const pnl = computeDollarPnL(t, state.accType) || 0;
      return pnl < (computeDollarPnL(worst, state.accType) || 0) ? t : worst;
    }, monthlyClosed[0]);
  }, [state.trades, state.accType]);
  const onWriteNote = () => {
    setPage("notes");
  };
  const onReviewWorst = () => {
    if(worstTradeThisMonth){
      setEditItem(worstTradeThisMonth);
      setShowTrade(true);
    }
  };
  const onAddTrade = () => {
    setEditItem(null);
    setShowTrade(true);
  };

  const logoSrc=LOGO_PUBLIC;
  return(
    <AppShell capitalPanel={capitalPanel} nav={nav} logoSrc={logoSrc}
      onToggleSidebar={()=>setCollapsed(v=>!v)} onExport={onExport} onImport={openImportDialog} onLogout={onLogout} sidebarCollapsed={collapsed}>
      {page==="dashboard"&&(<div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold">General statistics</div>
          <PerformanceBadge trades={state.trades} filteredTrades={filteredTrades} timeframe={timeframe} accType={state.accType} />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {["since_deposit", "last_30_days", "last_7_days", "last_20_trades"].map(tf => (
            <button key={tf} onClick={()=>setTimeframe(tf)} className={`px-3 py-1.5 rounded-lg border text-sm ${timeframe===tf ? "bg-slate-700 border-slate-600" : "border-slate-700"}`}>
              {tf.replace(/_/g,' ').replace('last','Last').replace('deposit','Deposit')}
            </button>
          ))}
        </div>
        <GeneralStats trades={state.trades} filteredTrades={filteredTrades} accType={state.accType} capital={state.capital} depositDate={state.depositDate} timeframe={timeframe} />
        <DashboardSummary filteredTrades={filteredTrades} accType={state.accType} capital={state.capital} depositDate={state.depositDate} timeframe={timeframe} bestSymbol={bestSymbol} bestStrategy={bestStrategy} />
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl">
          <div className="flex gap-2 p-4 pb-0">
            <button onClick={()=>setDashTab("symbols")} className={`px-3 py-1.5 rounded-lg border ${dashTab==="symbols"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Symbols</button>
            <button onClick={()=>setDashTab("strategies")} className={`px-3 py-1.5 rounded-lg border ${dashTab==="strategies"?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Strategies</button>
          </div>
          <div className="p-4 pt-0">
            {dashTab === "symbols" && <DetailedStats filteredTrades={filteredTrades} accType={state.accType} />}
            {dashTab === "strategies" && <BestStrategy filteredTrades={filteredTrades} accType={state.accType} strategies={cfg.strategies} />}
          </div>
        </div>
        <QuickActions onAddTrade={onAddTrade} onWriteNote={onWriteNote} onReviewWorst={onReviewWorst} worstTrade={worstTradeThisMonth} />
      </div>)}
      {page==="histories"&&(<Histories trades={state.trades} accType={state.accType} onEdit={t=>{setEditItem(t);setShowTrade(true)}} onDelete={delTrade} strategies={cfg.strategies} onClearAll={clearAllTrades}/>)}
      {page==="notes"&&(<NotesPanel trades={state.trades} notes={notes} setNotes={setNotes}/>)}
      {page==="settings"&&(<SettingsPanel
        name={state.name} setName={v=>setState({...state,name:v})}
        accType={state.accType} setAccType={v=>setState({...state,accType:v})}
        capital={state.capital} setCapital={v=>setState({...state,capital:v||0})}
        depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})}
        email={currentEmail}
        cfg={cfg} setCfg={setCfg}
      />)}
      {showTrade&&(<TradeModal initial={editItem} onClose={()=>{setShowTrade(false);setEditItem(null)}} onSave={addOrUpdate} onDelete={delTrade} accType={state.accType} symbols={cfg.symbols} strategies={cfg.strategies}/>)}
      {showAcct&&(<AccountSetupModal name={state.name} setName={v=>setState({...state,name:v})} accType={state.accType} setAccType={v=>setState({...state,accType:v})} capital={state.capital} setCapital={v=>setState({...state,capital:v||0})} depositDate={state.depositDate} setDepositDate={v=>setState({...state,depositDate:v})} onClose={()=>setShowAcct(false)} email={currentEmail}/>)}
      {showCal&&(<CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView} month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear} selectedDate={calSel} setSelectedDate={setCalSel} accType={state.accType}/>)}
      {showReset&&(<ResetModal email="" onClose={()=>setShowReset(false)}/>)}
    </AppShell>
  )
}

/* -------- Mount -------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
