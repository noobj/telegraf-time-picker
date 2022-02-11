import { Context, Markup, Telegraf, deunionize } from 'telegraf';

export class TimePicker {
    constructor(private bot: Telegraf, private options?: any) {}

    /**
     * Get the Markup of the time-picker
     */
    getTimePicker(hour: string) {
        const keyboards = [
            [{ text: `${hour}:00`, callback_data: 'time-picker-hour-plus-null' }]
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
        return Markup.inlineKeyboard(keyboards);
    }

    /**
     * Set the callback that will be called when submit is pressed
     */
    setTimePickerListener(next: (ctx: Context, time: string) => any) {
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
                        this.getTimePicker(editedHour.toString())
                    )
                );
        });

        this.bot.action('time-picker-hour-plus-null', (ctx: Context) =>
            ctx.answerCbQuery()
        );

        this.bot.action(/time-picker-hour-submit (\d+)/, async (ctx: Context) => {
            // @ts-expect-error define so far unknown property `match`
            const currentHour = +ctx?.match[1];
            await ctx.answerCbQuery();
            await ctx.deleteMessage(ctx.callbackQuery?.message?.message_id);
            await next(ctx, currentHour.toString());
        });
    }
}
