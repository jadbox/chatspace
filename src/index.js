require('dotenv').config();
// console.log("DAO_RPG_TOKEN", process.env.TOKEN);
const { Game } = require('./rpg/game');
// const { Stage } = require('./stagebot');
const { Room, rooms } = require('./room');
const TelegramBot = require('node-telegram-bot-api');

const BOT_NAME = 'MetaStage';

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', console.log);

console.log('starting chat engine');
// Matches "/echo [whatever]"

// utils
const send = (chatId, msg) => {
  if (!msg) return;

  // Date.now() + ':' +
  // console.log(chatId, msg);
  bot.sendMessage(chatId, msg);
};

const sendPoll = async (chatId, question, pollOptions, options) => {
  const open_period = (options.open_period = options.open_period || 10);
  const players = options.players;

  // console.log("sendPoll", chatId, question, pollOptions, options);
  const p = await bot.sendPoll(chatId, question, pollOptions, options);
  const id = p.poll.id; // message_id;
  // console.log("p", p);

  let lastPoll = [];
  let total_voter_count = 0;
  let timeOut = null;

  return new Promise((res) => {
    const onTimeOut = () => {
      if (timeOut) clearTimeout(timeOut);
      timeOut = null;
      // console.log("poll finished", lastPoll);
      lastPoll.sort(function (a, b) {
        return b.voter_count - a.voter_count;
      });
      const winner = lastPoll.length > 0 ? lastPoll[0].text : pollOptions[0];
      let voter_count = lastPoll.length > 0 ? lastPoll[0].voter_count : 0;
      const rmsg = `Proposal <${String(winner).toUpperCase()}> won with ${voter_count} vote.`;

      // send(chatId, rmsg);
      bot.removeListener('poll', onPoll);
      res(winner);
    };

    var onPoll = (poll) => {
      // console.log("poll.message_id!==id", poll, poll.id, id);
      if (poll.id !== id) return; //  || poll.is_closed===false
      lastPoll = [...poll.options];
      total_voter_count = poll.total_voter_count;
      // console.log("total_voter_count === players", total_voter_count, players);
      if (total_voter_count === players) onTimeOut();
    };

    timeOut = setTimeout(onTimeOut, open_period * 1000);
    bot.on('poll', onPoll);
  });
  // bot.on('message', console.log.bind(console));
};

// Commands

