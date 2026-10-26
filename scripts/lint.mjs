import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve('src')
const files = []
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).forEach(entry=>{
  const target=path.join(dir,entry.name)
  if(entry.isDirectory()) walk(target)
  else if(/\.(js|jsx|css)$/.test(entry.name)) files.push(target)
})
walk(root)
const errors=[]
for(const file of files){
  const text=fs.readFileSync(file,'utf8')
  if(/console\.log\s*\(/.test(text)) errors.push(`${file}: remove console.log before commit`)
  if(file.endsWith('.css')){
    for(const match of text.matchAll(/font-size\s*:\s*([0-9.]+)(px|rem)/g)){
      const value=Number(match[1]), unit=match[2]
      const px=unit==='rem'?value*16:value
      if(px<12) errors.push(`${file}: font-size ${match[0]} is below the 12px design-token minimum`)
    }
  }
  for(const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)){
    const base=path.resolve(path.dirname(file),match[1])
    const candidates=[base,`${base}.js`,`${base}.jsx`,path.join(base,'index.js'),path.join(base,'index.jsx')]
    if(!candidates.some(x=>fs.existsSync(x))) errors.push(`${file}: unresolved relative import ${match[1]}`)
  }
}
const combined=files.filter(f=>/\.(js|jsx)$/.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n')
if(!combined.includes("Allocation (% of employee")) errors.push('UI: official Allocation % label/help text is missing')
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Source checks passed for ${files.length} frontend files.`)
