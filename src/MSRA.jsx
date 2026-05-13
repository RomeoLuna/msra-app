import { useState } from "react";
import { Plus, Printer } from "lucide-react";

const PRINT_CSS = `
@media print {
  @page { size: A3 landscape; margin: 8mm; }
  body * { visibility: hidden; }
  #msra-doc, #msra-doc * { visibility: visible; }
  #msra-doc { position: fixed; inset: 0; background: #fff !important; padding: 0 !important; box-shadow: none !important; max-width: 100% !important; }
  .no-print { display: none !important; }
  select { -webkit-appearance: none; appearance: none; }
  input[type="date"]::-webkit-calendar-picker-indicator { display: none; }
}
`;

let _id = 0;
const uid = () => ++_id;

const P_OPTS = [
  { v: "10",  l: "10 — Esperado que ocurra" },
  { v: "6",   l: "6 — Muy posible" },
  { v: "3",   l: "3 — Raro pero posible" },
  { v: "1",   l: "1 — Improbable" },
  { v: "0.5", l: "0.5 — Concebible" },
  { v: "0.1", l: "0.1 — Casi improbable" },
];
const F_OPTS = [
  { v: "10",  l: "10 — Continuo" },
  { v: "6",   l: "6 — Diario" },
  { v: "3",   l: "3 — Semanal" },
  { v: "2",   l: "2 — Mensual" },
  { v: "1",   l: "1 — Anual" },
  { v: "0.5", l: "0.5 — < 1 al año" },
];
const I_OPTS = [
  { v: "40", l: "40 — Catástrofe" },
  { v: "15", l: "15 — Muy Serio" },
  { v: "7",  l: "7 — Serio" },
  { v: "3",  l: "3 — Importante" },
  { v: "1",  l: "1 — Menor" },
];
const PERMS = ["General","LOTOTO","Altura","Caliente","Espacio confinado","Izaje","Obra infraestructura"];
const ENV_LIST = [
  { id:"agua",  a:"Consumo de agua",                   i:"Agotamiento de Recursos Naturales" },
  { id:"enrg",  a:"Consumo de energía eléctrica",      i:"Agotamiento de Recursos Naturales" },
  { id:"gas",   a:"Emisión de gases de combustión",    i:"Contaminación al aire" },
  { id:"rpel",  a:"Generación de residuos peligrosos", i:"Contaminación de aguas superficiales y/o suelos. Residuos de vertederos" },
  { id:"rsol",  a:"Generación de residuos sólidos",    i:"Contaminación de aguas superficiales y/o suelos. Residuos de vertederos" },
  { id:"rliq",  a:"Generación de residuos líquidos",   i:"Contaminación de aguas superficiales y/o suelos. Residuos de vertederos" },
];

const mkRow  = () => ({ id:uid(), seq:"", tools:"", risk:"", sp:"", sf:"", si:"", mit:"", cp:"", cf:"", ci:"", perms:[] });
const mkChem = () => ({ id:uid(), nombre:"", actividad:"", conc:"" });
const calcR  = (p,f,i) => { const a=parseFloat(p),b=parseFloat(f),d=parseFloat(i); return a&&b&&d?a*b*d:0; };
const fmtR   = r => r>0?(r%1===0?String(r):r.toFixed(1)):"0";
const rBg    = (r,dfBg,dfTx) => {
  if(!r) return {background:dfBg,color:dfTx};
  if(r>400)  return {background:"#dc2626",color:"#fff"};
  if(r>=200) return {background:"#ea580c",color:"#fff"};
  if(r>=70)  return {background:"#ca8a04",color:"#fff"};
  if(r>=20)  return {background:"#2563eb",color:"#fff"};
  return            {background:"#16a34a",color:"#fff"};
};

const BD = "1px solid #888";
const cs = (s={}) => ({border:BD,padding:"3px 5px",fontSize:11,verticalAlign:"middle",...s});
const hs = (s={}) => ({...cs(),fontWeight:700,textAlign:"center",background:"#c8c8c8",lineHeight:"1.3",...s});
const pi = (s={}) => ({width:"100%",border:"none",outline:"none",background:"transparent",fontSize:11,fontFamily:"Arial,sans-serif",padding:"1px 0",...s});
const sl = (s={}) => ({width:"100%",border:"none",outline:"none",background:"transparent",fontSize:10,fontFamily:"Arial,sans-serif",cursor:"pointer",...s});