bot.onText(/\/echo (.+)/, (msg, match) => {
  console.log(msg.from.username);
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

/*
bot.onText(/\/end/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!rooms.hasGame(msg.chat)) {
    return;
  }

  rooms[chatId].game.quit();

  rooms[chatId] = Room(); // clear out room

  send(chatId, "game ended");
});

// Join the party
bot.onText(/\/join/, (msg, match) => {
  const chatId = msg.chat.id;
  const user = msg.from.username;
  if (!user || user === "undefined") {
    bot.sendMessage(
      chatId,
      `Please set up a Telegram username first in your Telegram settings.`
    );
    return;
  }
  const room = (rooms[chatId] = rooms[chatId] || Room());
  rooms[chatId] = room;

  if (room.game) {
    bot.sendMessage(chatId, "sorry, game has already started");
    return;
  }

  room.players[user] = Player(user);

  bot.sendMessage(
    chatId,
    `${msg.from.username} thanks for joining. Type /play ONLY once everyone has joined.`
  );
});

bot.onText(/\/(stop|pause)/i, (msg, match) => {
  const chatId = msg.chat.id;

  let room = rooms[chatId];
  if (!room || !room.game) {
    bot.sendMessage(chatId, `Game not started yet.`);
    return;
  }

  room.game.pause();
  send(chatId, `Game is stopped. /play to resume or /end to end quest.`);
});
*/
/*
bot.onText(/\/(play)$/i, (msg, match) => {
  const chatId = msg.chat.id;
  const user = msg.from.username;

  let room = rooms[chatId];

  if (!room || !room?.players[user]) {
    bot.sendMessage(
      chatId,
      `Pleae join the quest first before starting by using /join`
    );
    return;
  }

  if (room.game) {
    room.game.resume();
    send(chatId, `Game is resuming...`);
    return;
  }

  const game = (room.game = new Game(room));

  const _sendMsg = send.bind(this, chatId);
  const _sendPoll = sendPoll.bind(this, chatId);

  const onGameEnded = () => {
    // _sendMsg('Game Over.');
    if (rooms[chatId]) rooms[chatId] = null;
  };
  const _sendSticked = (id, type) => {
    console.log("_sendSticked", id, type);
    if (type === "sticker") bot.sendSticker(chatId, id);
    else if (type === "animation" || true) bot.sendDocument(chatId, id);
  };

  game.start(_sendMsg, _sendPoll, onGameEnded, _sendSticked);
  bot.sendMessage(chatId, `Game is starting- good luck! /stop to stop.`);
}); 

bot.onText(/[\/]?(attack|kill|swing|⚔️|🤺|🏹|🗡|🔫|⛓|🔪|🧨)/i, (msg, match) => {
  const chatId = msg.chat.id;
  const user = msg.from.username;
  let room = rooms[chatId];
  if (!room?.game) {
    // send(chatId, "no game created");
    return;
  }

  room.game.act(user, "attack");
});

bot.onText(/[\/]?(aid|heal|1up|🍿|🛡|💊|🥪) (.*)/i, (msg, match) => {
  const chatId = msg.chat.id;
  const room = rooms[chatId];
  const user = msg.from.username;

  if (match[1]?.toLowerCase() === "1up") {
    // console.log("room.game?.state?.name", match[1]);
    if (!room?.game) return;
    if (room?.game?.state?.name !== "battle") return;
  }
  if (!room?.game) {
    send(chatId, "no game created");
    return;
  }

  // console.log("match", match, match[2]);

  const params = match[2].replace("@", "");
  room.game.act(user, "aid", params);
});
*/

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg, match) => {
		// Register user to room
		// Make it explicit join?
  if (msg.from && msg.chat) {
			rooms.add(msg.chat);
			rooms.add(msg.from);
			if(msg.from.type!=='private') rooms.setPlayer(msg.chat, msg.from);
		}
  return;
  const chatId = msg.chat.id;

  if (!match?.type) return;
  if (!msg?.sticker?.file_id && !msg?.animation?.file_id) return;
  console.log('match type', match?.type);
  console.log('Sticker', msg?.sticker?.file_id);
  console.log('Animation', msg?.animation?.file_id, msg?.animation);
});

bot.onText(/\/test/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendDocument(chatId, 'CgACAgQAAxkBAAIGnF6kwDGFj_M0kZ-skV-Kuoe-L_xvAAJrAgACrEAsUZcOPnnrs47BGQQ');
});

function isPrivate(msg) {
  return msg.chat.type === 'private';
}

function onlyGroup(msg) {
  if (msg.chat.type !== 'private') return true;

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Can only run this command from a public group.`);
}

function onlyStage(msg) {
  if (msg.chat.type === 'private') return true;

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Can only run this command from direct MetaStage chat.`);
}

// ===========

bot.onText(/^[^\/]/, (msg, match) => {
  // console.log('msg.chat.type', msg.chat)
  if (msg.chat.type !== 'private') return;
  // if(msg.from && msg.chat) rooms.setPlayer(msg.chat, msg.from);

  rooms.add(msg.chat);

  // console.log(msg);

  const room = rooms.getPlayerRoom(msg.from.id);
  const rs = rooms.getPlayers(room);
  rs.forEach((player) => {
    if (player.id !== msg.from.id) bot.sendMessage(player.id, `${msg.from.username}: ${msg.text}`);
  });
});

async function introRoomMessage(msg, myroomId, justLooking) {
  // console.log('join', myroomId, roomcontext);

  const room = rooms.getPlayerRoom(myroomId);
  const rs = rooms
    .getPlayers(room)
    .map((x) => x.name)
    .join(', ');

  let roomName = room.title;

  let linkText = '';
  let isHome = false;
  if (roomName === msg.from.username) {
    roomName = 'home';
    isHome = true;
  } else {
    if (room.getLink()) linkText = ` ${room.getLink()}`;
  }

  const peopleMsg = `active people: ${rs}`;

  let introMsg = `You've entered`;
  if (justLooking) introMsg = `Current room`;

  //--
		let pinnedMessage = '';
  if (!isHome) {
    const d = await bot.getChat(msg.chat.id);
    // console.log('d.pinned_message', d.pinned_message)
    if (d.pinned_message && d.pinned_message.text) pinnedMessage = `\n\n${d.pinned_message.text}`;
  }
		// --
		let jitsi = `live: ${room.getVideoLink()}`;

  bot.sendMessage(
    myroomId,
    `${introMsg}: ${roomName}${linkText}
${peopleMsg}
${jitsi}${pinnedMessage}`,
    { attachments: [] }
  );
}

