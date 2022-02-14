import { Context, Markup, Telegraf, deunionize } from 'telegraf';
import { HourExpression } from './enums/hour-expression.enum';

export class TimePicker {
    constructor(private bot: Telegraf, private options?: any) {}

    /**
     * Get the Markup of the time-picker
     */
    getTimePicker(hour: HourExpression | number) {
        // check the input
        if ((<any>HourExpression)[hour] === undefined) throw new Error('Wrong Input');

        const keyboards = [
            [
                {
                    text: `${hour}:00`,
                    callback_data: 'time-picker-hour-plus-null'
                }
            ]
        ];

        keyboards.push([
            {
                text: '-',
                callback_data: `time-picker-hour-minus ${hour}`
            },
            {
                text: '+',
                callback_data: `time-picker-hour-plus ${hour}`
            }
        ]);

        keyboards.push([
            { text: 'submit', callback_data: `time-picker-hour-submit ${hour}` }
        ]);

        keyboards.push([{ text: 'cancel', callback_data: `time-picker-hour-cancel` }]);
        return Markup.inlineKeyboard(keyboards);
    }

    /**
     * Set the callback that will be called when submit is pressed
     */
    setTimePickerListener(next: (ctx: Context, hour: HourExpression) => any) {
        this.bot.action(/time-picker-hour-(plus|minus) (\d+)/, (ctx: Context) => {
            // @ts-expect-error define so far unknown property `match`
            const operation = ctx?.match[1];
            // @ts-expect-error define so far unknown property `match`
            let currentHour = +ctx?.match[2];

            const editedHour =
                operation === 'plus'
                    ? ++currentHour % 24
                    : --currentHour < 0
                    ? 23
                    : currentHour;

            return ctx
                .answerCbQuery()
                .then(() =>
                    ctx.editMessageText(
                        deunionize(ctx.callbackQuery.message)?.text,
                        this.getTimePicker(editedHour)
                    )
                );
        });

        this.bot.action('time-picker-hour-plus-null', (ctx: Context) =>
            ctx.answerCbQuery()
        );

        this.bot.action(/time-picker-hour-submit (\d+)/, async (ctx: Context) => {
            // @ts-expect-error define so far unknown property `match`
            const currentHour = ctx?.match[1];
            await next(ctx, +currentHour);
        });

        this.bot.action('time-picker-hour-cancel', async (ctx: Context) => {
            await ctx.deleteMessage(ctx.callbackQuery?.message?.message_id);
            await ctx.answerCbQuery();
        });
    }
}
