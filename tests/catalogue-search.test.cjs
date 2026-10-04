const {test}=require('node:test');const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('migration/supabase/functions/chillymz-api/search-match.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api});
test('catalogue search tolerates spelling, spacing and transposed letters',()=>{
 for(const [q,t,a] of [['red risng','Red Rising','Pierce Brown'],['redrising','Red Rising','Pierce Brown'],['foruth wing','Fourth Wing','Rebecca Yarros'],['harry poter','Harry Potter and the Goblet of Fire','J. K. Rowling'],['peirce brown','Red Rising','Pierce Brown'],['hunger gmaes','The Hunger Games','Suzanne Collins']])assert.notEqual(api.searchRank(q,t,a),null,q);
});
test('exact titles rank first and unrelated or short typos stay excluded',()=>{
 assert.ok(api.searchRank('Red Rising','Red Rising','Pierce Brown')<api.searchRank('red risng','Red Rising','Pierce Brown'));
 assert.equal(api.searchRank('zzzz','Red Rising','Pierce Brown'),null);
 assert.equal(api.searchRank('go','Red Rising','Pierce Brown'),null);
 assert.equal(api.searchRank('the martian','The Hunger Games','Suzanne Collins'),null);
});