bot.onText(/^\/look/, (msg, match) => {
  if (!onlyStage(msg)) return;
  rooms.add(msg.chat);

  introRoomMessage(msg, msg.from.id, true);
});

bot.onText(/^\/join(_.*)*/, async (msg, match) => {
  // join anywhere
  rooms.add(msg.chat);
  // ---
  // console.log(match);
  let targetRoom = msg.chat;
  if (match[1]) {
    const r = match[1].replace('@MetaStageBot', '');
    targetRoom = { id: r.slice(1) };
    // console.log('targerRoom', targerRoom)
    try {
      targetRoom = await bot.getChat('@' + targetRoom.id);
    } catch (e) {}

    if (!targetRoom) {
      console.log('no such room:' + targetRoom);
      return;
    }
    console.log('targerRoom', targetRoom);
  }

  const chatId = msg.chat.id;
  // console.log(msg);
  // create
  // rooms.add(targetRoom);

  const userid = msg.from.id; // get the user id to send a message direct
  rooms.add({ id: userid });

		const result = rooms.setPlayer(targetRoom, msg.from);
		
		if(!result && isPrivate(msg)) {
			bot.sendMessage(msg.chat.id, 'already in room: ' + targetRoom.title);
			return;
		}

  introRoomMessage(msg, userid);

  try {
    if(!isPrivate(msg)) bot.deleteMessage(chatId, msg.message_id);
  } catch (e) {}
});

// Add user to room

// Leave?
bot.onText(/^\/(leave|home)/, (msg, match) => {
  if (!onlyStage(msg)) return;

  // rooms.remove(msg.chat);
  rooms.setPlayer(msg.from, msg.from, true);

		introRoomMessage(msg, msg.from.id, true);
		
		console.log(rooms.get(msg.from.id));
});

function roomMessageStr(msg) {
  return rooms
    .filter((x) => !x.private)
    .map((x) => `/join_${x.name} [peeps=${x.numPlayers()}]		${x.getLink()}`)
    .join('\n');
}

bot.onText(/^\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  // console.log(msg.chat);
  rooms.add(msg.chat);
  rooms.add(msg.from);

  rooms.setPlayer(msg.chat.type === 'private' ? msg.from : msg.chat, msg.from, true);

  // console.log(msg.chat);

  const rs = roomMessageStr(msg);

  const resp = `Welcome to ${BOT_NAME}! Click on a MetaStage room below to join:\n\n${rs}`;

  bot.sendMessage(chatId, resp, { attachments: [] });
});

bot.onText(/^\/(players|people)/, (msg, match) => {
  const chatId = msg.chat.id;

  const rs = rooms
    .getPlayers(msg.chat, msg.chat)
    .map((x) => x.name)
    .join('\n');

  const resp = `Active people:\n\n${rs}`;

  bot.sendMessage(chatId, resp, { attachments: [] });
});

bot.onText(/^\/rooms/, (msg, match) => {
  const chatId = msg.chat.id;

  const rs = roomMessageStr(msg);

  const resp = `Click on a MetaStage room below to join:\n\n${rs}`;

  bot.sendMessage(chatId, resp, { attachments: [] });

  if (!isPrivate(msg)) {
    bot.deleteMessage(msg.chat.id, msg.message_id);
  }
});

bot.onText(/^\/help/, (msg, match) => {
  const chatId = msg.chat.id;

  const info = `To create subrooms in channels, pin a message to the group that contains the list in format of:

		ROOMNAME MAX_USERS(number) MIXER(bool)
		/join_Daohouse 5 no
		/join_roomKitchen 4 yes
		\nMIXER field will designate if room can be full or if subrooms are made.
																`;

  bot.sendMessage(
    chatId,
    `Basic commands:
					/start
					/help
					/rooms view all rooms

					Group commands:
					/join - Set the current bot context to this room (bot must be installed in channel)
					
					Stage commands:
					/look - See the current room context
					/people  - See the current people here
					/leave - Leave the current room and return to home.
				
				${info}`
  );
});
