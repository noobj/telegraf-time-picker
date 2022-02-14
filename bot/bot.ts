import { TimePicker, HourExpression } from '../src';
import { Telegraf } from 'telegraf';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const timePicker = new TimePicker(bot);

timePicker.setTimePickerListener(async (context, hour) => {
    await context.reply(hour.toString());
    await context.deleteMessage(context.callbackQuery?.message?.message_id);
    await context.answerCbQuery();
});
bot.command('tp', (context) => {
    context.reply(
        'Choose the hour:',
        timePicker.getTimePicker(HourExpression.EVERY_DAY_AT_0AM)
    );
});

bot.catch((err) => {
    console.log('Error in bot:', err);
});

bot.launch().then(() => console.log('Bot is running...'));
