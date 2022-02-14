import { TimePicker } from '../index';
import { HourExpression } from '../enums/hour-expression.enum';
import { Telegraf } from 'telegraf';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const timePicker = new TimePicker(bot);

timePicker.setTimePickerListener((context, hour) => {
    context.reply(hour.toString());
    context.answerCbQuery();
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

bot.launch();
