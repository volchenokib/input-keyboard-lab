const cases = [
 ['text-off','Текст · off','Без парольного типа. Контроль возврата T9.','<input type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" writingsuggestions="false">'],
 ['legacy','Password → text · focus','Исходный механизм. Тип меняется внутри focus.','<input type="password" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">','focus-type'],
 ['new-password','Password → text · new-password','Текущий контроль с new-password.','<input type="password" autocomplete="new-password" autocorrect="off" autocapitalize="none" spellcheck="false">','focus-type'],
 ['early','Password → text · до фокуса','pointerdown и подготовка перед JS focus.','<input type="password" autocomplete="new-password" autocorrect="off" autocapitalize="none" spellcheck="false">','early-type'],
 ['text-new','Текст · new-password','Поле никогда не бывает password.','<input type="text" autocomplete="new-password" autocorrect="off" autocapitalize="none" spellcheck="false" writingsuggestions="false">'],
 ['text-otp','Текст · one-time-code','Проверить также предложения кодов.','<input type="text" autocomplete="one-time-code" autocorrect="off" autocapitalize="none" spellcheck="false">'],
 ['search','Search · off','Проверить историю поиска и T9.','<input type="search" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" writingsuggestions="false">'],
 ['email-mode','Текст · inputmode email','Контроль уже проверенного подхода. Проверить пробелы и корейский.','<input type="text" inputmode="email" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">'],
 ['url-mode','Текст · inputmode url','Контроль уже проверенного подхода.','<input type="text" inputmode="url" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">'],
 ['email','Тип email','Поле не предназначено для обычного ответа; только эксперимент.','<input type="email" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">'],
 ['url','Тип url','Поле не предназначено для обычного ответа; только эксперимент.','<input type="url" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">'],
 ['textarea','Textarea','Без парольного типа.','<textarea rows="2" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" writingsuggestions="false"></textarea>'],
 ['editable','Contenteditable','Редактируемый блок вместо input.','<div contenteditable="true" role="textbox" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" writingsuggestions="false"></div>'],
 ['css-focus','CSS disc → none · focus','Текстовое поле; маскирование снимается при фокусе. Не установлено, влияет ли CSS на T9.','<input type="text" style="-webkit-text-security:disc" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">','css-focus'],
 ['css-early','CSS disc → none · до фокуса','Снять маскирование на pointerdown или перед JS focus.','<input type="text" style="-webkit-text-security:disc" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">','css-early'],
 ['readonly-text','Readonly text → editable · до фокуса','Снять readonly на pointerdown или перед JS focus.','<input type="text" readonly autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">','readonly'],
 ['readonly-password','Readonly password → text · до фокуса','Парольный тип присутствует в истории элемента. Проверяем влияние readonly.','<input type="password" readonly autocomplete="new-password" autocorrect="off" autocapitalize="none" spellcheck="false">','readonly-password'],
 ['section','Текст · отдельная секция autocomplete','Проверить, меняет ли секция предложения.','<input type="text" autocomplete="section-answer off" autocorrect="off" autocapitalize="none" spellcheck="false">']
]
const $ = id => document.getElementById(id)
const selected = cases.find(c => c[0] === new URLSearchParams(location.search).get('case'))
const key = 'input-lab-results-v1'
let saved = {}
try { saved = JSON.parse(localStorage.getItem(key) || '{}') } catch {}
const questions = ['Пароль: первое открытие','Пароль: повторный фокус','Пароль: переход А → Б','Сохранённая запись доступна через ключ','Подсказки слов T9','Автозамена teh после пробела','Корейский ввод и редактирование','Предложение сохранить / обновить пароль']
$('host').textContent = location.hostname
for (const [id,title,note] of cases) {
 const a = document.createElement('a'); a.href = '?case=' + id
 const strong = document.createElement('strong'); strong.textContent = title
 const small = document.createElement('small'); small.textContent = note
 a.append(strong,small); $('variants').append(a)
}
const summary = () => { $('summary').textContent = JSON.stringify(saved,null,2) }
summary()
let fields = [], events = []
const prepare = el => {
 const mode = selected?.[4]
 if (mode === 'early-type' || mode === 'readonly-password') el.type = 'text'
 if (mode === 'readonly' || mode === 'readonly-password') el.readOnly = false
 if (mode === 'css-early') el.style.webkitTextSecurity = 'none'
}
const attributes = () => {
 $('attrs').textContent = JSON.stringify(fields.map(el=>({id:el.id,focused:document.activeElement===el,attributes:Object.fromEntries([...el.attributes].map(a=>[a.name,a.value])),textSecurity:getComputedStyle(el).webkitTextSecurity})),null,2)
}
const mount = () => {
 $('fields').replaceChildren(); fields = []
 for(const letter of ['A','B']) {
  const wrap = document.createElement('div'); wrap.className = 'field'
  const label = document.createElement('label'); label.htmlFor = 'answer'+letter; label.textContent = 'Поле '+letter
  const template = document.createElement('template'); template.innerHTML = selected[3]
  const el = template.content.firstElementChild; el.id = 'answer'+letter
  // Fixed, descriptive names for every variant; no random password-manager evasion.
  if(el.tagName !== 'DIV') el.name = 'answer_'+letter.toLowerCase()
  el.addEventListener('pointerdown',()=>prepare(el),true)
  el.addEventListener('focus',()=>{
   if(selected[4]==='focus-type') el.type='text'
   if(selected[4]==='css-focus') el.style.webkitTextSecurity='none'
  })
  for(const event of ['pointerdown','focus','blur','input','compositionstart','compositionend']) el.addEventListener(event,e=>{
   events.unshift({time:new Date().toISOString(),field:el.id,event,type:el.getAttribute('type'),composing:Boolean(e.isComposing)})
   $('events').textContent=JSON.stringify(events.slice(0,30),null,2); attributes()
  })
  fields.push(el);wrap.append(label,el);$('fields').append(wrap)
 }
 attributes()
}
if(selected) {
 $('catalog').hidden=true; $('experiment').hidden=false
 $('caseTitle').textContent=selected[1];$('caseNote').textContent=selected[2];$('reload').href=location.href
 mount()
 $('focusA').onclick=()=>{prepare(fields[0]);fields[0].focus()}
 $('focusB').onclick=()=>{prepare(fields[1]);fields[1].focus()}
 $('blur').onclick=()=>{fields.forEach(el=>el.blur());attributes()}
 $('recreate').onclick=mount
 for(const q of questions) {
  const label=document.createElement('label');label.textContent=q
  const select=document.createElement('select')
  for(const value of ['Не проверено','Да','Нет','Нестабильно','Не удалось проверить']) {const option=document.createElement('option');option.textContent=value;select.append(option)}
  select.value=saved[selected[0]]?.[q] || 'Не проверено'
  select.onchange=()=>{saved[selected[0]]={...saved[selected[0]],[q]:select.value};try{localStorage.setItem(key,JSON.stringify(saved))}catch{}summary()}
  label.append(select);$('results').append(label)
 }
}
$('export').onclick=()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,time:new Date().toISOString(),origin:location.origin,userAgent:navigator.userAgent,results:saved},null,2)],{type:'application/json'}))
 const a=document.createElement('a');a.href=url;a.download='input-lab-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
