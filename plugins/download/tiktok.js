exports.run = {
   usage: ['tiktok', 'tikmp3', 'tikwm'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://vt.tiktok.com/ZSe22y3dA'), m)
         if (!args[0].match('tiktok.com')) return client.reply(m.chat, global.status.invalid, m)
         client.reply(m.chat, global.status.getdata, m)
         let old = new Date()
         let json = await Api.tiktok(Func.ttFixed(args[0]))
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         if (command == 'tiktok') return client.sendButton(m.chat, json.data.video, `dari : ${json.author}\n${json.caption}\n\n*Mengambil* : ${((new Date - old) * 1)} detik`, ``, m, [{
            buttonId: `${isPrefix}extract ${json.data.video}`,
            buttonText: {
               displayText: 'Audio'
            },
            type: 1
         }])
         if (command == 'twm') return client.sendButton(m.chat, json.data.videoWM, `*Mengambil* : ${((new Date - old) * 1)} detik`, ``, m, [{
            buttonId: `${isPrefix}tikmp3 ${args[0]}`,
            buttonText: {
               displayText: 'Audio'
            },
            type: 1
         }])
         if (command == 'tmp3') return !json.data.audio ? client.reply(m.chat, global.status.fail, m) : client.sendFile(m.chat, json.data.audio, 'audio.mp3', '', m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: false,
   cache: true,
   location: __filename
}
