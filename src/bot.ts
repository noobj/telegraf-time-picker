import { TimePicker } from '.';
import { Telegraf } from 'telegraf';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const timePicker = new TimePicker(bot);

timePicker.setTimePickerListener((context, date) => context.reply(date));

bot.command('tp', (context) => {
    context.reply('Choose the hour:', timePicker.getTimePicker('0'));
});

bot.catch((err) => {
    console.log('Error in bot:', err);
});

bot.launch();
