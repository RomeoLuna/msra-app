import { useState, useRef } from "react";
import { Plus, Copy, GripVertical, Printer } from "lucide-react";

/* ─── PRINT CSS ──────────────────────────────────────────────────────────── */
const PRINT_CSS = `
@media print {
  @page { size: A3 landscape; margin: 10mm; }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  .no-print  { display: none !important; }
  .aa-screen { display: none !important; }
  .aa-print  { display: block !important; }
  body { background: white !important; margin: 0 !important; padding: 0 !important; }
  #msra-doc {
    box-shadow: none !important;
    max-width: 100% !important;
    padding: 6px !important;
    margin: 0 !important;
  }
  table { table-layout: auto !important; page-break-inside: auto; }
  tr    { page-break-inside: avoid; page-break-after: auto; }
  td, th { overflow: visible !important; }
  select { -webkit-appearance: none !important; appearance: none !important; }
  input[type="date"]::-webkit-calendar-picker-indicator { display: none !important; }
}
`;

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */
const P_OPTS = [
  { v:"10",  l:"10 — Esperado que ocurra" },
  { v:"6",   l:"6 — Muy posible"          },
  { v:"3",   l:"3 — Raro pero posible"    },
  { v:"1",   l:"1 — Improbable"           },
  { v:"0.5", l:"0.5 — Concebible"         },
  { v:"0.1", l:"0.1 — Casi improbable"    },
];
const F_OPTS = [
  { v:"10",  l:"10 — Continuo"   },
  { v:"6",   l:"6 — Diario"      },
  { v:"3",   l:"3 — Semanal"     },
  { v:"2",   l:"2 — Mensual"     },
  { v:"1",   l:"1 — Anual"       },
  { v:"0.5", l:"0.5 — < 1/año"   },
];
const I_OPTS = [
  { v:"40", l:"40 — Catástrofe" },
  { v:"15", l:"15 — Muy Serio"  },
  { v:"7",  l:"7 — Serio"       },
  { v:"3",  l:"3 — Importante"  },
  { v:"1",  l:"1 — Menor"       },
];
const PERMS = ["General","LOTOTO","Altura","Caliente","Espacio confinado","Izaje","Obra infraestructura"];
const ENV_LIST = [
  { id:"agua", a:"Consumo de agua",                   i:"Agotamiento de Recursos Naturales" },
  { id:"enrg", a:"Consumo de energía eléctrica",      i:"Agotamiento de Recursos Naturales" },
  { id:"gas",  a:"Emisión de gases de combustión",    i:"Contaminación al aire" },
  { id:"rpel", a:"Generación de residuos peligrosos", i:"Contaminación de aguas superficiales y/o suelos. Residuos de vertederos" },
  { id:"rsol", a:"Generación de residuos sólidos",    i:"Contaminación de aguas superficiales y/o suelos. Residuos de vertederos" },
  { id:"rliq", a:"Generación de residuos líquidos",   i:"Contaminación de aguas superficiales y/o suelos. Residuos de vertederos" },
];

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
let _id = 0;
const uid    = () => ++_id;
const mkRow  = () => ({ id:uid(), seq:"", tools:"", risk:"", sp:"", sf:"", si:"", mit:"", cp:"", cf:"", ci:"", perms:[] });
const mkChem = () => ({ id:uid(), nombre:"", actividad:"", conc:"" });
const calcR  = (p,f,i) => { const a=parseFloat(p),b=parseFloat(f),d=parseFloat(i); return a&&b&&d?a*b*d:0; };
const fmtR   = r => r>0?(r%1===0?String(r):r.toFixed(1)):"0";
const rBg    = (r,dfBg,dfTx) => {
  if(!r)    return { background:dfBg,    color:dfTx  };
  if(r>400) return { background:"#dc2626",color:"#fff" };
  if(r>=200)return { background:"#ea580c",color:"#fff" };
  if(r>=70) return { background:"#ca8a04",color:"#fff" };
  if(r>=20) return { background:"#2563eb",color:"#fff" };
  return          { background:"#16a34a",color:"#fff" };
};

/* ─── STYLE HELPERS ─────────────────────────────────────────────────────── */
const BD = "1px solid #888";
const cs = (s={}) => ({ border:BD, padding:"3px 4px", fontSize:11, verticalAlign:"top",    ...s });
const hs = (s={}) => ({ border:BD, padding:"3px 4px", fontSize:11, verticalAlign:"middle",
                         fontWeight:700, textAlign:"center", background:"#c8c8c8", lineHeight:"1.3", ...s });
const sl = (s={}) => ({ width:"100%", border:"none", outline:"none", background:"transparent",
                         fontSize:10, fontFamily:"Arial,sans-serif", cursor:"pointer", ...s });

/* ─── AUTO-RESIZE TEXTAREA + PRINT MIRROR ───────────────────────────────── */
// On screen: textarea that grows with content via JS.
// On print:  a plain <div> (aa-print) that shows ALL text without height clipping.
//            The textarea (aa-screen) is hidden in print by PRINT_CSS.
const AA = ({ value, onChange, placeholder, style={} }) => {
  const ref = useRef(null);
  const fs  = style.fontSize || 11;
  const resize = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  };
  return (
    <div style={{ width:"100%", position:"relative" }}>
      {/* ── Screen version ── */}
      <textarea
        ref={ref}
        value={value}
        placeholder={placeholder}
        rows={1}
        className="aa-screen"
        onChange={e => { onChange(e); resize(); }}
        onFocus={resize}
        style={{
          width:"100%", border:"none", outline:"none", background:"transparent",
          resize:"none", overflow:"hidden", fontFamily:"Arial,sans-serif",
          fontSize:fs, lineHeight:"1.4", padding:"1px 0", minHeight:18, display:"block",
          ...style,
        }}
      />
      {/* ── Print version (hidden on screen, shown in print via CSS) ── */}
      <div
        className="aa-print"
        style={{
          display:"none",                     /* hidden on screen */
          fontSize:fs, fontFamily:"Arial,sans-serif",
          lineHeight:"1.4", padding:"1px 0",
          whiteSpace:"pre-wrap", wordBreak:"break-word",
          minHeight:18, color: value ? "#000" : "#bbb",
        }}
      >
        {value || placeholder}
      </div>
    </div>
  );
};

