import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { ONEPLUS_LOGO, SAP_LOGO } from "./logos.js";

const injectFonts = () => {
  if (document.getElementById("sap-fonts")) return;
  const l = document.createElement("link");
  l.id = "sap-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&family=Barlow:wght@700;800&display=swap";
  document.head.appendChild(l);
};

const SAPB1 = ({ children, size }) => (
  <span style={{ fontFamily:"'Barlow', 'Raleway', sans-serif", fontWeight:800, fontSize:size, letterSpacing:"-0.01em" }}>{children}</span>
);

const MODULES = [
  { id:"compras", name:"Compras", emoji:"📦", color:"#3B82F6", optional:false,
    intro:"El módulo de compras permite controlar desde la solicitud hasta el pago al proveedor. Aquí evaluamos si realmente estás aprovechando todo su potencial.",
    questions:[
      {id:"c1",text:"¿Qué tanto usan el módulo de compras para registrar las órdenes a proveedores?",options:["No lo usamos","Lo usamos, pero sin seguimiento ni aprobaciones","Lo usamos con procesos definidos y trazabilidad"]},
      {id:"c2",text:"¿Tienen listas de precios y condiciones por proveedor cargadas en el sistema?",options:["No","Solo en algunos casos","Sí"]},
      {id:"c3",text:"¿Utilizan solicitudes de compra previas a la orden de compra (requisiciones)?",options:["No las usamos","Solo en casos específicos","Sí, de forma sistemática"]},
      {id:"c4",text:"¿Utilizan Ofertas de Compra en SAP B1 para comparar propuestas entre varios proveedores?",options:["No","Solo en casos puntuales","Sí, comparamos con regularidad las ofertas de proveedores"]},
      {id:"c5",text:"¿Han definido políticas o reglas de aprobación en SAP B1 para compras?",options:["No","Algunas reglas básicas","Sí, reglas bien estructuradas y activas"]},
      {id:"c6",text:"¿Llevan trazabilidad de sus Órdenes de Compra desde su creación hasta su pago?",options:["No lo controlamos","Parcialmente","Sí, tenemos trazabilidad completa"]},
      {id:"c7",text:"¿El stock solicitado se compara con las necesidades reales del inventario o producción?",options:["No","A veces","Sí, siempre usamos análisis antes de comprar"]},
      {id:"c8",text:"¿Qué tan confiable sienten que es la información de compras que obtienen desde SAP?",options:["Poco confiable","Regular","Muy confiable"]}
    ]
  },
  { id:"ventas", name:"Ventas", emoji:"💼", color:"#8B5CF6", optional:false,
    intro:"El ciclo de ventas es más que emitir una factura: empieza con la oportunidad y termina con el cobro. ¿Tu equipo lo está usando de forma estratégica?",
    questions:[
      {id:"v1",text:"¿Utilizan pedidos de cliente registrados en SAP B1 como base para las entregas?",options:["No usamos pedidos","Solo en algunos casos","Siempre usamos pedidos como base para las entregas"]},
      {id:"v2",text:"¿Tienen precios definidos por lista y descuentos por cliente o grupo de clientes?",options:["No","Solo algunos precios o descuentos están definidos","Sí, trabajamos con listas y condiciones comerciales por cliente o grupo"]},
      {id:"v3",text:"¿Llevan trazabilidad desde el pedido hasta la factura en SAP B1?",options:["No","Parcialmente","Sí, trabajamos todo el ciclo desde pedido hasta factura"]},
      {id:"v4",text:"¿Tienen reglas de aprobación configuradas para descuentos, precios o condiciones especiales?",options:["No","Algunas reglas básicas","Sí, tenemos reglas definidas y activas"]},
      {id:"v5",text:"¿Registran oportunidades de venta y las gestionan mediante el CRM de SAP B1?",options:["No usamos el CRM de B1","Lo usamos ocasionalmente","Sí, registramos y hacemos seguimiento de oportunidades"]},
      {id:"v6",text:"¿Usan reportes de ventas por cliente, producto o grupo con análisis periódico?",options:["No","A veces","Sí, usamos informes periódicos para analizar ventas"]},
      {id:"v7",text:"¿El equipo comercial recibió formación suficiente para gestionar sus operaciones en SAP B1?",options:["No","Parcialmente","Sí, están capacitados y lo usan adecuadamente"]}
    ]
  },
  { id:"inventario", name:"Inventario", emoji:"🏭", color:"#10B981", optional:true,
    intro:"La gestión de inventario es clave para la eficiencia operativa y la salud financiera. Un inventario actualizado permite tomar mejores decisiones y evitar pérdidas.",
    questions:[
      {id:"i1",text:"¿Cuentan con procesos claros para movimientos de ajustes (entradas, salidas, transferencias)?",options:["No","Parcialmente","Sí, están definidos y el equipo los aplica"]},
      {id:"i2",text:"¿Están configurados correctamente los almacenes con ubicaciones y políticas de stock mín./máx.?",options:["No","Parcialmente","Sí, están bien definidos y activos en SAP"]},
      {id:"i3",text:"¿Utilizan números de lote o serie para productos sensibles o trazables?",options:["No","Parcialmente","Sí, usamos lotes y/o series según el tipo de ítem"]},
      {id:"i4",text:"¿Tienen definidas unidades de medida por ítem y conversiones aplicables?",options:["No","Parcialmente","Sí, las unidades y conversiones están bien configuradas"]},
      {id:"i5",text:"¿Utilizan los reportes estándar del sistema (stock en almacén, auditoría de stock, series/lotes)?",options:["No","Parcialmente","Sí, los usamos de forma periódica"]},
      {id:"i6",text:"¿Realizan inventarios físicos directamente desde SAP B1?",options:["No","Solo usan SAP para ajustar diferencias","Sí, usamos conteos físicos y ajustes desde SAP B1"]},
      {id:"i7",text:"¿Las cuentas contables de inventario están configuradas para evitar contabilizaciones manuales?",options:["No, se permiten contabilizaciones manuales","Solo algunas están bloqueadas","Sí, todas las cuentas están correctamente configuradas y bloqueadas"]}
    ]
  },
  { id:"data_maestra", name:"Data Maestra", emoji:"🗂️", color:"#F59E0B", optional:false,
    intro:"Los datos maestros son la base del buen funcionamiento del sistema. Si esta base es sólida, todo lo demás se construye con confianza.",
    questions:[
      {id:"dm1",text:"¿Tienen codificación estandarizada para artículos y socios de negocios?",options:["No","Solo en algunos casos","Sí, tenemos una codificación clara y uniforme"]},
      {id:"dm2",text:"¿Utilizan campos definidos por el usuario (UDF) para enriquecer los registros maestros?",options:["No","Solo algunos campos","Sí, usamos campos UDF para agregar información clave"]},
      {id:"dm3",text:"¿Validan información mínima necesaria para la creación de un nuevo socio de negocio?",options:["No","Parcialmente","Sí, tenemos validaciones y controles internos"]},
      {id:"dm4",text:"¿Tienen definidos grupos de artículos y almacenes correctamente?",options:["No","Parcialmente","Sí, están bien configurados y alineados a la contabilidad"]},
      {id:"dm5",text:"¿Utilizan alguna clasificación por tipo de producto o socio de negocio?",options:["No","Parcialmente","Sí, usamos clasificaciones en toda nuestra Data Maestra"]},
      {id:"dm6",text:"¿Cuentan con procesos de limpieza o depuración de datos obsoletos?",options:["No","Ocasionalmente","Sí, hacemos depuraciones periódicas"]}
    ]
  },
  { id:"finanzas", name:"Finanzas", emoji:"📊", color:"#EF4444", optional:false,
    intro:"El módulo financiero no solo debe reflejar lo que ocurre en el negocio, debe anticiparlo. Un buen uso permite mirar el pasado, el presente y proyectar el futuro con claridad.",
    questions:[
      {id:"f1",text:"¿Tienen conciliaciones bancarias actualizadas y realizadas directamente en el sistema?",options:["No","En algunos casos","Sí, hacemos conciliaciones regularmente en SAP"]},
      {id:"f2",text:"¿Utilizan el módulo de gestión de presupuestos en SAP B1?",options:["No","Solo para algunas cuentas","Sí, gestionamos y controlamos el presupuesto en SAP B1"]},
      {id:"f3",text:"¿Utilizan de forma efectiva los reportes financieros estándar (Balance General, Estado de Resultados, Libros Legales)?",options:["No los usamos regularmente","Solo algunos reportes básicos","Sí, los usamos y generamos desde SAP B1 correctamente"]},
      {id:"f4",text:"¿Tienen reglas claras de contabilización y plan de cuentas adaptado a su negocio?",options:["No","En parte, aún hay cuentas genéricas","Sí, el plan de cuentas está ajustado a la realidad del negocio"]},
      {id:"f5",text:"¿Utilizan reportes comparativos vs presupuesto o análisis financiero desde SAP B1?",options:["No","A veces, con apoyo externo","Sí, generamos reportes comparativos de forma regular"]},
      {id:"f6",text:"¿Tienen centros de costo definidos y asignados a sus operaciones financieras?",options:["No","Solo algunas transacciones los tienen asignados","Sí, usamos centros de costo de forma sistémica"]},
      {id:"f7",text:"¿Conocen y aplican correctamente las cuentas asociadas en las operaciones contables?",options:["No","A veces cometemos errores","Sí, están bien definidas y el equipo las aplica correctamente"]}
    ]
  },
  { id:"bancos", name:"Gestión de Bancos", emoji:"🏦", color:"#06B6D4", optional:false,
    intro:"La gestión de bancos de SAP B1 no solo permite registrar pagos, sino administrar con eficiencia la liquidez y el flujo financiero de la empresa.",
    questions:[
      {id:"b1",text:"¿Tienen definidos los bancos con sus cuentas contables asociadas en SAP B1?",options:["No","Solo algunas cuentas bancarias están definidas","Sí, todos los bancos están correctamente configurados"]},
      {id:"b2",text:"¿Utilizan la funcionalidad de pagos efectuados y recibidos del sistema?",options:["No","Solo en algunas transacciones","Sí, usamos la funcionalidad del sistema para el registro de pagos"]},
      {id:"b3",text:"¿Utilizan el asistente de pagos masivos desde SAP B1?",options:["No","Lo hemos usado en algunos casos","Sí, lo usamos regularmente para pagos múltiples"]},
      {id:"b4",text:"¿Utilizan la funcionalidad de reconciliación externa con extractos bancarios?",options:["No","Solo usamos reconciliaciones internas","Sí, usamos la conciliación externa con extractos bancarios"]},
      {id:"b5",text:"¿Controlan cheques emitidos y/o cobrados mediante el sistema?",options:["No","Solo los emitidos","Sí, controlamos emisión, cobro y estado de los cheques"]},
      {id:"b6",text:"¿Utilizan reportes financieros vinculados a la gestión de bancos (saldos, vencimientos, flujo de caja)?",options:["No","Solo algunos reportes básicos","Sí, usamos reportes para gestión de saldos, vencimientos y flujo de caja"]}
    ]
  },
  { id:"produccion", name:"Producción", emoji:"⚙️", color:"#EC4899", optional:true,
    intro:"Cuando la producción se gestiona desde SAP B1, cada insumo cuenta, cada minuto importa y cada orden habla.",
    questions:[
      {id:"p1",text:"¿Tienen definidas listas de materiales (BOM) para sus productos fabricados?",options:["No","Solo para algunos productos","Sí, todas las listas están definidas y actualizadas"]},
      {id:"p2",text:"¿Usan órdenes de fabricación dentro del módulo de producción de SAP B1?",options:["No","Solo para procesos puntuales","Sí, las usamos en toda la operación productiva"]},
      {id:"p3",text:"¿Controlan el consumo de materias primas mediante el sistema?",options:["No","Parcialmente","Sí, registramos consumos por orden/producto"]},
      {id:"p4",text:"¿Generan reportes de costos de producción, desperdicio u órdenes abiertas?",options:["No","Solo algunos reportes básicos","Sí, generamos reportes periódicos de producción"]},
      {id:"p5",text:"¿Registran tiempos de producción o recursos empleados por etapa/producto?",options:["No","Solo algunos tiempos manuales","Sí, registramos tiempos y recursos por operación"]},
      {id:"p6",text:"¿Realizan el cierre de las órdenes de fabricación en la fecha de finalización prevista?",options:["No","Solo algunas veces","Sí, realizamos el cierre según la fecha de finalización prevista"]}
    ]
  },
  { id:"servicio", name:"Servicio", emoji:"🎯", color:"#A78BFA", optional:true,
    intro:"El módulo de servicios conecta tu empresa con los clientes más allá de la venta. Permite gestionar contratos, solicitudes y tareas de servicio de forma ágil y documentada.",
    questions:[
      {id:"s1",text:"¿Registran las llamadas o solicitudes de servicio de sus clientes en SAP B1?",options:["No","En algunos casos","Sí, registramos las solicitudes de nuestros clientes"]},
      {id:"s2",text:"¿Se asignan las solicitudes de servicio a los responsables según disponibilidad o especialidad?",options:["No","Parcialmente","Sí"]},
      {id:"s3",text:"¿Mantienen actualizados los contratos de servicio, artículos y números de serie en SAP B1?",options:["No","Solo en algunos casos","Sí"]},
      {id:"s4",text:"¿Planifican y monitorean actividades de servicio (visitas técnicas, tareas recurrentes) desde SAP B1?",options:["No","Solo en algunos casos","Sí, trabajamos activamente en el módulo de servicio"]},
      {id:"s5",text:"¿Registran soluciones a problemas frecuentes para consultarlas y reducir tiempos de resolución?",options:["No las registramos","Solo algunos casos documentados","Sí, registramos todas las soluciones ofrecidas"]},
      {id:"s6",text:"¿Generan reportes sobre el desempeño del área de servicios (tiempos de respuesta, SLA)?",options:["No generamos reportes de servicio","Parcialmente","Sí, generamos reportes de servicio"]}
    ]
  }
];