export default function MSRA() {
  const [empresa,   setEmpresa]   = useState("");
  const [duracion,  setDuracion]  = useState("");
  const [actividad, setActividad] = useState("");
  const [fecha,     setFecha]     = useState("");
  const [rows,      setRows]      = useState([mkRow(),mkRow(),mkRow()]);
  const [hrows,     setHrows]     = useState([mkRow()]);
  const [envSt,     setEnvSt]     = useState(() => Object.fromEntries(ENV_LIST.map(e=>[e.id,{ap:null,mit:""}])));
  const [chems,     setChems]     = useState([mkChem(),mkChem(),mkChem()]);
  const [drop,      setDrop]      = useState(null);

  const updRow  = (set,id,f,v) => set(rs=>rs.map(r=>r.id===id?{...r,[f]:v}:r));
  const delRow  = (set,id)     => set(rs=>rs.length>1?rs.filter(r=>r.id!==id):rs);
  const togPerm = (set,rid,p)  => set(rs=>rs.map(r=>{
    if(r.id!==rid) return r;
    const ps=r.perms.includes(p)?r.perms.filter(x=>x!==p):[...r.perms,p];
    return {...r,perms:ps};
  }));
  const setEnv  = (id,f,v) => setEnvSt(e=>({...e,[id]:{...e[id],[f]:v}}));
  const naAll   = ()       => setEnvSt(()=>Object.fromEntries(ENV_LIST.map(e=>[e.id,{ap:"no",mit:"N/A"}])));
  const setChem = (id,f,v) => setChems(cs=>cs.map(c=>c.id===id?{...c,[f]:v}:c));

  const Rows = (list, set) => list.map((row,idx) => {
    const sinR = calcR(row.sp,row.sf,row.si);
    const conR = calcR(row.cp,row.cf,row.ci);
    return (
      <tr key={row.id} style={{background:idx%2===0?"#fff":"#f9f9f9"}}>
        <td style={cs({minWidth:90})}>
          <input value={row.seq}   onChange={e=>updRow(set,row.id,"seq",  e.target.value)} placeholder="Describir..." style={pi()} />
        </td>
        <td style={cs({minWidth:85})}>
          <input value={row.tools} onChange={e=>updRow(set,row.id,"tools",e.target.value)} placeholder="Herramientas..." style={pi()} />
        </td>
        <td style={cs({minWidth:90})}>
          <input value={row.risk}  onChange={e=>updRow(set,row.id,"risk", e.target.value)} placeholder="Riesgo..." style={pi()} />
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#fff0f0"})}>
          <select value={row.sp} onChange={e=>updRow(set,row.id,"sp",e.target.value)} style={sl()}>
            <option value="">—</option>
            {P_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#fff0f0"})}>
          <select value={row.sf} onChange={e=>updRow(set,row.id,"sf",e.target.value)} style={sl()}>
            <option value="">—</option>
            {F_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#fff0f0"})}>
          <select value={row.si} onChange={e=>updRow(set,row.id,"si",e.target.value)} style={sl()}>
            <option value="">—</option>
            {I_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={{...cs({width:43,textAlign:"center",fontWeight:800,fontSize:13}),...rBg(sinR,"#eab308","#000")}}>
          {fmtR(sinR)}
        </td>
        <td style={cs({minWidth:110})}>
          <input value={row.mit} onChange={e=>updRow(set,row.id,"mit",e.target.value)} placeholder="Medidas, EPP..." style={pi()} />
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#f0fff4"})}>
          <select value={row.cp} onChange={e=>updRow(set,row.id,"cp",e.target.value)} style={sl()}>
            <option value="">—</option>
            {P_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#f0fff4"})}>
          <select value={row.cf} onChange={e=>updRow(set,row.id,"cf",e.target.value)} style={sl()}>
            <option value="">—</option>
            {F_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={cs({width:43,padding:"2px 1px",textAlign:"center",background:"#f0fff4"})}>
          <select value={row.ci} onChange={e=>updRow(set,row.id,"ci",e.target.value)} style={sl()}>
            <option value="">—</option>
            {I_OPTS.map(o=><option key={o.v} value={o.v} title={o.l}>{o.v}</option>)}
          </select>
        </td>
        <td style={{...cs({width:43,textAlign:"center",fontWeight:800,fontSize:13}),...rBg(conR,"#16a34a","#fff")}}>
          {fmtR(conR)}
        </td>
        <td style={cs({minWidth:105,position:"relative"})}>
          <div
            onClick={()=>setDrop(drop===row.id?null:row.id)}
            style={{cursor:"pointer",fontSize:10,color:row.perms.length?"#000":"#aaa",minHeight:16,userSelect:"none"}}
          >
            {row.perms.length?row.perms.join(", "):"Seleccionar..."}
          </div>
          {drop===row.id && (
            <div style={{position:"absolute",top:"100%",left:0,zIndex:999,background:"#fff",border:BD,borderRadius:3,boxShadow:"0 4px 14px rgba(0,0,0,0.2)",minWidth:215,padding:"3px 0"}}
              onMouseLeave={()=>setDrop(null)}>
              {PERMS.map(p=>(
                <label key={p} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",fontSize:10,cursor:"pointer",background:row.perms.includes(p)?"#eff6ff":"transparent"}}>
                  <input type="checkbox" checked={row.perms.includes(p)} onChange={()=>togPerm(set,row.id,p)} style={{accentColor:"#2563eb"}} /> {p}
                </label>
              ))}
              <div style={{borderTop:"1px solid #e5e5e5",padding:"3px 10px"}}>
                <span onClick={()=>setDrop(null)} style={{fontSize:9,color:"#2563eb",cursor:"pointer",fontWeight:700}}>✓ Confirmar</span>
              </div>
            </div>
          )}
        </td>
        <td style={cs({width:20,textAlign:"center",padding:1})}>
          <button onClick={()=>delRow(set,row.id)} title="Eliminar"
            style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:18,fontWeight:700,lineHeight:1,padding:0}}>×</button>
        </td>
      </tr>
    );
  });

  const AddRow = ({onClick,label}) => (
    <tr>
      <td colSpan="14" style={{...cs(),textAlign:"center",padding:"3px",background:"#fafafa"}}>
        <button onClick={onClick}
          style={{background:"none",border:"1px dashed #aaa",borderRadius:3,padding:"2px 12px",cursor:"pointer",fontSize:10,color:"#666",display:"inline-flex",alignItems:"center",gap:4}}>
          <Plus size={10}/> {label}
        </button>
      </td>
    </tr>
  );

  const handlePrint = () => {
    const style = document.createElement("style");
    style.id = "__msra_print__";
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => { const s = document.getElementById("__msra_print__"); if(s) s.remove(); }, 1200);
  };

  return (
    <div style={{fontFamily:"Arial,sans-serif",background:"#d4d4d4",minHeight:"100vh",padding:16}}>

      {/* ── TOOLBAR ── */}
      <div style={{maxWidth:1440,margin:"0 auto 10px",display:"flex",justifyContent:"flex-end"}} className="no-print">
        <button onClick={handlePrint}
          style={{display:"flex",alignItems:"center",gap:8,background:"#1a3a5c",color:"#fff",border:"none",borderRadius:5,padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.3)",letterSpacing:"0.3px"}}>
          <Printer size={16}/> Imprimir / Guardar PDF
        </button>
      </div>

      <div id="msra-doc" style={{background:"#fff",maxWidth:1440,margin:"0 auto",padding:16,boxShadow:"0 2px 12px rgba(0,0,0,0.22)"}}>

        {/* ── INFO HEADER ── */}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <tbody>
            <tr>
              <td style={cs({width:"19%",borderRight:"none",paddingBottom:2})}>
                <div style={{fontSize:9,fontWeight:700,color:"#2d6a3f",textTransform:"uppercase",letterSpacing:"0.3px"}}>Nombre de la empresa:</div>
                <input value={empresa} onChange={e=>setEmpresa(e.target.value)} placeholder="Empresa contratista..."
                  style={pi({color:"#2d6a3f",fontSize:12,fontWeight:700})} />
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
                <span style={{fontSize:9,fontWeight:700,color:"#b84500"}}>Duración: </span>
                <input value={duracion} onChange={e=>setDuracion(e.target.value)} placeholder="Ej: 2 horas"
                  style={pi({display:"inline",width:"44%",color:"#b84500",fontSize:10})} />
                <span style={{fontSize:9,fontWeight:700,color:"#444",marginLeft:8}}>Fecha: </span>
                <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
                  style={{border:"none",outline:"none",fontSize:9,fontFamily:"Arial,sans-serif"}} />
              </td>
              <td style={cs({borderLeft:"none"})}>
                <span style={{fontSize:9,fontWeight:700,color:"#2d6a3f"}}>Actividad: </span>
                <input value={actividad} onChange={e=>setActividad(e.target.value)} placeholder="Describir la actividad a realizar..."
                  style={pi({display:"inline",width:"88%",color:"#2d6a3f",fontSize:10})} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── MAIN TABLE ── */}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={hs({fontSize:9,width:"11%"})} rowSpan="2">Secuencia de Actividades</th>
              <th style={hs({fontSize:9,width:"9%"})}  rowSpan="2">¿Qué técnicas / herramientas / equipos Usará?</th>
              <th style={hs({fontSize:9,width:"10%"})} rowSpan="2">Descripción del riesgo</th>
              <th style={hs({background:"#f5b8b8",fontSize:9})} colSpan="4">Evaluación de riesgos SIN medidas de mitigación</th>
              <th style={hs({fontSize:9,width:"11%"})} rowSpan="2">Medidas de mitigación, las cuales <em>deberán ser implementadas</em> para disminuir el riesgo significativamente</th>
              <th style={hs({background:"#b8e8c0",fontSize:9})} colSpan="4">Evaluación de riesgos CON medidas de mitigación</th>
              <th style={hs({fontSize:9,width:"10%"})} rowSpan="2">Permiso de trabajo requerido</th>
              <th style={hs({width:20,padding:1})}     rowSpan="2">
                <button onClick={()=>setRows(rs=>[...rs,mkRow()])} title="Agregar fila"
                  style={{background:"none",border:"none",cursor:"pointer",color:"#333",fontSize:18,fontWeight:700,padding:0,lineHeight:1}}>+</button>
              </th>
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
            <tr>
              <td colSpan="14" style={{...cs(),textAlign:"center",fontWeight:700,fontSize:11,background:"#d8d8d8",padding:"5px 4px",letterSpacing:"0.3px"}}>
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
                  <button onClick={naAll}
                    style={{background:"#2d6a3f",color:"#fff",border:"none",borderRadius:2,padding:"2px 6px",cursor:"pointer",fontSize:8,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>
                    N/A Todos
                  </button>
                </div>
              </th>
              <th style={hs({fontSize:10})}>Acciones de mitigación</th>
            </tr>
          </thead>
          <tbody>
            {ENV_LIST.map(env=>{
              const s=envSt[env.id];
              return (
                <tr key={env.id}>
                  <td style={cs({fontSize:10})}>{env.a}</td>
                  <td style={cs({fontSize:9})}>{env.i}</td>
                  <td style={cs({textAlign:"center"})}>
                    <div style={{display:"flex",justifyContent:"center",gap:18}}>
                      <label style={{display:"flex",alignItems:"center",gap:3,fontSize:10,cursor:"pointer"}}>
                        <input type="radio" name={`env-${env.id}`} value="si" checked={s.ap==="si"} onChange={()=>setEnv(env.id,"ap","si")} style={{accentColor:"#dc2626"}}/> X
                      </label>
                      <label style={{display:"flex",alignItems:"center",gap:3,fontSize:10,cursor:"pointer",fontWeight:s.ap==="no"?700:400}}>
                        <input type="radio" name={`env-${env.id}`} value="no" checked={s.ap==="no"} onChange={()=>setEnv(env.id,"ap","no")} style={{accentColor:"#16a34a"}}/> N/A
                      </label>
                    </div>
                  </td>
                  <td style={cs()}>
                    {s.ap==="si"
                      ? <input value={s.mit} onChange={ev=>setEnv(env.id,"mit",ev.target.value)} placeholder="Describir acción de mitigación..." style={pi({fontSize:10})} />
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
              <th style={hs({width:65,fontSize:9})}>
                <button onClick={()=>setChems(cs=>[...cs,mkChem()])}
                  style={{background:"none",border:"1px dashed #555",borderRadius:2,padding:"1px 6px",cursor:"pointer",fontSize:8,display:"inline-flex",alignItems:"center",gap:2,fontWeight:700}}>
                  <Plus size={8}/> Agregar
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {chems.map(c=>(
              <tr key={c.id}>
                <td style={cs()}><input value={c.nombre}    onChange={e=>setChem(c.id,"nombre",   e.target.value)} placeholder="N/A" style={pi({fontSize:10})} /></td>
                <td style={cs()}><input value={c.actividad} onChange={e=>setChem(c.id,"actividad",e.target.value)} placeholder="N/A" style={pi({fontSize:10})} /></td>
                <td style={cs()}><input value={c.conc}      onChange={e=>setChem(c.id,"conc",     e.target.value)} placeholder="N/A" style={pi({fontSize:10})} /></td>
                <td style={cs({textAlign:"center"})}>
                  {chems.length>1&&<button onClick={()=>setChems(cx=>cx.filter(x=>x.id!==c.id))}
                    style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:16,fontWeight:700,lineHeight:1}}>×</button>}
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
                  {[{l:"R>400",bg:"#dc2626",d:"Muy Alto"},{l:"200-400",bg:"#ea580c",d:"Alto"},{l:"70-199",bg:"#ca8a04",d:"Considerable"},{l:"20-69",bg:"#2563eb",d:"Posible"},{l:"<20",bg:"#16a34a",d:"Bajo"}]
                    .map(r=><span key={r.l} style={{background:r.bg,color:"#fff",padding:"1px 6px",borderRadius:2,fontSize:8,fontWeight:700,whiteSpace:"nowrap"}}>{r.l} → {r.d}</span>)}
                </div>
              </td>
            </tr>
            <tr>
              <th style={hs({fontSize:9,width:"25%"})}>P — Probabilidad</th>
              <th style={hs({fontSize:9,width:"25%"})}>F — Frecuencia</th>
              <th style={hs({fontSize:9,width:"25%"})}>I — Impacto</th>
              <td style={cs({background:"#fafafa",fontSize:9,color:"#888",fontStyle:"italic"})}>
                Los valores de P, F, I se seleccionan en la tabla principal.<br/>
                Pase el cursor sobre cada opción del selector para ver su descripción.
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
              {["NOMBRE Y FIRMA CONTRATISTA","NOMBRE Y FIRMA RESPONSABLE DEL TRABAJO AB-INBEV","NOMBRE Y FIRMA SUPERVISOR SAFETY"].map((label,i)=>(
                <td key={i} style={cs({width:"33.33%",height:76,verticalAlign:"bottom",textAlign:"center"})}>
                  <div style={{height:48,borderBottom:"1px solid #555",marginBottom:4}}></div>
                  <div style={{fontSize:9,fontWeight:700,marginBottom:4,letterSpacing:"0.4px"}}>{label}</div>
                  <input placeholder="Nombre completo / Cargo / Fecha"
                    style={{width:"95%",border:"none",borderBottom:"1px dotted #bbb",outline:"none",fontSize:9,textAlign:"center",fontFamily:"Arial,sans-serif",background:"transparent"}} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* ── FOOTER ── */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:5,borderTop:"1px solid #ccc",fontSize:8,color:"#999"}}>
          <span>Confidential - proprietary information AB InBev</span>
          <span>© AB InBev 31-05-08 All rights reserved</span>
        </div>

      </div>  {/* end #msra-doc */}
    </div>
  );
}
