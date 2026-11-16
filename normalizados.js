(function(root){
'use strict';
const VERSION='AT_NORMALIZED_1';
const HEADERS=['Contrato','Periodo','Matricula','Nombre','JE','Nombre JE','Provincia','Productividad','Incumplimientos','NPS','APP','Calidad','Dias partida','Dias trabajados','% trabajado','Atraso','Bono','TOTAL A PAGAR','Estado productividad','Lote'];
const DETAILS=[['APP','APP',['Installer']],['Calidad instalación','Calidad instalación',['INSTALLER']],['NPS',null,['INSTALLER_TAG','Instaladas año.INSTALLER_TAG']],['Incumplimientos','INCUMPLIMIENTOS',['INSTALLERTAG']],['Incidencias envío','INCIDENCIAS envio',['INSTALADOR']],['Incidencias normales','INCIDENCIAS normal',['INSTALADOR']]];
const key=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9%€]/g,'');
function fail(message){throw Error(message);}
// Misma normalización de cabeceras que el generador individual: conserva «?».
const jeHeader=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toUpperCase();
function periodMetadata(sheets){
 const a=sheets['INSTALADORES 2']??[], month=a[2]?.[3]?.v,year=a[3]?.[3]?.v;
 return key(a[2]?.[2]?.v)==='mes'&&key(a[3]?.[2]?.v)==='ano'&&Number.isInteger(month)&&month>=1&&month<=12&&Number.isInteger(year)&&year>=2026?`${year}-${String(month).padStart(2,'0')}`:null;
}
function exportClosure({sheets,period,confirmed=false,bundleId=crypto.randomUUID()}){
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period)||Number(period.slice(0,4))<2026)fail('Periodo comercial no válido.');
 const summary=sheets['INSTALADORES 2'];if(!summary)fail('Falta INSTALADORES 2.');
 const report={contract:VERSION,period,bundleId,technicians:0,summaryErrors:0,pendingFields:0,details:[]};
 const value=c=>c?.v??null;
 const raw=(c)=>c?.t==='e'?'AT_ERROR_EXCEL':c?.f&&(c.v===undefined||c.v===null)?'AT_FORMULA_SIN_RESULTADO':value(c);
 const headers=summary[6]??[];
 function column(h,names,optional=false){const hits=h.map((c,i)=>names.some(n=>key(value(c))===key(n))?i:-1).filter(i=>i>=0);if(hits.length>1||(!optional&&!hits.length))fail('Cabecera ausente o ambigua: '+names.join(' / '));return hits[0]??null;}
 const idx={mat:column(headers,['MATRICULA']),name:column(headers,['NOMBRE COMPLETO']),province:column(headers,['PROVINCIA']),prod:column(headers,['Prod'],true)};
 if(idx.prod===null)column(headers,['Prod s/josmil']);
 const fields=['% INCUMP','NPS','APP','CALIDAD INST','dias partida','dias trabajados','% trabajado','ATRASO','BONO','TOTAL A PAGAR'];
 const cols=fields.map(f=>column(headers,[f]));
 const id=c=>{if(c?.t==='e'||(c?.f&&value(c)===null))fail('Identificador sin resultado válido.');const v=value(c);if(typeof v==='string'&&v&&v===v.trim())return v;if(typeof v==='number'&&Number.isInteger(v)&&/^0+$/.test(c.z??''))return String(v).padStart(c.z.length,'0');fail('Identificador ausente o ambiguo: revisar resumen.');};
 function number(c,field,ratio=false,negative=false){if(c?.t==='e'||(c?.f&&(c.v===null||c.v===undefined)))fail('Campo esencial sin resultado válido: '+field);let v=value(c);if(v===null||v==='')return null;if(!['ATRASO','BONO','TOTAL A PAGAR'].includes(field)&&/[€$£]/.test(c?.z??''))fail('Formato monetario incompatible: '+field);if(ratio&&typeof v==='string'&&/^-?\d+(?:[.,]\d+)?%$/.test(v))v=Number(v.slice(0,-1).replace(',','.'))/100;if(typeof v!=='number'||!Number.isFinite(v)||(!ratio&&(c?.z??'').includes('%'))||(ratio&&(/[€$£]/.test(c?.z??'')||v<(negative?-1:0)||v>1)))fail('Escala no válida: '+field);if(field==='Prod'&&v<0)fail('Productividad negativa no válida.');return v;}
 const detected=periodMetadata(sheets);
 if(detected&&detected!==period)fail('El periodo contradice MES/AÑO.');if(!detected&&!confirmed)fail('Confirma expresamente el periodo comercial.');
 report.periodConfirmed=!detected;const people=new Map(),out=[HEADERS.concat(headers.map((c,i)=>`ORIGINAL_${i+1}:${String(value(c)??'')}`))];
 // Para JE se conserva el identificador literal o su representación decimal exacta,
 // como en el modo individual; nunca se rellenan ceros inexistentes.
 const jeId=c=>{if(c?.t!=='e'&&typeof value(c)==='number'&&Number.isSafeInteger(value(c))&&value(c)>=0&&(!c.z||c.z==='General'))return String(value(c));return id(c);};
 const jeNames=new Map(),directory=sheets.JE;
 if(!directory)fail('JE_DIRECTORIO_AUSENTE: falta la pestaña JE.');
 const headerRows=directory.map((r,i)=>r&&r.some(c=>jeHeader(value(c))==='JE')&&r.some(c=>jeHeader(value(c))==='NOMBRE COMPLETO')?i:-1).filter(i=>i>=0);
 if(headerRows.length!==1)fail('JE_DIRECTORIO_AMBIGUO: se requiere una cabecera única JE / NOMBRE COMPLETO.');
 const hr=headerRows[0],dh=directory[hr];
 const exact=(h,label)=>h.map((c,i)=>jeHeader(value(c))===label?i:-1).filter(i=>i>=0);
 const dc=exact(dh,'JE'),dn=exact(dh,'NOMBRE COMPLETO');
 if(dc.length!==1||dn.length!==1)fail('JE_DIRECTORIO_AMBIGUO: columnas repetidas en la pestaña JE.');
 for(const r of directory.slice(hr+1)){
  if(!r||(!value(r[dc[0]])&&!value(r[dn[0]])))continue;
  let je;try{je=jeId(r[dc[0]]);}catch{fail('JE_DIRECTORIO_INVALIDO: identificador de responsable no válido.');}
  const name=value(r[dn[0]]);
  if(r[dn[0]]?.t==='e'||typeof name!=='string'||!name.trim())fail('JE_NOMBRE_AUSENTE: responsable sin nombre válido en la pestaña JE.');
  if(jeNames.has(je)&&jeNames.get(je)!==name)fail('JE_DIRECTORIO_CONFLICTIVO: mismo identificador con nombres distintos.');
  jeNames.set(je,name);
 }
 const records=summary.slice(7).filter(row=>row&&row.some(c=>value(c)!==null||c?.f));
 const candidates=exact(headers,'JE');
 if(!candidates.length)fail('JE_CABECERA_AUSENTE: falta la columna JE; JE? es auxiliar y no identifica responsables.');
 const mappings=candidates.map(col=>({col,values:records.map(row=>{try{const je=jeId(row[col]);return jeNames.has(je)?je:null;}catch{return null;}})}));
 const valid=mappings.filter(m=>m.values.every(v=>v!==null));
 if(!valid.length){const invalid=Math.min(...mappings.map(m=>m.values.filter(v=>v===null).length));fail(`JE_NO_ASOCIABLE: ${invalid} filas del resumen sin responsable exacto en la pestaña JE. No se exporta el cierre.`);}
 if(valid.some(m=>m.values.some((v,i)=>v!==valid[0].values[i])))fail('JE_COLUMNAS_CONFLICTIVAS: varias columnas JE válidas asignan responsables distintos. No se elige la primera.');
 idx.je=valid[0].col;
 report.jeMapping={sourceColumn:idx.je+1,candidates:candidates.length,rule:valid.length>1?'DUPLICADOS_EQUIVALENTES_EN_TODAS_LAS_FILAS':'COLUMNA_UNICA_CON_DIRECTORIO_VALIDO'};
 for(const row of summary.slice(7)){if(!row||!row.some(c=>value(c)!==null||c?.f))continue;
  const mat=id(row[idx.mat]),je=jeId(row[idx.je]);if(people.has(mat))fail('Matrícula duplicada en resumen.');const name=value(row[idx.name]);if(row[idx.name]?.t==='e'||typeof name!=='string'||!name)fail('Falta nombre en resumen.');
  const values=cols.map((c,i)=>number(row[c],fields[i],[0,1,2,3,6].includes(i),i===1));const productivity=idx.prod===null?null:number(row[idx.prod],'Prod');if(idx.prod===null)report.pendingFields++;
  const person={mat,je,name};people.set(mat,person);out.push([VERSION,period,mat,name,je,jeNames.get(je)??null,value(row[idx.province]),productivity,...values.slice(0,4),...values.slice(4),idx.prod===null?'PENDIENTE_PROD_S_JOSMIL':'VALIDADO',bundleId,...headers.map((_,i)=>raw(row[i]))]);
 }
 if(!people.size)fail('Sin técnicos en resumen.');report.technicians=people.size;
 const detailSheets={};
 for(const [target,origin,aliases] of DETAILS){const stats={sheet:target,included:0,outside:0,unidentified:0,unavailable:0,complete:false};report.details.push(stats);
  const source=origin??(['NPS','Instaladas nps'].filter(n=>sheets[n]).length===1?['NPS','Instaladas nps'].find(n=>sheets[n]):null);
  const data=source?sheets[source]:null;if(!data){stats.reason='HOJA_AUSENTE_O_AMBIGUA';detailSheets[target]=[[VERSION,'Periodo','Matricula','JE','Fila origen','Lote']];continue;}
  const h=data[0]??[];let owner;try{owner=column(h,aliases);}catch{stats.reason='CABECERA_MATRICULA';detailSheets[target]=[[VERSION,'Periodo','Matricula','JE','Fila origen','Lote']];continue;}
  const used=h.map((c,i)=>value(c)!==null&&value(c)!==''?i:-1).filter(i=>i>=0);
  const output=[[VERSION,'Periodo','Matricula','JE','Fila origen','Lote',...used.map(i=>String(value(h[i])))]];
  for(let n=1;n<data.length;n++){const row=data[n];if(!row||!used.some(i=>value(row[i])!==null||row[i]?.f))continue;let mat;
   try{mat=id(row[owner]);}catch{const filled=used.map(i=>value(row[i])).filter(v=>v!==null&&v!=='');if(filled.length===1&&['total','totalgeneral','totales'].includes(key(filled[0])))continue;stats.unidentified++;continue;}
   if(!people.has(mat)){stats.outside++;continue;}for(const i of used)if(row[i]?.t==='e'||(row[i]?.f&&value(row[i])===null))stats.unavailable++;
   output.push([VERSION,period,mat,people.get(mat).je,n+1,bundleId,...used.map(i=>raw(row[i]))]);stats.included++;
  }
  stats.complete=stats.unidentified===0&&stats.unavailable===0;detailSheets[target]=output;
 }
 report.detailsComplete=report.details.every(d=>d.complete);
 const reportRows=[['Contrato','Periodo','Hoja','Incluidos','Ajenos','Sin matricula','No disponibles','Completo'],...report.details.map(d=>[VERSION,period,d.sheet,d.included,d.outside,d.unidentified,d.unavailable,d.complete?'SI':'NO'])];
 return {summary:out,details:detailSheets,report,reportRows};
}
root.ATNormalized={VERSION,HEADERS,DETAILS,exportClosure,periodMetadata};
})(typeof globalThis!=='undefined'?globalThis:this);
