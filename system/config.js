// Owner number
global.owner = '6285807264974'
// Owner name
global.owner_name = 'Faruq Wanghsaff'
// Maximum upload file size limit (Default : 50 MB)
global.max_upload = 999
// Delay for spamming protection (Default : 5 seconds)
global.cooldown = 3
// User Limitation (Default : 25)
global.limit = 500
// Time to be temporarily banned and others (Default : 30 minutes)
global.timer = 1800000
// Symbols that are excluded when adding a prefix (Don't change it)
global.evaluate_chars = ['=>', '~>', '<', '>', '$']
// Country code that will be automatically blocked by the system, when sending messages in private chat
global.blocks = ['91', '92', '94']
// Put target jid to forward friends story
global.forwards = '6285807264974'
// Get neoxr apikey by registering at https://api.neoxr.my.id
global.Api = new (require('./neoxrApi'))(process.env.API_KEY)
// Get bid and key configuration for autoreply chat ai feature by registering at https://brainshop.ai
global.chatai_bid = '164728'
global.chatai_key = 'MKPsfkgXLZPGrWoH'
// Source version
global.version = '5.4.7',
// Footer text
global.footer = '............'
// Global status
global.status = Object.freeze({
   wait: Func.texted('bold', 'Sabar bang lagi proses...🔮'),
   invalid: Func.texted('bold', 'URL salah bang🔮'),
   wrong: Func.texted('bold', 'Format salah bang🔮'),
   getdata: Func.texted('bold', 'Sedang mencari...🔮'),
   fail: Func.texted('bold', 'Error bang, apikey nya mungkin🔮'),
   error: Func.texted('bold', 'Error gatau kenapa🔮'),
   errorF: Func.texted('bold', 'Fitur nya masih otw di fix🔮'),
   premium: Func.texted('bold', 'Fitur ini khusus user premium doang bang🔮'),
   owner: Func.texted('bold', 'Fitur ini khusus buat FARUQ OFC🔮'),
   god: Func.texted('bold', 'Lu ga punya hak buat pake command ini🔮'),
   group: Func.texted('bold', 'Command ini khusus di group doang🔮'),
   botAdmin: Func.texted('bold', 'Gabisa, gw bukan admin bang🔮'),
   admin: Func.texted('bold', 'Lu bukan admin, fitur ini khusus admin doang🔮'),
   private: Func.texted('bold', 'Khusus chat pribadi(pc)🔮')
})