function calcScores(answers) {
  const r = {};
  for (const m of MODULES) {
    const a = answers[m.id];
    if (!a || a === "skipped") { r[m.id] = null; continue; }
    let total = 0;
    const max = m.questions.length * 2;
    for (const q of m.questions) total += (a[q.id] ?? 0);
    const pct = Math.round((total / max) * 100);
    r[m.id] = { total, max, pct,
      status: pct >= 70 ? "verde" : pct >= 40 ? "amarillo" : "rojo",
      label: pct >= 70 ? "Óptimo" : pct >= 40 ? "En desarrollo" : "Crítico"
    };
  }
  return r;
}

const CLR = { verde:"#22C55E", amarillo:"#EAB308", rojo:"#EF4444" };
const CLR_BG = { verde:"rgba(34,197,94,0.12)", amarillo:"rgba(234,179,8,0.12)", rojo:"rgba(239,68,68,0.12)" };
const CLR_RGB = { verde:[34,197,94], amarillo:[234,179,8], rojo:[239,68,68] };
const FF = "'Raleway', sans-serif";

function generatePDF(company, scores, aiRecs) {
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210, PL = 18, PR = 18, CW = W - PL - PR;
  const fecha = new Date().toLocaleDateString("es-CL", { year:"numeric", month:"long", day:"numeric" });
  const evaluated = MODULES.filter(m => scores[m.id]);
  const overallPct = evaluated.length
    ? Math.round(evaluated.reduce((a,m) => a + scores[m.id].pct, 0) / evaluated.length) : 0;
  const overallStatus = overallPct >= 70 ? "verde" : overallPct >= 40 ? "amarillo" : "rojo";
  const [sr,sg,sb] = CLR_RGB[overallStatus];

  // Header
  doc.setFillColor(6,13,26);
  doc.rect(0,0,W,42,"F");
  doc.addImage(SAP_LOGO,"JPEG",PL,9,48,14);
  doc.addImage(ONEPLUS_LOGO,"PNG",W-PL-22,7,22,22);
  doc.setFont("helvetica","bold");
  doc.setFontSize(17);
  doc.setTextColor(241,245,249);
  doc.text("Diagnóstico SAP Business One",PL,54);
  doc.setFontSize(9);
  doc.setFont("helvetica","normal");
  doc.setTextColor(100,116,139);
  doc.text((company ? "Empresa: " + company + "   |   " : "") + "Fecha: " + fecha, PL, 62);

  // Score general
  let y = 72;
  doc.setFillColor(13,25,41);
  doc.roundedRect(PL,y,CW,26,3,3,"F");
  doc.setFont("helvetica","bold");
  doc.setFontSize(26);
  doc.setTextColor(sr,sg,sb);
  doc.text(overallPct + "%", PL+8, y+17);
  doc.setFontSize(12);
  doc.setTextColor(241,245,249);
  const statusLabel = overallStatus==="verde"?"ÓPTIMO":overallStatus==="amarillo"?"EN DESARROLLO":"CRÍTICO";
  doc.text("Score General — " + statusLabel, PL+30, y+11);
  if (aiRecs?.resumen) {
    doc.setFont("helvetica","normal");
    doc.setFontSize(8.5);
    doc.setTextColor(148,163,184);
    const lines = doc.splitTextToSize(aiRecs.resumen, CW-34);
    doc.text(lines, PL+30, y+18);
  }

  // Módulos
  y += 34;
  doc.setFont("helvetica","bold");
  doc.setFontSize(10);
  doc.setTextColor(241,245,249);
  doc.text("Resultados por Módulo", PL, y);
  y += 6;
  const bw = (CW-5)/2, bh = 17;
  let col = 0;
  for (const m of MODULES) {
    const sc = scores[m.id];
    if (!sc) continue;
    const x = PL + col*(bw+5);
    doc.setFillColor(13,25,41);
    doc.roundedRect(x,y,bw,bh,2,2,"F");
    const [mr,mg,mb] = CLR_RGB[sc.status];
    doc.setFillColor(mr,mg,mb);
    doc.rect(x,y,2,bh,"F");
    doc.setFont("helvetica","normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148,163,184);
    doc.text(m.name, x+6, y+7);
    doc.setFont("helvetica","bold");
    doc.setFontSize(12);
    doc.setTextColor(mr,mg,mb);
    doc.text(sc.pct + "%", x+6, y+14);
    doc.setFontSize(6.5);
    doc.setTextColor(mr,mg,mb);
    doc.text(sc.label, x+bw-doc.getTextWidth(sc.label)-3, y+14);
    col++;
    if (col >= 2) { col = 0; y += bh+3; }
  }
  if (col > 0) y += bh+3;

  // Prioridades
  y += 5;
  if (aiRecs?.prioridades?.length) {
    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.setTextColor(241,245,249);
    doc.text("3 Prioridades con Mayor Impacto", PL, y);
    y += 6;
    for (let i = 0; i < aiRecs.prioridades.length; i++) {
      doc.setFillColor(13,25,41);
      doc.roundedRect(PL,y,CW,13,2,2,"F");
      doc.setFillColor(29,75,159);
      doc.circle(PL+6, y+6.5, 3, "F");
      doc.setFont("helvetica","bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255,255,255);
      doc.text(String(i+1), PL+4.8, y+8);
      doc.setFont("helvetica","normal");
      doc.setFontSize(8.5);
      doc.setTextColor(203,213,225);
      const lines = doc.splitTextToSize(aiRecs.prioridades[i], CW-16);
      doc.text(lines, PL+12, y+7);
      y += 16;
    }
  }

  // Recomendaciones
  if (aiRecs?.recomendaciones) {
    y += 4;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.setTextColor(241,245,249);
    doc.text("Recomendaciones por Módulo", PL, y);
    y += 7;
    for (const m of MODULES) {
      const sc = scores[m.id];
      const recs = aiRecs.recomendaciones[m.id];
      if (!sc || !recs?.length) continue;
      if (y > 250) { doc.addPage(); y = 20; }
      const [mr,mg,mb] = CLR_RGB[sc.status];
      doc.setFont("helvetica","bold");
      doc.setFontSize(9);
      doc.setTextColor(mr,mg,mb);
      doc.text(m.name + " — " + sc.pct + "% (" + sc.label + ")", PL, y);
      y += 5;
      for (const rec of recs) {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFont("helvetica","normal");
        doc.setFontSize(8.5);
        doc.setTextColor(148,163,184);
        doc.text("→", PL, y);
        const lines = doc.splitTextToSize(rec, CW-8);
        doc.text(lines, PL+6, y);
        y += lines.length * 5 + 2;
      }
      y += 4;
    }
  }

  // Pie de página
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(29,75,159);
    doc.rect(0,282,W,15,"F");
    doc.setFont("helvetica","normal");
    doc.setFontSize(7.5);
    doc.setTextColor(255,255,255);
    doc.text("www.oneplussc.com  |  hola@oneplussc.com  |  +56 9 5438 1102", W/2, 290.5, {align:"center"});
    doc.text("Pág. " + i + "/" + pages, W-PL, 290.5, {align:"right"});
  }

  const filename = "Diagnostico_SAP_B1_" + (company ? company.replace(/ /g,"_") + "_" : "") + new Date().toISOString().slice(0,10) + ".pdf";
  doc.save(filename);
}

const S = {
  root: { fontFamily:FF, background:"#060D1A", minHeight:"100vh", color:"#CBD5E1", display:"flex", flexDirection:"column", alignItems:"center" },
  logoBar: { width:"100%", background:"#FFFFFF", padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", boxSizing:"border-box", borderBottom:"3px solid #1D4B9F" },
  footer: { width:"100%", background:"#FFFFFF", padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", boxSizing:"border-box", borderTop:"3px solid #1D4B9F", marginTop:"auto" },
  wrap: { flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 20px", width:"100%", boxSizing:"border-box" },
  card: { background:"#0D1929", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"34px 30px", maxWidth:"620px", width:"100%" },
  h1: { fontFamily:FF, fontSize:"clamp(26px,5vw,38px)", fontWeight:800, color:"#F1F5F9", margin:"0 0 8px", lineHeight:1.1 },
  h2: { fontFamily:FF, fontSize:"19px", fontWeight:700, color:"#F1F5F9", margin:"0 0 12px" },
  label: { fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#475569" },
  muted: { fontSize:"14px", color:"#64748B", lineHeight:1.6, fontFamily:FF },
  body: { fontSize:"15px", lineHeight:1.7, color:"#94A3B8", fontFamily:FF },
  btn: { background:"linear-gradient(135deg,#1D4B9F,#1A3A7A)", color:"#fff", border:"none", borderRadius:"10px", padding:"14px 28px", fontSize:"15px", fontWeight:700, cursor:"pointer", width:"100%", transition:"transform 0.15s,box-shadow 0.15s", fontFamily:FF, letterSpacing:"0.02em" },
  btnPDF: { background:"transparent", color:"#22C55E", border:"1.5px solid #22C55E", borderRadius:"10px", padding:"12px 28px", fontSize:"14px", fontWeight:700, cursor:"pointer", width:"100%", transition:"all 0.15s", fontFamily:FF, marginBottom:"12px" },
  optionBtn: (sel) => ({ display:"block", width:"100%", textAlign:"left", background: sel ? "rgba(29,75,159,0.25)" : "rgba(255,255,255,0.03)", border: sel ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"13px 18px", fontSize:"14px", color: sel ? "#93C5FD" : "#CBD5E1", cursor:"pointer", marginBottom:"10px", fontFamily:FF, transition:"all 0.15s", lineHeight:1.5, fontWeight: sel ? 600 : 400 }),
  progress: { height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden", marginBottom:"26px" },
  input: { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"13px 16px", fontSize:"15px", color:"#F1F5F9", fontFamily:FF, outline:"none", boxSizing:"border-box" }
};

function LogoBar() {
  return (
    <div style={S.logoBar}>
      <img src={SAP_LOGO} alt="SAP Business One" style={{ height:"30px", objectFit:"contain" }} />
      <img src={ONEPLUS_LOGO} alt="Oneplus SC" style={{ height:"38px", objectFit:"contain" }} />
    </div>
  );
}

function Footer() {
  return (
    <div style={S.footer}>
      <img src={SAP_LOGO} alt="SAP Business One" style={{ height:"26px", objectFit:"contain" }} />
      <span style={{ fontSize:"13px", color:"#1D4B9F", fontWeight:700, fontFamily:FF }}>www.oneplussc.com</span>
      <img src={ONEPLUS_LOGO} alt="Oneplus SC" style={{ height:"34px", objectFit:"contain" }} />
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ marginBottom:"22px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
        <span style={S.label}>PROGRESO</span>
        <span style={{ ...S.label, color:"#3B82F6" }}>{pct}%</span>
      </div>
      <div style={S.progress}>
        <div style={{ height:"100%", width:pct+"%", background:"linear-gradient(90deg,#1A3A7A,#1D4B9F,#3B82F6)", borderRadius:"2px", transition:"width 0.4s" }} />
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => { injectFonts(); }, []);

  const [phase, setPhase] = useState("welcome");
  const [modIdx, setModIdx] = useState(0);
  const [qIdx, setQIdx] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [aiRecs, setAiRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [company, setCompany] = useState("");
  const [selected, setSelected] = useState(null);
  const [anim, setAnim] = useState(true);

  const mod = MODULES[modIdx];
  const q = qIdx >= 0 ? mod?.questions[qIdx] : null;
  const totalQs = MODULES.reduce((a,m) => a + m.questions.length, 0);
  const answeredQs = Object.values(answers).filter(v => v !== "skipped").reduce((a,m) => a + Object.keys(m).length, 0);
  const progressPct = Math.round((answeredQs / totalQs) * 100);

  function fade(fn) { setAnim(false); setTimeout(() => { fn(); setSelected(null); setAnim(true); }, 180); }

  function advance(idx, ans) {
    if (idx < MODULES.length - 1) {
      fade(() => { setModIdx(idx + 1); setQIdx(MODULES[idx+1].optional ? -1 : 0); });
    } else { finish(ans); }
  }

  function handleGate(yes) {
    if (!yes) { const na = { ...answers, [mod.id]:"skipped" }; setAnswers(na); advance(modIdx, na); }
    else { fade(() => setQIdx(0)); }
  }

  function handleAnswer(score) {
    const na = { ...answers, [mod.id]: { ...(answers[mod.id] || {}), [q.id]: score } };
    setAnswers(na);
    if (qIdx < mod.questions.length - 1) { fade(() => setQIdx(i => i + 1)); }
    else { advance(modIdx, na); }
  }

  async function sendLead(s, recs) {
    try {
      const scoresSummary = MODULES.filter(m => s[m.id]).map(m => m.name+": "+s[m.id].pct+"% ("+s[m.id].label+")").join(" | ");
      await fetch("https://formspree.io/f/mwvawoqo", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, empresa: company || "(no indicada)", scores: scoresSummary, prioridades_ia: recs?.prioridades?.join("; ") || "" })
      });
    } catch {}
    setLeadSent(true);
  }

  async function finish(finalAns) {
    const s = calcScores(finalAns);
    setScores(s);
    setPhase("results");
    setLoading(true);
    let recs = null;
    try {
      const summary = MODULES.filter(m => s[m.id]).map(m => m.name+": "+s[m.id].pct+"% ("+s[m.id].label+")").join("\n");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:"Eres consultor SAP Business One senior. Cliente completó diagnóstico:\n\n"+summary+"\n\nResponde SOLO con JSON válido sin markdown:\n{\"resumen\":\"2 oraciones ejecutivas\",\"prioridades\":[\"p1\",\"p2\",\"p3\"],\"recomendaciones\":{\"ID_MODULO\":[\"rec1\",\"rec2\"]}}\n\nIDs: compras, ventas, inventario, data_maestra, finanzas, bancos, produccion, servicio. Solo módulos evaluados. Máx 2 recs por módulo. Español profesional y directo." }]
        })
      });
      const data = await resp.json();
      recs = JSON.parse((data.content?.[0]?.text || "{}").replace(/```json|```/g,"").trim());
    } catch {
      recs = { resumen:"El diagnóstico fue completado exitosamente. Los resultados muestran oportunidades concretas de mejora en tu sistema.", prioridades:["Priorizar módulos con estado Crítico para acción inmediata","Establecer procesos formales en áreas sin trazabilidad","Planificar capacitación en reportes y análisis desde SAP"], recomendaciones:{} };
    }
    setAiRecs(recs);
    setLoading(false);
  }

  function handleEmailSubmit() {
    if (!email.includes("@")) return;
    setEmailDone(true);
    if (!leadSent) sendLead(scores, aiRecs);
  }

  const cardStyle = { ...S.card, opacity:anim?1:0, transform:anim?"translateY(0)":"translateY(8px)", transition:"opacity 0.18s, transform 0.18s" };

  if (phase === "welcome") return (
    <div style={S.root}>
      <LogoBar />
      <div style={S.wrap}>
        <div style={cardStyle}>
          <div style={{ marginBottom:"8px" }}><span style={S.label}>DIAGNÓSTICO EXPRÉS · ONEPLUS SC</span></div>
          <h1 style={S.h1}>Diagnóstico<br/><SAPB1 size="clamp(26px,5vw,38px)">SAP B1</SAPB1></h1>
          <p style={{ ...S.body, marginBottom:"26px" }}>Evalúa el nivel de aprovechamiento de tu sistema en <strong style={{color:"#93C5FD",fontWeight:700}}>8 módulos clave</strong>. En pocos minutos obtendrás un score por módulo y recomendaciones generadas por IA.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"26px" }}>
            {[["⏱","10–15 minutos"],["📋","53 preguntas"],["🤖","IA analiza tus respuestas"],["📄","Reporte PDF instantáneo"]].map(([e,t]) => (
              <div key={t} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{fontSize:"16px"}}>{e}</span>
                <span style={{fontSize:"13px",color:"#64748B",fontFamily:FF}}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:"18px" }}>
            <div style={{ ...S.label, marginBottom:"6px" }}>Nombre de tu empresa (opcional)</div>
            <input style={S.input} placeholder="Ej: Grupo Industrial S.A." value={company} onChange={ev => setCompany(ev.target.value)} />
          </div>
          <button style={S.btn}
            onMouseEnter={ev => { ev.currentTarget.style.transform="translateY(-1px)"; ev.currentTarget.style.boxShadow="0 8px 24px rgba(29,75,159,0.5)"; }}
            onMouseLeave={ev => { ev.currentTarget.style.transform=""; ev.currentTarget.style.boxShadow=""; }}
            onClick={() => { setPhase("quiz"); setModIdx(0); setQIdx(MODULES[0].optional?-1:0); }}>
            Comenzar diagnóstico →
          </button>
          <p style={{ ...S.muted, textAlign:"center", marginTop:"14px", fontSize:"13px" }}>Ideal para gerencias, encargados de sistemas y usuarios clave de <SAPB1>SAP B1</SAPB1></p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (phase === "quiz" && mod.optional && qIdx === -1) return (
    <div style={S.root}>
      <LogoBar />
      <div style={S.wrap}>
        <div style={cardStyle}>
          <ProgressBar pct={progressPct} />
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px" }}>
            <span style={{fontSize:"22px"}}>{mod.emoji}</span>
            <div>
              <div style={S.label}>MÓDULO {modIdx+1} DE {MODULES.length}</div>
              <div style={{...S.h2,margin:0}}>{mod.name}</div>
            </div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"14px 16px", marginBottom:"22px" }}>
            <p style={{...S.body,margin:0,fontSize:"14px"}}>{mod.intro}</p>
          </div>
          <p style={{...S.h2,fontSize:"16px",marginBottom:"18px"}}>¿Tu empresa utiliza el módulo de <span style={{color:mod.color,fontWeight:800}}>{mod.name}</span>?</p>
          <button style={{ ...S.optionBtn(false), marginBottom:"10px" }} onClick={() => handleGate(true)}>✅ Sí, lo utilizamos</button>
          <button style={S.optionBtn(false)} onClick={() => handleGate(false)}>⏭ No aplica — pasar al siguiente módulo</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (phase === "quiz") return (
    <div style={S.root}>
      <LogoBar />
      <div style={S.wrap}>
        <div style={cardStyle}>
          <ProgressBar pct={progressPct} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{fontSize:"18px"}}>{mod.emoji}</span>
              <span style={{ background:`${mod.color}20`, color:mod.color, borderRadius:"20px", padding:"4px 12px", fontSize:"12px", fontWeight:700, border:`1px solid ${mod.color}40` }}>{mod.name}</span>
            </div>
            <span style={{ ...S.muted, fontSize:"13px" }}>{qIdx+1} / {mod.questions.length}</span>
          </div>
          <p style={{ fontSize:"16px", fontWeight:600, color:"#E2E8F0", lineHeight:1.55, marginBottom:"22px", fontFamily:FF }}>{q.text}</p>
          {q.options.map((opt, i) => (
            <button key={i} style={S.optionBtn(selected===i)}
              onMouseEnter={ev => { if(selected!==i) ev.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
              onMouseLeave={ev => { if(selected!==i) ev.currentTarget.style.background="rgba(255,255,255,0.03)"; }}
              onClick={() => { setSelected(i); setTimeout(() => handleAnswer(i), 300); }}>
              <span style={{ display:"inline-block", width:"17px", height:"17px", borderRadius:"50%", border:selected===i?"none":"1px solid rgba(255,255,255,0.2)", background:selected===i?"#1D4B9F":"transparent", marginRight:"12px", verticalAlign:"middle", flexShrink:0, transition:"all 0.15s" }} />
              {opt}
            </button>
          ))}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"10px" }}>
            {MODULES.map((m,i) => (
              <div key={m.id} style={{ width:"26px", height:"3px", borderRadius:"2px", background:i<modIdx?"#1D4B9F":i===modIdx?m.color:"rgba(255,255,255,0.08)", transition:"background 0.3s" }} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (phase === "results") {
    const evaluated = MODULES.filter(m => scores[m.id]);
    const overallPct = evaluated.length ? Math.round(evaluated.reduce((a,m) => a+scores[m.id].pct,0)/evaluated.length) : 0;
    const overallStatus = overallPct>=70?"verde":overallPct>=40?"amarillo":"rojo";
    return (
      <div style={{ ...S.root, alignItems:"flex-start" }}>
        <LogoBar />
        <div style={{ flex:1, padding:"24px 20px", width:"100%", boxSizing:"border-box" }}>
          <div style={{ maxWidth:"620px", margin:"0 auto" }}>

            <div style={{ ...S.card, marginBottom:"12px" }}>
              <div style={S.label}>DIAGNÓSTICO COMPLETADO{company?" · "+company.toUpperCase():""}</div>
              <h1 style={{ ...S.h1, fontSize:"26px", marginTop:"6px" }}>Tu Score <SAPB1 size="26px">SAP B1</SAPB1></h1>
              <div style={{ display:"flex", alignItems:"center", gap:"18px", margin:"18px 0" }}>
                <div style={{ width:"80px", height:"80px", borderRadius:"50%", background:`conic-gradient(${CLR[overallStatus]} ${overallPct*3.6}deg, rgba(255,255,255,0.06) 0)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <div style={{ width:"62px", height:"62px", borderRadius:"50%", background:"#0D1929", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:FF, fontSize:"19px", fontWeight:900, color:CLR[overallStatus] }}>{overallPct}%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily:FF, fontSize:"17px", fontWeight:800, color:"#F1F5F9", marginBottom:"5px" }}>
                    {overallStatus==="verde"?"¡Excelente aprovechamiento!":overallStatus==="amarillo"?"Potencial de mejora detectado":"Oportunidades críticas identificadas"}
                  </div>
                  {loading ? <div style={S.muted}>Generando recomendaciones con IA...</div>
                    : aiRecs && <p style={{ ...S.body, fontSize:"14px", margin:0 }}>{aiRecs.resumen}</p>}
                </div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px" }}>
              {MODULES.map(m => {
                const sc = scores[m.id];
                if (!sc) return (
                  <div key={m.id} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:"12px", padding:"13px 15px", opacity:0.35 }}>
                    <span style={{fontSize:"15px"}}>{m.emoji}</span>
                    <div style={{ fontSize:"12px", color:"#475569", marginTop:"3px", fontFamily:FF }}>{m.name}</div>
                    <div style={{ fontSize:"11px", color:"#334155", fontFamily:FF }}>No aplica</div>
                  </div>
                );
                return (
                  <div key={m.id} style={{ background:"#0D1929", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"13px 15px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                      <div>
                        <span style={{fontSize:"15px"}}>{m.emoji}</span>
                        <div style={{ fontSize:"12px", color:"#94A3B8", marginTop:"2px", fontFamily:FF, fontWeight:500 }}>{m.name}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:FF, fontSize:"19px", fontWeight:900, color:CLR[sc.status] }}>{sc.pct}%</div>
                        <div style={{ fontSize:"10px", color:CLR[sc.status], background:CLR_BG[sc.status], borderRadius:"5px", padding:"2px 7px", fontWeight:700 }}>{sc.label}</div>
                      </div>
                    </div>
                    <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:sc.pct+"%", background:`linear-gradient(90deg,${CLR[sc.status]}99,${CLR[sc.status]})`, borderRadius:"2px", transition:"width 1s" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {loading && (
              <div style={{ ...S.card, textAlign:"center", marginBottom:"12px" }}>
                <div style={{fontSize:"26px",marginBottom:"8px"}}>🤖</div>
                <div style={{ fontFamily:FF, fontSize:"16px", fontWeight:700, color:"#F1F5F9", marginBottom:"5px" }}>Analizando tus respuestas...</div>
                <div style={S.muted}>La IA está generando recomendaciones personalizadas</div>
                <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginTop:"12px" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#1D4B9F", animation:`pulse 1.2s ${i*0.4}s infinite` }} />)}
                </div>
              </div>
            )}

            {aiRecs && !loading && (
              <>
                <div style={{ ...S.card, marginBottom:"12px" }}>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center", marginBottom:"14px" }}>
                    <div style={{ background:"rgba(29,75,159,0.3)", borderRadius:"8px", width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>⚡</div>
                    <h2 style={{...S.h2,margin:0,fontSize:"16px"}}>3 Prioridades con Mayor Impacto</h2>
                  </div>
                  {(aiRecs.prioridades||[]).map((p,i) => (
                    <div key={i} style={{ display:"flex", gap:"12px", padding:"10px 0", borderBottom:i<2?"1px solid rgba(255,255,255,0.05)":"none" }}>
                      <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"rgba(29,75,159,0.25)", border:"1px solid #1D4B9F60", color:"#60A5FA", fontSize:"11px", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:FF }}>{i+1}</div>
                      <p style={{ margin:0, fontSize:"14px", color:"#CBD5E1", lineHeight:1.6, fontFamily:FF }}>{p}</p>
                    </div>
                  ))}
                </div>

                {!emailDone ? (
                  <div style={{ ...S.card, marginBottom:"12px" }}>
                    <div style={{ textAlign:"center", marginBottom:"18px" }}>
                      <div style={{fontSize:"26px",marginBottom:"7px"}}>📑</div>
                      <h2 style={{ ...S.h2, margin:"0 0 7px" }}>Recomendaciones por módulo</h2>
                      <p style={{ ...S.muted, marginBottom:0, fontSize:"14px" }}>Ingresa tu correo para ver el análisis detallado y descargar tu reporte PDF</p>
                    </div>
                    <input style={{ ...S.input, marginBottom:"12px" }} type="email" placeholder="correo@empresa.com" value={email} onChange={ev => setEmail(ev.target.value)} />
                    <button style={S.btn}
                      onMouseEnter={ev => { ev.currentTarget.style.transform="translateY(-1px)"; ev.currentTarget.style.boxShadow="0 8px 24px rgba(29,75,159,0.5)"; }}
                      onMouseLeave={ev => { ev.currentTarget.style.transform=""; ev.currentTarget.style.boxShadow=""; }}
                      onClick={handleEmailSubmit}>
                      Ver recomendaciones y descargar reporte →
                    </button>
                    <p style={{ ...S.muted, textAlign:"center", marginTop:"10px", fontSize:"12px" }}>Sin spam. Solo tu resumen de diagnóstico.</p>
                  </div>
                ) : (
                  <div style={{ marginBottom:"12px" }}>
                    <button style={S.btnPDF}
                      onMouseEnter={ev => { ev.currentTarget.style.background="rgba(34,197,94,0.1)"; }}
                      onMouseLeave={ev => { ev.currentTarget.style.background="transparent"; }}
                      onClick={() => generatePDF(company, scores, aiRecs)}>
                      ⬇ Descargar Reporte PDF
                    </button>
                    {MODULES.filter(m => scores[m.id] && aiRecs.recomendaciones?.[m.id]).map(m => (
                      <div key={m.id} style={{ ...S.card, marginBottom:"10px", borderLeft:`3px solid ${CLR[scores[m.id].status]}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <span style={{fontSize:"16px"}}>{m.emoji}</span>
                            <span style={{ fontFamily:FF, fontSize:"14px", fontWeight:800, color:"#F1F5F9" }}>{m.name}</span>
                          </div>
                          <span style={{ fontSize:"11px", color:CLR[scores[m.id].status], background:CLR_BG[scores[m.id].status], borderRadius:"5px", padding:"2px 9px", fontWeight:700 }}>{scores[m.id].pct}% · {scores[m.id].label}</span>
                        </div>
                        {(aiRecs.recomendaciones[m.id]||[]).map((r,i) => (
                          <div key={i} style={{ display:"flex", gap:"10px", padding:"7px 0", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                            <span style={{ color:"#3B82F6", fontSize:"13px", flexShrink:0, marginTop:"2px" }}>→</span>
                            <p style={{ margin:0, fontSize:"13px", color:"#94A3B8", lineHeight:1.6, fontFamily:FF }}>{r}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ ...S.card, textAlign:"center", background:"linear-gradient(135deg,rgba(29,75,159,0.2),rgba(26,58,122,0.2))", borderColor:"rgba(29,75,159,0.4)", marginBottom:"24px" }}>
                  <div style={{fontSize:"26px",marginBottom:"8px"}}>🚀</div>
                  <h2 style={{ ...S.h2, margin:"0 0 8px" }}>¿Quieres un plan de acción personalizado?</h2>
                  <p style={{ ...S.body, fontSize:"14px", marginBottom:"18px" }}>Nuestro equipo puede acompañarte en la optimización de <SAPB1>SAP B1</SAPB1>, desde la configuración hasta la capacitación de tu equipo.</p>
                  <a href="https://oneplussc.com" target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", background:"linear-gradient(135deg,#1D4B9F,#1A3A7A)", color:"#fff", borderRadius:"10px", padding:"13px 26px", fontSize:"14px", fontWeight:700, textDecoration:"none", fontFamily:FF }}>
                    Hablar con un consultor Oneplus SC →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
        <Footer />
        <style>{"@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }"}</style>
      </div>
    );
  }
}
