const readout = document.createElement('output')
readout.id='touchReadout'
readout.style.cssText='position:fixed;right:4px;bottom:4px;z-index:99;background:#17243c;color:white;padding:4px 6px;font:11px monospace;pointer-events:none;max-width:95vw'
document.body.append(readout)
for (const kind of ['pointerdown','pointerup']) document.addEventListener(kind,e=>{
 readout.textContent=kind+' '+Math.round(e.clientX)+','+Math.round(e.clientY)+' '+e.pointerType+' '+e.target.tagName+'#'+e.target.id
},{capture:true,passive:true})
