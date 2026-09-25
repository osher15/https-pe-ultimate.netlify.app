"""הוספת מפתחות ממשק חדשים ל-hm-i18n.js בארבע השפות.
שימוש: python3 tools/i18n-addkeys.py keys.json
פורמט: {"key": ["עברית", "en", "ar", "ru", "es"]} — העברית היא ברירת המחדל
שבקוד (data-i18n / t(key,def)), ולכן היא לא נכתבת לקובץ."""
import json,sys,os
keys=json.load(open(sys.argv[1],encoding='utf8'))
p=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','hm-i18n.js')
s=open(p,encoding='utf8').read()
for idx,lang in enumerate(["en","ar","ru","es"],1):
    marker="\n"+lang+":{\n"
    assert s.count(marker)==1,lang
    lines="".join('  %s:%s,\n'%(json.dumps(k,ensure_ascii=False),json.dumps(v[idx],ensure_ascii=False)) for k,v in keys.items())
    s=s.replace(marker,marker+"  /* ux-redesign */\n"+lines,1)
open(p,'w',encoding='utf8').write(s)
print("added",len(keys),"keys x4")
