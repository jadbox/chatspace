function Stage(rooms, bot) {
  // Leave?
  bot.onText(/\/leave/, (msg, match) => {
    const chatId = msg.chat.id;

    rooms.remove(msg.chat);

    bot.sendMessage(chatId, `${msg.from.username} removed room. Type /start to add.`);
  });

  bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    // console.log(msg.chat);
    rooms.add(msg.chat);

    // console.log(msg.chat);

    const rs = rooms
      .filter((x) => !x.private)
      .map((x) => `${x.name}: ${x.getLink()}`)
      .join('\n');

    const resp = `Welcome to ${BOT_NAME}! Click on a MetaStage room below to join:\n\n${rs}`;

    bot.sendMessage(chatId, resp, { attachments: [] });
  });

  bot.onText(/\/players/, (msg, match) => {
    const chatId = msg.chat.id;

    const rs = rooms
      .getPlayers(msg.chat, msg.chat)
      .map((x) => x.name)
      .join('\n');

    const resp = `Room players:\n\n${rs}`;

    bot.sendMessage(chatId, resp, { attachments: [] });
  });

  bot.onText(/\/rooms/, (msg, match) => {
    const chatId = msg.chat.id;

    const rs = rooms
      .filter((x) => !x.private)
      .map((x) => `${x.name}: ${x.getLink()}`)
      .join('\n');

    const resp = `Click on a MetaStage room below to join:\n\n${rs}`;

    bot.sendMessage(chatId, resp, { attachments: [] });
  });

  bot.onText(/\/help/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `Basic commands:\n /start`);
  });
}

module.exports = { Stage };
