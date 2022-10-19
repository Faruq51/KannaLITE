const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
module.exports = async (client, m) => {
   try {
      require('./system/database')(m)
      const isOwner = [global.owner, ...global.db.setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const isPrem = (typeof global.db.users[m.sender] != 'undefined' && global.db.users[m.sender].premium) || isOwner
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata.participants : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net') : false
      const blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const groupSet = global.db.groups[m.chat],
         chats = global.db.chats[m.chat],
         users = global.db.users[m.sender],
         setting = global.db.setting
      const body = typeof m.text == 'string' ? m.text : false
      if (!setting.online) await client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) await client.sendPresenceUpdate('available', m.chat)
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (m.isGroup && isBotAdmin) groupSet.localonly = false
      if (m.isGroup && groupSet.autoread) await client.readMessages([m.key])
      if (!m.isGroup) await client.readMessages([m.key])
      if (m.isGroup) groupSet.activity = new Date() * 1
      if (m.chat.endsWith('broadcast') && m.mtype != 'protocolMessage') {
         let caption = `乂  *S T O R I E S*\n\n`
         if (/video|image/.test(m.mtype)) {
            caption += `${body ? body : ''}\n\n`
            caption += `*From : @${m.sender.replace(/@.+/, '')} (${client.getName(m.sender)})*`
            const media = await m.download()
            client.sendFile(global.forwards, media, '', caption)
         } else if (/extended/.test(m.mtype)) {
            caption += `${body ? body : ''}\n\n`
            caption += `*From : @${m.sender.replace(/@.+/, '')} (${client.getName(m.sender)})*`
            client.reply(global.forwards, caption)
         }
      }
      if (m.isGroup && !groupSet.stay && (new Date * 1) >= groupSet.expired && groupSet.expired != 0) {
         return client.reply(m.chat, Func.texted('italic', '🚩 Bot time has expired and will leave from this group, thank you.', null, {
            mentions: participants.map(v => v.id)
         })).then(async () => {
            groupSet.expired = 0
            await Func.delay(2000).then(() => client.groupLeave(m.chat))
         })
      }
      if (users) users.lastseen = new Date() * 1
      if (chats) {
         chats.lastseen = new Date() * 1
         chats.chat += 1
      }
      if (m.isGroup && !m.isBot && users.afk > -1) {
         client.reply(m.chat, `You are back online after being offline for : ${Func.texted('bold', Func.toTime(new Date - users.afk))}\n\n• ${Func.texted('bold', 'Reason')}: ${users.afkReason ? users.afkReason : '-'}`, m)
         users.afk = -1
         users.afkReason = ''
      }
      if (moment(new Date).format('HH:mm') == '00:00') {
         Object.entries(global.db.users).filter(([_, data]) => !data.limit < 10 && !data.premium).map(([_, data]) => data.limit = global.limit)
         Object.entries(global.db.statistic).map(([_, prop]) => prop.today = 0)
      }
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (!groupSet.member[m.sender]) {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      let getPrefix = body ? body.charAt(0) : ''
      let myPrefix = (setting.multiprefix ? setting.prefix.includes(getPrefix) : setting.onlyprefix == getPrefix) ? getPrefix : undefined
      require('./system/logs')(client, m, myPrefix)
      if (m.isBot || m.chat.endsWith('broadcast')) return
      if (((m.isGroup && !groupSet.mute) || !m.isGroup) && !users.banned) {
         if (body && body == myPrefix) {
            if (m.isGroup && groupSet.mute || !isOwner) return
            let old = new Date()
            let banchat = setting.self ? true : false
            if (!banchat) {
               await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
               return client.reply(m.chat, Func.texted('bold', `Response Speed: ${((new Date - old) * 1)}ms`), m)
            } else {
               await client.reply(m.chat, Func.texted('bold', `Checking . . .`), m)
               return client.reply(m.chat, Func.texted('bold', `Response Speed: ${((new Date - old) * 1)}ms (nonaktif)`), m)
            }
         }
      }
      let isPrefix,
         usage = Func.arrayJoin(Object.values(Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => prop.run.usage))).map(v => v.run.usage)),
         hidden = Func.arrayJoin(Object.values(Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => prop.run.hidden))).map(v => v.run.hidden)),
         univers = usage.concat(hidden)
      if ((body && body.length != 1 && (isPrefix = (myPrefix || '')[0])) || body && univers.includes((body.split` ` [0]).toLowerCase())) {
         let args = body.replace(isPrefix, '').split` `.filter(v => v)
         let command = args.shift().toLowerCase()
         let start = body.replace(isPrefix, '')
         let clean = start.trim().split` `.slice(1)
         let text = clean.join` `
         let prefixes = global.db.setting.multiprefix ? global.db.setting.prefix : [global.db.setting.onlyprefix]
         const is_commands = Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => prop.run.usage))
         let commands = Func.arrayJoin(Object.values(is_commands).map(v => v.run.usage))
         let matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
         try {
            if (new Date() * 1 - chats.command > (global.cooldown * 1000)) {
               chats.command = new Date() * 1
            } else {
               if (!m.fromMe) return
            }
         } catch (e) {
            global.db.chats[m.chat] = {}
            global.db.chats[m.chat].command = new Date() * 1
            global.db.chats[m.chat].chat = 1
            global.db.chats[m.chat].lastseen = new Date() * 1
         }
         if (!commands.includes(command) && matcher.length > 0 && !setting.self) {
            if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `Rekomendasi :\n\n${matcher.map(v => '➠ *' + (isPrefix ? isPrefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
         }
         if (setting.error.includes(command) && !setting.self) return client.reply(m.chat, Func.texted('bold', `🚩 Command _${isPrefix + command}_ disabled.`), m)
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
            Func.hitstat(command, m.sender)
         }
         for (let name in is_commands) {
            let cmd = is_commands[name].run
            let turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            let turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (body && global.evaluate_chars.some(v => body.startsWith(v)) && !body.startsWith(myPrefix)) return
            if (!turn && !turn_hidden) continue
            if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !isOwner && !m.fromMe) return
            if (setting.pluginDisable.includes(name)) return client.reply(m.chat, Func.texted('bold', `🚩 Plugin disabled by Owner.`), m)
            if (!m.isGroup && !['owner', 'create_bot'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < global.timer) continue
            if (!m.isGroup && !['owner', 'create_bot'].includes(name) && chats && !isPrem && !users.banned && setting.groupmode) return client.sendMessageModify(m.chat, `Untuk bisa menggunakan bot di personal chat (PC) kamu harus mempunyai limits minimal *Rp. 5000* atau cara cepat dengan upgrade ke premium user.\n\nJika ingin upgrade ke premium silahkan masuk ke grup ini dan kirim *${prefixes[0]}owner*`, m, {
               title: 'Maaf akses di tolak',
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/5b41c6d53b226403e8c9a.jpg'),
               url: 'https://chat.whatsapp.com/KG9EraduWh2Bz3mdWbkHjl'
            }).then(() => chats.lastchat = new Date() * 1)
            if (!['me', 'owner'].includes(name) && users && (users.banned || new Date - users.banTemp < global.timer)) return
            if (m.isGroup && !['activation'].includes(name) && groupSet.mute) continue
            if (cmd.cache && cmd.location) {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (cmd.error) {
               client.reply(m.chat, global.status.errorF, m)
               continue
            }
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               continue
            }
            if (cmd.limit && users.limit < 1) {
               return client.reply(m.chat, `Penggunaan bot Anda telah mencapai batas dan akan disetel ulang pada pukul 00.00\n\nUntuk mendapatkan lebih banyak batas, tingkatkan ke paket premium kirim *${prefixes[0]}premium*`, m).then(() => users.premium = false)
               continue
            }
            if (cmd.limit && users.limit > 0) {
               let limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit >= limit) {
                  users.limit -= limit
               } else {
                  client.reply(m.chat, Func.texted('bold', `🚩 Limit kamu tidak cukup untuk menggunakan fitur ini.`), m)
                  continue
               }
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            cmd.async(m, {
               client,
               args,
               text,
               isPrefix: isPrefix ? isPrefix : '',
               command,
               participants,
               blockList,
               isPrem,
               isOwner,
               isAdmin,
               isBotAdmin
            })
            break
         }
      } else {
         let prefixes = setting.multiprefix ? setting.prefix : [setting.onlyprefix]
         const is_events = Object.fromEntries(Object.entries(global.client.plugins).filter(([name, prop]) => !prop.run.usage))
         for (let name in is_events) {
            let event = is_events[name].run
            if (event.cache && event.location) {
               let file = require.resolve(event.location)
               Func.reload(file)
            }
            if (!m.isGroup && global.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (m.isGroup && !['exec'].includes(name) && groupSet.mute) continue
            if (setting.pluginDisable.includes(name)) continue
            if (!m.isGroup && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < global.timer) continue
            if (!m.isGroup && chats && !isPrem && !users.banned && setting.groupmode) return client.sendMessageModify(m.chat, `Untuk bisa menggunakan bot di personal chat (PC) kamu harus mempunyai limits minimal *Rp. 5000* atau cara cepat dengan upgrade ke premium user.\n\nJika ingin upgrade ke premium silahkan masuk ke grup ini dan kirim *${prefixes[0]}owner*`, m, {
               tiltle: 'Maaf akses di tolak',
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/5b41c6d53b226403e8c9a.jpg'),
               url: 'https://chat.whatsapp.com/KG9EraduWh2Bz3mdWbkHjl'
            }).then(() => chats.lastchat = new Date() * 1)
            if (setting.self && !['chatAI', 'exec'].includes(name) && !isOwner && !m.fromMe) continue
            if (!m.isGroup && ['chatAI'].includes(name) && body && Func.socmed(body)) continue
            if (!['exec', 'restrict'].includes(name) && users && users.banned) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter', 'exec'].includes(name) && users && (users.banned || new Date - users.banTemp < global.timer)) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter', 'exec'].includes(name) && groupSet && groupSet.mute) continue
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.moderator && !isMod) continue
            if (event.group && !m.isGroup) continue
            if (event.limit && users.limit < 1) continue
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            if (event.download && (!setting.autodownload || (body && global.evaluate_chars.some(v => body.startsWith(v))))) continue
            event.async(m, {
               client,
               body,
               participants,
               prefixes,
               isOwner,
               isAdmin,
               isBotAdmin,
               users,
               chats,
               groupSet,
               groupMetadata,
               setting
            })
         }
      }
   } catch (e) {
      console.log(e)
   }
}

Func.reload(require.resolve(__filename))