/* ─── PLAIN INPUT (shared) ──────────────────────────────────────────────── */
const PI = ({ value, onChange, placeholder, style={}, type="text" }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{ width:"100%", border:"none", outline:"none", background:"transparent",
             fontFamily:"Arial,sans-serif", fontSize:11, padding:"1px 0", ...style }}
  />
);

/* ════════════════════════════════════════════════════════════════════════ */
export default function MSRA() {

  /* ── State ── */
  const [empresa,   setEmpresa]   = useState("");
  const [duracion,  setDuracion]  = useState("");
  const [actividad, setActividad] = useState("");
  const [fecha,     setFecha]     = useState("");
  const [rows,      setRows]      = useState([mkRow(),mkRow(),mkRow()]);
  const [hrows,     setHrows]     = useState([mkRow()]);
  const [envSt,     setEnvSt]     = useState(() => Object.fromEntries(ENV_LIST.map(e=>[e.id,{ap:null,mit:""}])));
  const [chems,     setChems]     = useState([mkChem(),mkChem(),mkChem()]);
  const [drop,      setDrop]      = useState(null);   // permiso dropdown open id
  const [dragId,    setDragId]    = useState(null);
  const [dragOver,  setDragOver]  = useState(null);

  /* ── Row helpers ── */
  const updRow  = (set,id,f,v) => set(rs => rs.map(r => r.id===id ? {...r,[f]:v} : r));
  const delRow  = (set,id)     => set(rs => rs.length>1 ? rs.filter(r=>r.id!==id) : rs);
  const togPerm = (set,rid,p)  => set(rs => rs.map(r => {
    if(r.id!==rid) return r;
    return {...r, perms: r.perms.includes(p) ? r.perms.filter(x=>x!==p) : [...r.perms,p] };
  }));
  const reorder = (setter, list, fromId, toId) => {
    const a = list.findIndex(r=>r.id===fromId);
    const b = list.findIndex(r=>r.id===toId);
    if(a<0||b<0||a===b) return;
    const next = [...list];
    const [item] = next.splice(a,1);
    next.splice(b,0,item);
    setter(next);
  };
  const dupRow = (setter, list, id) => {
    const idx = list.findIndex(r=>r.id===id);
    if(idx<0) return;
    const copy = {...list[idx], id:uid()};
    const next = [...list];
    next.splice(idx+1,0,copy);
    setter(next);
  };

  /* ── Env / Chem helpers ── */
  const setEnv  = (id,f,v) => setEnvSt(e => ({...e,[id]:{...e[id],[f]:v}}));
  const naAll   = ()       => setEnvSt(() => Object.fromEntries(ENV_LIST.map(e=>[e.id,{ap:"no",mit:"N/A"}])));
  const setChem = (id,f,v) => setChems(cs => cs.map(c => c.id===id ? {...c,[f]:v} : c));

  /* ── Print ── */
  const handlePrint = () => {
    const s = document.createElement("style");
    s.id = "__msra_p__";
    s.textContent = PRINT_CSS;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => { const el=document.getElementById("__msra_p__"); if(el) el.remove(); }, 1500);
  };

  /* ── Data rows renderer ── */
  const Rows = (list, setter) => list.map((row, idx) => {
    const sinR = calcR(row.sp,row.sf,row.si);
    const conR = calcR(row.cp,row.cf,row.ci);
    const isDragged = dragId===row.id;
    const isTarget  = dragOver===row.id && !isDragged;
    return (
      <tr
        key={row.id}
        draggable
        onDragStart={e  => { setDragId(row.id); e.dataTransfer.effectAllowed="move"; }}
        onDragOver={e   => { e.preventDefault(); setDragOver(row.id); }}
        onDrop={e       => { e.preventDefault(); reorder(setter,list,dragId,row.id); setDragId(null); setDragOver(null); }}
        onDragEnd={()   => { setDragId(null); setDragOver(null); }}
        style={{
          background: isDragged?"#f0f9ff": isTarget?"#dbeafe": idx%2===0?"#fff":"#f9f9f9",
          outline:    isTarget?"2px solid #2563eb":"none",
          opacity:    isDragged?0.45:1,
        }}
      >
        {/* drag handle */}
        <td className="no-print" style={cs({width:16,padding:"2px 1px",textAlign:"center",cursor:"grab",color:"#ccc",verticalAlign:"middle",borderRight:"none"})}>
          <GripVertical size={12}/>
        </td>
        <td style={cs({minWidth:90})}><AA value={row.seq}   onChange={e=>updRow(setter,row.id,"seq",  e.target.value)} placeholder="Describir paso..." /></td>
        <td style={cs({minWidth:85})}><AA value={row.tools} onChange={e=>updRow(setter,row.id,"tools",e.target.value)} placeholder="Herramientas..." /></td>
        <td style={cs({minWidth:90})}><AA value={row.risk}  onChange={e=>updRow(setter,row.id,"risk", e.target.value)} placeholder="¿Qué puede fallar?" /></td>

        {/* SIN mitigación */}
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#fff0f0",verticalAlign:"middle"})}>
          <select value={row.sp} onChange={e=>updRow(setter,row.id,"sp",e.target.value)} style={sl()}>
            <option value="">—</option>{P_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#fff0f0",verticalAlign:"middle"})}>
          <select value={row.sf} onChange={e=>updRow(setter,row.id,"sf",e.target.value)} style={sl()}>
            <option value="">—</option>{F_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#fff0f0",verticalAlign:"middle"})}>
          <select value={row.si} onChange={e=>updRow(setter,row.id,"si",e.target.value)} style={sl()}>
            <option value="">—</option>{I_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={{...cs({width:43,textAlign:"center",fontWeight:800,fontSize:13,verticalAlign:"middle"}),...rBg(sinR,"#eab308","#000")}}>
          {fmtR(sinR)}
        </td>

        <td style={cs({minWidth:100})}><AA value={row.mit} onChange={e=>updRow(setter,row.id,"mit",e.target.value)} placeholder="Controles, EPP..." /></td>

        {/* CON mitigación */}
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#f0fff4",verticalAlign:"middle"})}>
          <select value={row.cp} onChange={e=>updRow(setter,row.id,"cp",e.target.value)} style={sl()}>
            <option value="">—</option>{P_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#f0fff4",verticalAlign:"middle"})}>
          <select value={row.cf} onChange={e=>updRow(setter,row.id,"cf",e.target.value)} style={sl()}>
            <option value="">—</option>{F_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#f0fff4",verticalAlign:"middle"})}>
          <select value={row.ci} onChange={e=>updRow(setter,row.id,"ci",e.target.value)} style={sl()}>
            <option value="">—</option>{I_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={{...cs({width:43,textAlign:"center",fontWeight:800,fontSize:13,verticalAlign:"middle"}),...rBg(conR,"#16a34a","#fff")}}>
          {fmtR(conR)}
        </td>

        {/* Permiso dropdown */}
        <td style={cs({minWidth:100,position:"relative"})}>
          <div onClick={()=>setDrop(drop===row.id?null:row.id)}
            style={{cursor:"pointer",fontSize:10,color:row.perms.length?"#000":"#aaa",minHeight:16,userSelect:"none",lineHeight:"1.4"}}>
            {row.perms.length ? row.perms.join(", ") : "Seleccionar..."}
          </div>
          {drop===row.id && (
            <div style={{position:"absolute",top:"100%",left:0,zIndex:999,background:"#fff",border:BD,borderRadius:3,
                         boxShadow:"0 4px 14px rgba(0,0,0,0.2)",minWidth:215,padding:"3px 0"}}
              onMouseLeave={()=>setDrop(null)}>
              {PERMS.map(p=>(
                <label key={p} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",fontSize:10,cursor:"pointer",
                                       background:row.perms.includes(p)?"#eff6ff":"transparent"}}>
                  <input type="checkbox" checked={row.perms.includes(p)} onChange={()=>togPerm(setter,row.id,p)} style={{accentColor:"#2563eb"}}/> {p}
                </label>
              ))}
              <div style={{borderTop:"1px solid #e5e5e5",padding:"3px 10px"}}>
                <span onClick={()=>setDrop(null)} style={{fontSize:9,color:"#2563eb",cursor:"pointer",fontWeight:700}}>✓ Confirmar</span>
              </div>
            </div>
          )}
        </td>

        {/* Actions: duplicate + delete */}
        <td className="no-print" style={cs({width:46,textAlign:"center",padding:2,verticalAlign:"middle",borderLeft:"none"})}>
          <div style={{display:"flex",gap:3,justifyContent:"center"}}>
            <button onClick={()=>dupRow(setter,list,row.id)} title="Duplicar fila"
              style={{background:"#e8f4fd",border:"1px solid #93c5fd",borderRadius:3,cursor:"pointer",
                      padding:"3px 5px",color:"#1d4ed8",display:"flex",alignItems:"center"}}>
              <Copy size={11}/>
            </button>
            <button onClick={()=>delRow(setter,row.id)} title="Eliminar fila"
              style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:3,cursor:"pointer",
                      padding:"2px 6px",color:"#dc2626",fontWeight:700,fontSize:13,lineHeight:1}}>×</button>
          </div>
        </td>
      </tr>
    );
  });

  const AddRow = ({ onClick, label }) => (
    <tr className="no-print">
      <td colSpan="15" style={{...cs(),textAlign:"center",padding:"3px",background:"#fafafa"}}>
        <button onClick={onClick}
          style={{background:"none",border:"1px dashed #bbb",borderRadius:3,padding:"2px 14px",cursor:"pointer",
                  fontSize:10,color:"#777",display:"inline-flex",alignItems:"center",gap:4}}>
          <Plus size={10}/> {label}
        </button>
      </td>
    </tr>
  );

  /* ══════════════════════ RENDER ══════════════════════════════════════════ */
  return (
    <div style={{fontFamily:"Arial,sans-serif",background:"#1A0A00",minHeight:"100vh",padding:14}}>

      {/* ── TOOLBAR (AB InBev palette, hidden in print) ── */}
      <div className="no-print"
        style={{maxWidth:1440,margin:"0 auto 12px",display:"flex",alignItems:"center",gap:14,
                padding:"10px 18px",background:"#2A1200",borderRadius:6,border:"1px solid #C8992A55"}}>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAAA8CAIAAAABlLgqAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAARgElEQVR42u1aeXhV1bX/rX2Ge5PcDDcDs4waphIQlYRRGQRRoAzWgQfavu+rz1p8VuvAYBXwoZWiVar9XlvbPiyCdWghYQggyDwlSEIJAQQCYkLIeDPcIeecvdf74yQhJDzb16/vfe97311/3XuGtff+7bXX+q21DjEzovL3iohCEIUvCl8Uvih8UYnCF4UvCl8UvqhE4YvCF4UvCl9UovBF4YvC9/9G9Ov/MgAGuX8oCs9/Cz4GCMzMYIC4BU2AhGARhfOb4XMApZQhBLVBigkMFgzJIPG3HXZmVkqBmYQQQnS8K6UkIvcPABABEEI0X2wRKaX7Q9O0v3E9zUN3dFIdlP9DhJhly8gSZAAqEi4Ole+xgkWsKliGRMLITn3/ldkniIgIzKD/KTuUUv7tSP1fUK4DYAiwZDKU/WXV2fdCJRuVc1Y32RDQLVBXD/rFQBFIKmiCCIohXN+oAGrrJJmZiAKBwO7duy3LGjJ4yMDBA5VSrg26d6urq3ft2kVEYAgiEkSC/P7kQYMGpqV1cl0HCbJte9u2bcFgMC01dfyE8UT0zd7YVV5eXr537z5d15iZABA0Tff7/YMHDU5JTVFKkmsE/yhPxByxVVgxN1Xlnd2aeXYdSjeIss3mlVyzYmtM2WZR//VKZla2xayYaxtC+Q7XSbYlW4ptZsVtxLZtZl61apWrfNSILCmllNK96zgOM+/du7fjNDSBTmlpSxYtjoTDtmUzcyBQm5ycDGDwoAHMUilHqevGaieu8k2bNt1AOWldu3RZtvRl6di23aSU027af7cIqWyNPKHG45f3PGo2HImN1ZXOgC2kZIpEfN3MlPuUVKxT2Movv/DDmuLpkbLfCrBiDWDwdduoaZplWR+sXWvoerwv7uixvLyjR4UQrV4MgK7rpq4n+uI9HkMT0AQASIVAILDitVefefoZ3XA9MiUlJWia5vP5ADQbzV8Tw9A1TfP5YkxTb7UxybK6uvLlpcsWL16k6+Y/sDcriLwsq77OewbOKeiGBSkYTASNaxViu3/P47mFhLDqdlUWP0aBdSmobix7LVKfo4HaTcMNCLt37y4sPGFqhnQsR8rf/8fvWylR6ykDU2MoOHPmjF2ff56bm5ubu/XFJYtivN4Yj/c3v/lNwRfHAUjpSGVLKZVUrfodp9kGHUe6KCil2u4Ns5JSBkORefPm79mzZ+fOz3Zs375s6cu+eJ/XY6xevfr8ubNC6Eo1z8d9va2qVnDd4doqb33FcRzX2HVBesW59fLK7jiPh6R0CA5rJigSsc0u96b1ekyR4QT31556NgEnDY/hCMPQqsNX/930jQcltsUFUID2/vtrFKuMYUN69e71x48+ydmY/cryV9I6deKWgEhEIJZS9e7VZ9y4u9yLU6bc49jy9ZUrGTh0+NCw4bcyK1Yt/JMBsKbprRug61prSAXAUkExNLiLZ8Xp6beMHTfOfWbS3Xc3Njb8bNWbAPKP5fe7OZ2VBMiRssXSr6kCWClHkNYaZxzH0TSt1fhFGzqhS7uq5qv1Ho1sUoLYULquc6TJll3u7jnsbda6QlZUXVgo1F9gCqUU6WFTiGDoULi+MC7pLrDjpi5KKU3TL168sH37NgCzZs+aMGHCh3/8uKy8/NNPPn38iR9IKUHU7ArBACKRJtuyHGkrpQzDMyJzRDO4bYiBC5ZLRFe+/tMzZ74cNXLkvHn/9Nbbb+38bGd9XUOXLp0fevihh+fObd6eFtuJhMOWZUlpM3NsrC89Pd1VbtuOiy8T64Z+6MDBNe+/f+pUkeM4PXp0nzr1nnnz5xuGp6qicsWKFaFwqGu3bkuWLGmeBrMQIicnJzs7m4jmzp2L+oqtZ/4cd+lTuvgJXf4Ylz7Clxtjr+TNt5ouBFkp5prLq0o/R+VBveaIVpdPtQVUW6TVnEDdpYWKlVI2s2SWtt3EzCtWvAIgNjam6OQJKZ3+6TcT0eiRoyzLspos99wVFhYahgZg0cLn27rhJ59c4K788MFDzFxTU9WzZw8At992K7Nk5iGDBwO4a9yd354xo92BWvj8C66SrVuaQ8dPX1vRqjlQWzv+zrsACIjCggJmbopEmPnll14ydKOdqtGjR50/f85xnDGjRrtXjh075nJVKaVSKisrC4BpmqdPn9brKwpkrWXFsUSC7u3i6TSs882P+lLHSqmbEpIvhst/59XBBGIwMYMANpRg67jiBoEEQAKkaXpTU+TDD/9IRGNGjxo4cBAJbc6cOa++9vrRvKPH8vKzRo2srqo+f/7cli1bwTAMLScnp6TkopSyc5fOTU3W2rVrNU0seGLBHSNGANyRbyckJOi6XnD8eKChftzYURkZw4qLT+3fd0DXjddXrpw2bdrosWOkUgBMQ//oo4+Kiops25ZSFRQUXrhwwdD1hS8sHpKR4Ti26fGsWrlq2fLlutD69e03deqU+Pi4o0eP7t9/4MCBg7NnzczL/+KFhQsPz56llNqwYcPw4cMdxzFN88SJEydOnNB1fe7cuf3790dj4HRNyZ8CZR81VORYwRPMYWa2lWM5NituuPqH0h3e2gOi5oCoPUK1+VRToNecNOsLUXk6UzrlymHFsoU0ZLtrXrPm90opx7HPnD6VGB9PoMmT7n5k3vxePXtpJAAYuhbjbb/t8b7Y2Bjv+nVrmVkpJxCo6XlTdwC3tVhfVmYmAAL9+OlnrtnsggWCCMALzz3HzDnZGwD44mLaKY+L9SYmxP/50z+5acmlkktJCX5BNGb0qEuXSlqUqeXLXtY0AeDNN95wbKdv7z5ENHzYrVaT5dg2M7+ybDkAQSI3d4tSCi7/iTArZsUsFStlOyxtKZmbrp7+UdkOUbNfqz4oao6gNl/UFOg1Jz2BQlScud1xrrSF7/77ZwO46abuV66UutM5c/pUvz59DN1wUQOgC0rxp8R4TMPQ0m+5efasb0+9Z/Idtw9P9icC8JgGgF/+8h1mrq6ubAffyKxMACnJyWWlpcwcDDYwc9HJkzEeL4CHHniQmXNyNgKI8Zp9evfMyhpxx+3DM0fc/q3BA3WNdE0A+PWvfs3MP3/z5y6mRSdPtKNyd44bQyQyhgxh5ueffQ6AoRsH9u1nZtuys0ZkEtHQjG+FI2GlFELhr61gieSIZJZKKnaY2WFbSsUcLP9i2tVdqNlnVB3Sqo8gcMyFz6wtRNXZCVJVtgb7c+fO+f2JAB77l+8zc/mVsmee/lFSYgKAWG+Mx/Rk3nH7L1a/deTI4S2bNsd4PACef+7H7p47jnX+/Lklixd5PaZpaMn+xPIrZY0N9e3gG5U1EsC3Bg22Ik2sHMexmLm0rLRLp84A7p8zh5k3bdro7tPyZUuZ2XEsZmlZTdnZG1KTkwmUlpoWDAYf+/73icifFD9j+r1zZs+ePWvm7FkzZs6cPmf2rAH90w1dS/En11bXnD5VHOuNAfDkDxcw86EDh7weE8Brry13cwQ9VJ1/Jf9nKZ37J/T5TlzaRLChyFZEghSgsRMRLmsjJgKYCcysSYZhpgtKYraU0oXA+nXramvrTEP/4RM/2L4t9wdPPHHhQgkBkyZMKC4+XXqlLC7Ot+DJpwDkHT0ipeMSAqWUZUVMw+jbt9+/rXi1sbFx9S/eqamt27dv75w5c27Ib1uSfwK5mSNdK2604ZfMqpljgjWB6dO//d3vPfrGmz+vrKosLDhOAu76s3O23JAPh8LhQCDQf+CAMWPG7Ni5Y8uWLW+rtzdvyYk0Wcn+hAe+82Azg0lIG+oxahou/O7KvgdK8p6w7FOCFNg9a6SgMQPEAiB2eRALOCTjPPGTAR2saZoIhcLr1q8HkJWZmb0xe8o9Uy9cKJl2372ffbZjx86dd951J4Dde/Zu2ZwjpQyHQ6Br1RFWSkoZDNYDGDo0g5mJRDAYJKL/Mj0gAjXXhYQA6AYlllZy6zh2k2UBSOvUiRlEFA6HenTvDpBumDnZG44eOXJw/4HDhw4fPnSw4Pixs2eKz5w+lZ+fl5qWBuCRRx9lRsnFkq1bt+zbt5uIxo+f2LdfulJSCCE0s3dS3+8pL3xa2L703lefz47UH9FJkBQAk+nh1vIpBEMwaYptGJlmwhiG7TiKiLZtyy0uLo6N8Zw7f+4nLy3t3fOmD9evy9m0ecLESQAefOBBQUKxWrt2bVv+GRMTo+t6TKzPML1xcQnVNdXvvfdbXRPMqk+fPh3p/jck7u0SGwBxcXG6rnu9sbrujYnxlX5d+of31xqGBnCvXr0mTpwIcEND49GjeXeMGDFy9KjMrMzMrJFdunZd/+GHa9d+UFJS4vP5HCnvm3Zf7549FfOLLy4uKipi5vnz57Vat06W8vd+qPL8B7XBwiQzUdWfuXzoqZvu+pVHv43hifUNiFRmu5tJOty8M6J88T0fg5YGZUEjAGvWrBFCGIZZduXqnFkz33n33S5du0nHUkrpujlx0qT0W245e+7Lbdu21dZUx8bGKsWmaezevefFJYtt2xaaFmis37ljx+WLXzlSDeh/S2ZmVjAUcs9pK9zUIjewRSIS3PqYaei5W3MDgTpHOhpptTW1O3Z8VlpWatvy7kkT+vTp27ffzfdOnbJl67aVK39WWVH1yKOPJCUmFZ4oXLr0pTNnzwHYsX07CE2OnZSUNOf+2W+8+dbZs2ciEbt/er/Jk6ewUkJoACDDtsOqsSr7Lx/3KPtAu7ox5quPtUtfzJNcpxSHA1vLdnkb9phVBzwVeVrtUXE1D4HKnyi2pbQdy2HmoqIiwzBcyvLCc81M2LItpZRk5dZgnv3xs+7a3lm9urjoFADTuHHpLSU5effnu5m5qqqqe9euAIYOHerqzByRCWDwwEFuScYNWeXlZakpiQBmzZzBzJuyswF4DeOGyodlDP3q0iU33F2+fDkjI8O9bupGYnxiS+1HvPfer90SjssoCo4fa2VaL734IjNbluVOSYcBtjk2ZVqvsar80BKzqcjrpVB5TjjwQGzSdE/saJkwPtiY64Guh2WD6fX1eDIx5XnFGpFSYACffPKJewyfe/bZhYsWSduBIL2ZzTMJAeDhuQ+veX+N4zg5mzbfeutt/qRE0SLcXKoRKckpY8eOfeqpH/UfMIAB3TAS/f7GUCghIcGt5SUmJiYmJvr9/utNj1JSUm0H8fGJAAzTk5SYFBPjUUqSEAQAwjDMbt27zZg+4/HHH/cn+6VSYO7Ro8euXbuWLl26ccOGstKyuoa6uNiYocOGLVq4cNr0GUopN+dlVhlDh02ZPHnf/gOpKZ3mzp0HQGjNPIykwyBlETNpCB2rLno3XJkrg1eSBz3dafCbzAhXfvD12e8auvDFDovt/mRc0jwlJDGBBIiVUtVV1W4ymJaWpqQkEAliIjexpZbgWFlRqaRkZp/PFww2cIurIiGYWWjCn5hkmF4AjiV1XUhWVdVVUipd01JTUwEEampt29Y1PSnZr+mt+bxVU12jFEzT9Cf7m5qaauvqBIGg3MDDTKZpuqVDANKFlaGk1HQdQEV5xZmzxeFIsHOnzkOH3QoIJW2hGa0RnAihUKihvl7TjZSUVDfCE4OISClHkiCwUhBCaLBDDfkNlz4zzO7J6f9sgXUVrL663vD6E/2jgG5QFoiIDSaAGMzUQomVUgIEaoHtmmtqLgW37UjdsHLrOLKlnnFdS8ANwa0aWDEJQgd1143SoRbdXDgR1NwHawn9un6t6MJKKlaapreZotsyu7ZGEIFa4JNsAQLQiAFW15UlmRlQRG28lGzRK9qtrUOx5AYL+Gt9l/bvu02f1nDhupuO0aPdBJpLL9c/Q9S+o3B9d4kBJqKOiXbHIdruJSlW1zbQrQe4QZkIAsQMIjdIu6BH++vtOm3cYlYAtOZyY0u1jZqPHhRBQFH084QbdNrYtb5rFk1oudLivUTb9CgqHdrkdJ2P4A7UNPrVxg3hu7FHjwIV/cLqfzN0RCVqfVH4ovBF4YtKFL4ofFH4ovBFJQpfFL4ofFH4onJN/hPFRJxucHHa+AAAAABJRU5ErkJggg==" alt="AB InBev" style={{height:46,width:"auto",flexShrink:0,objectFit:"contain"}} />
        <div style={{width:1,height:38,background:"#C8992A44",flexShrink:0}}/>
        <div>
          <div style={{color:"#C8992A",fontWeight:700,fontSize:12,letterSpacing:"0.3px"}}>
            Declaración de Método y Evaluación de Riesgo
          </div>
          <div style={{color:"#C8992A77",fontSize:9,letterSpacing:"1.2px",marginTop:2}}>
            METHOD STATEMENT &amp; RISK ASSESSMENT · MÉTODO KINNEY
          </div>
        </div>
        <div style={{flex:1}}/>
        {/* Risk legend */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {[{l:"R>400",bg:"#dc2626",d:"Muy Alto"},{l:"200–400",bg:"#ea580c",d:"Alto"},
            {l:"70–199",bg:"#ca8a04",d:"Considerable"},{l:"20–69",bg:"#2563eb",d:"Posible"},{l:"<20",bg:"#16a34a",d:"Bajo"}]
            .map(r=>(
              <span key={r.l} style={{background:r.bg,color:"#fff",padding:"2px 7px",borderRadius:3,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>
                {r.l} {r.d}
              </span>
            ))}
        </div>
        <div style={{width:1,height:38,background:"#C8992A44",flexShrink:0}}/>
        <button onClick={handlePrint}
          style={{display:"flex",alignItems:"center",gap:8,background:"#C8992A",color:"#1A0A00",
                  border:"none",borderRadius:5,padding:"9px 20px",fontSize:13,fontWeight:800,
                  cursor:"pointer",boxShadow:"0 2px 8px rgba(200,153,42,0.5)",letterSpacing:"0.3px",flexShrink:0}}>
          <Printer size={16}/> Imprimir / Guardar PDF
        </button>
      </div>

      {/* ══ DOCUMENT ══════════════════════════════════════════════════════ */}
      <div id="msra-doc"
        style={{background:"#fff",maxWidth:1440,margin:"0 auto",padding:14,boxShadow:"0 2px 14px rgba(0,0,0,0.5)"}}>

        {/* ── INFO HEADER ── */}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <tbody>
            <tr>
              <td style={cs({width:"19%",borderRight:"none"})}>
                <div style={{fontSize:9,fontWeight:700,color:"#2d6a3f",textTransform:"uppercase",letterSpacing:"0.3px"}}>Nombre de la empresa:</div>
                <PI value={empresa} onChange={e=>setEmpresa(e.target.value)} placeholder="Empresa contratista..."
                  style={{color:"#2d6a3f",fontSize:12,fontWeight:700}} />
              </td>
              <td style={cs({textAlign:"center",fontWeight:800,fontSize:14,borderLeft:"none"})}>
                Declaración de método y Evaluación de Riesgo
              </td>
              <td rowSpan="2" style={cs({width:32,textAlign:"center",verticalAlign:"middle",background:"#d0d0d0",padding:3})}>
                <div style={{writingMode:"vertical-rl",transform:"rotate(180deg)",fontSize:9,fontWeight:700,whiteSpace:"nowrap",letterSpacing:"0.4px"}}>
                  Permiso de trabajo requerido
                </div>
              </td>
            </tr>
            <tr>
              <td style={cs({borderRight:"none"})}>
                {/* FIX: flexbox keeps Duración and Fecha tight together */}
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#b84500",whiteSpace:"nowrap"}}>Duración:</span>
                  <PI value={duracion} onChange={e=>setDuracion(e.target.value)} placeholder="Ej: 2 horas"
                    style={{flex:1,minWidth:60,color:"#b84500",fontSize:10}} />
                  <span style={{fontSize:9,fontWeight:700,color:"#444",whiteSpace:"nowrap"}}>Fecha:</span>
                  <PI type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
                    style={{width:"auto",fontSize:9,color:"#444"}} />
                </div>
              </td>
              <td style={cs({borderLeft:"none"})}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#2d6a3f",whiteSpace:"nowrap"}}>Actividad:</span>
                  <PI value={actividad} onChange={e=>setActividad(e.target.value)} placeholder="Describir la actividad..."
                    style={{flex:1,color:"#2d6a3f",fontSize:10}} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── MAIN TABLE ── */}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              {/* drag col header (no-print, rowspan 2) */}
              <th className="no-print" style={hs({width:16,padding:1})} rowSpan="2"></th>
              <th style={hs({fontSize:9,width:"11%"})} rowSpan="2">Secuencia de Actividades</th>
              <th style={hs({fontSize:9,width:"9%"})}  rowSpan="2">¿Qué técnicas / herramientas / equipos Usará?</th>
              <th style={hs({fontSize:9,width:"10%"})} rowSpan="2">Descripción del riesgo</th>
              <th style={hs({background:"#f5b8b8",fontSize:9})} colSpan="4">Evaluación de riesgos SIN medidas de mitigación</th>
              <th style={hs({fontSize:9,width:"11%"})} rowSpan="2">
                Medidas de mitigación, las cuales <em>deberán ser implementadas</em> para disminuir el riesgo significativamente
              </th>
              <th style={hs({background:"#b8e8c0",fontSize:9})} colSpan="4">Evaluación de riesgos CON medidas de mitigación</th>
              <th style={hs({fontSize:9,width:"9%"})}  rowSpan="2">Permiso de trabajo requerido</th>
              {/* actions col header (no-print, rowspan 2) */}
              <th className="no-print" style={hs({width:46,padding:1})} rowSpan="2">Acc.</th>
            </tr>
            <tr>
              <th style={hs({width:43,background:"#f5b8b8",fontSize:11})}>P</th>
              <th style={hs({width:43,background:"#f5b8b8",fontSize:11})}>F</th>
              <th style={hs({width:43,background:"#f5b8b8",fontSize:11})}>I</th>
              <th style={hs({width:43,background:"#ca8a04",fontSize:11,color:"#fff"})}>R</th>
              <th style={hs({width:43,background:"#b8e8c0",fontSize:11})}>P</th>
              <th style={hs({width:43,background:"#b8e8c0",fontSize:11})}>F</th>
              <th style={hs({width:43,background:"#b8e8c0",fontSize:11})}>I</th>
              <th style={hs({width:43,background:"#16a34a",fontSize:11,color:"#fff"})}>R</th>
            </tr>
          </thead>
          <tbody>
            {Rows(rows, setRows)}
            <AddRow onClick={()=>setRows(rs=>[...rs,mkRow()])} label="Agregar fila de actividad" />

            {/* Health section */}
            <tr>
              <td colSpan="15" style={{...cs(),textAlign:"center",fontWeight:700,fontSize:11,
                                       background:"#d8d8d8",padding:"5px 4px",letterSpacing:"0.3px"}}>
                Declaración de Riesgos a la Salud y su Evaluación de Riesgos
              </td>
            </tr>
            {Rows(hrows, setHrows)}
            <AddRow onClick={()=>setHrows(rs=>[...rs,mkRow()])} label="Agregar fila de riesgo a la salud" />
          </tbody>
        </table>

        {/* ── ENVIRONMENTAL TABLE ── */}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={hs({width:"17%",fontSize:10})}>Aspecto Ambiental</th>
              <th style={hs({width:"23%",fontSize:10})}>Impacto Ambiental</th>
              <th style={hs({width:"17%",fontSize:9})}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                  <span>Aplica (X) / No Aplica (N/A)</span>
                  <button onClick={naAll} className="no-print"
                    style={{background:"#2d6a3f",color:"#fff",border:"none",borderRadius:2,
                            padding:"2px 6px",cursor:"pointer",fontSize:8,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>
                    N/A Todos
                  </button>
                </div>
              </th>
              <th style={hs({fontSize:10})}>Acciones de mitigación</th>
            </tr>
          </thead>
          <tbody>
            {ENV_LIST.map(env => {
              const s = envSt[env.id];
              return (
                <tr key={env.id}>
                  <td style={cs({fontSize:10})}>{env.a}</td>
                  <td style={cs({fontSize:9})}>{env.i}</td>
                  <td style={cs({textAlign:"center"})}>
                    <div style={{display:"flex",justifyContent:"center",gap:18}}>
                      <label style={{display:"flex",alignItems:"center",gap:3,fontSize:10,cursor:"pointer"}}>
                        <input type="radio" name={`env-${env.id}`} value="si" checked={s.ap==="si"}
                          onChange={()=>setEnv(env.id,"ap","si")} style={{accentColor:"#dc2626"}}/> X
                      </label>
                      <label style={{display:"flex",alignItems:"center",gap:3,fontSize:10,cursor:"pointer",fontWeight:s.ap==="no"?700:400}}>
                        <input type="radio" name={`env-${env.id}`} value="no" checked={s.ap==="no"}
                          onChange={()=>setEnv(env.id,"ap","no")} style={{accentColor:"#16a34a"}}/> N/A
                      </label>
                    </div>
                  </td>
                  <td style={cs()}>
                    {s.ap==="si"
                      ? <AA value={s.mit} onChange={ev=>setEnv(env.id,"mit",ev.target.value)} placeholder="Describir acción de mitigación..." style={{fontSize:10}} />
                      : <span style={{fontSize:10,color:"#666"}}>{s.ap==="no"?"N/A":""}</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── CHEMICALS TABLE ── */}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr><th colSpan="4" style={hs({fontSize:11,letterSpacing:"0.5px"})}>USO DE SUSTANCIAS QUÍMICAS</th></tr>
            <tr>
              <th style={hs({fontSize:10})}>Nombre Comercial</th>
              <th style={hs({fontSize:10})}>Actividad</th>
              <th style={hs({fontSize:10})}>Concentración</th>
              <th className="no-print" style={hs({width:65,fontSize:9})}>
                <button onClick={()=>setChems(cs=>[...cs,mkChem()])}
                  style={{background:"none",border:"1px dashed #555",borderRadius:2,padding:"1px 6px",
                          cursor:"pointer",fontSize:8,display:"inline-flex",alignItems:"center",gap:2,fontWeight:700}}>
                  <Plus size={8}/> Agregar
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {chems.map(c=>(
              <tr key={c.id}>
                <td style={cs()}><PI value={c.nombre}       onChange={e=>setChem(c.id,"nombre",   e.target.value)} placeholder="N/A" style={{fontSize:10}} /></td>
                <td style={cs()}><PI value={c.actividad||""} onChange={e=>setChem(c.id,"actividad",e.target.value)} placeholder="N/A" style={{fontSize:10}} /></td>
                <td style={cs()}><PI value={c.conc}          onChange={e=>setChem(c.id,"conc",     e.target.value)} placeholder="N/A" style={{fontSize:10}} /></td>
                <td className="no-print" style={cs({textAlign:"center"})}>
                  {chems.length>1 && (
                    <button onClick={()=>setChems(cx=>cx.filter(x=>x.id!==c.id))}
                      style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:16,fontWeight:700}}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── KINNEY REFERENCE ── */}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <tbody>
            <tr>
              <td colSpan="2" style={cs({fontSize:9,fontStyle:"italic",color:"#555",padding:"4px 6px",background:"#f5f5f5"})}>
                Evaluación de riesgos según método KINNEY: "P" = Probabilidad — "F" = Frecuencia — "I" = Impacto — "R" = Resultado.
              </td>
              <td colSpan="2" style={cs({background:"#f5f5f5",padding:"4px 8px"})}>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {[{l:"R>400",bg:"#dc2626",d:"Muy Alto"},{l:"200–400",bg:"#ea580c",d:"Alto"},
                    {l:"70–199",bg:"#ca8a04",d:"Considerable"},{l:"20–69",bg:"#2563eb",d:"Posible"},{l:"<20",bg:"#16a34a",d:"Bajo"}]
                    .map(r=>(
                      <span key={r.l} style={{background:r.bg,color:"#fff",padding:"1px 6px",borderRadius:2,fontSize:8,fontWeight:700,whiteSpace:"nowrap"}}>
                        {r.l} → {r.d}
                      </span>
                    ))}
                </div>
              </td>
            </tr>
            <tr>
              <th style={hs({fontSize:9,width:"25%"})}>P — Probabilidad</th>
              <th style={hs({fontSize:9,width:"25%"})}>F — Frecuencia</th>
              <th style={hs({fontSize:9,width:"25%"})}>I — Impacto</th>
              <td style={cs({background:"#fafafa",fontSize:9,color:"#888",fontStyle:"italic"})}>
                Los valores de los selectores se pueden consultar pasando el cursor sobre cada opción.
              </td>
            </tr>
            <tr>
              <td style={cs({fontSize:9,verticalAlign:"top"})}>{P_OPTS.map(o=><div key={o.v} style={{padding:"1px 0"}}>{o.l}</div>)}</td>
              <td style={cs({fontSize:9,verticalAlign:"top"})}>{F_OPTS.map(o=><div key={o.v} style={{padding:"1px 0"}}>{o.l}</div>)}</td>
              <td style={cs({fontSize:9,verticalAlign:"top"})}>{I_OPTS.map(o=><div key={o.v} style={{padding:"1px 0"}}>{o.l}</div>)}</td>
              <td style={cs({background:"#fafafa"})}></td>
            </tr>
          </tbody>
        </table>

        {/* ── SIGNATURES ── */}
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:10}}>
          <tbody>
            <tr>
              {["NOMBRE Y FIRMA CONTRATISTA","NOMBRE Y FIRMA RESPONSABLE DEL TRABAJO AB-INBEV","NOMBRE Y FIRMA SUPERVISOR SAFETY"]
                .map((label,i)=>(
                  <td key={i} style={cs({width:"33.33%",height:76,verticalAlign:"bottom",textAlign:"center"})}>
                    <div style={{height:48,borderBottom:"1px solid #555",marginBottom:4}}></div>
                    <div style={{fontSize:9,fontWeight:700,marginBottom:4,letterSpacing:"0.4px"}}>{label}</div>
                    <PI placeholder="Nombre completo / Cargo / Fecha" value="" onChange={()=>{}}
                      style={{fontSize:9,textAlign:"center",borderBottom:"1px dotted #bbb"}} />
                  </td>
                ))}
            </tr>
          </tbody>
        </table>

        {/* ── FOOTER ── */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:5,
                     borderTop:"1px solid #ccc",fontSize:8,color:"#999"}}>
          <span>Confidential - proprietary information AB InBev</span>
          <span>© AB InBev 31-05-08 All rights reserved</span>
        </div>

      </div>{/* end #msra-doc */}
    </div>
  );
}
