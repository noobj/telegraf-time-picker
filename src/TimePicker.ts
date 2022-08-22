import { Context, Markup, Telegraf, deunionize } from 'telegraf';
import { HourExpression, MinuteExpression } from './enums/index';

export class TimePicker {
    constructor(private bot: Telegraf, private options?: any) {}

    /**
     * Get the Markup of the time-picker
     */
    getTimePicker(hour: HourExpression | number, minute: MinuteExpression | number) {
        // check the input
        if ((<any>HourExpression)[hour] === undefined) throw new Error('Wrong Input');
        if ((<any>MinuteExpression)[minute] === undefined) throw new Error('Wrong Input');

        const keyboards = [
            [
                {
                    text: `${hour}:${String(minute).padStart(2, '0')}`,
                    callback_data: 'time-picker-hour-plus-null'
                }
            ]
        ];

        keyboards.push([
            {
                text: '-',
                callback_data: `time-picker-hour-minus ${hour} ${minute}`
            },
            {
                text: '+',
                callback_data: `time-picker-hour-plus ${hour} ${minute}`
            }
        ]);
        keyboards.push([
            {
                text: '-',
                callback_data: `time-picker-minute-minus ${hour} ${minute}`
            },
            {
                text: '+',
                callback_data: `time-picker-minute-plus ${hour} ${minute}`
            }
        ]);

        keyboards.push([
            { text: 'submit', callback_data: `time-picker-hour-submit ${hour} ${minute}` }
        ]);

        keyboards.push([{ text: 'cancel', callback_data: `time-picker-hour-cancel` }]);
        return Markup.inlineKeyboard(keyboards);
    }

    /**
     * Set the callback that will be called when submit is pressed
     */
    setTimePickerListener(
        next: (ctx: Context, hour: HourExpression, minute: MinuteExpression) => any
    ) {
        this.bot.action(
            /time-picker-hour-(plus|minus) (\d+) (\d+)/,
            async (ctx: Context) => {
                // @ts-expect-error define so far unknown property `match`
                const operation = ctx?.match[1];
                // @ts-expect-error define so far unknown property `match`
                let currentHour = +ctx?.match[2];
                // @ts-expect-error define so far unknown property `match`
                let currentMinute = ctx?.match[3];

                const editedHour =
                    operation === 'plus'
                        ? ++currentHour % 24
                        : --currentHour < 0
                        ? 23
                        : currentHour;

                await Promise.all([
                    ctx.answerCbQuery(),
                    ctx.editMessageText(
                        deunionize(ctx.callbackQuery.message)?.text,
                        this.getTimePicker(editedHour, currentMinute)
                    )
                ]);
            }
        );
        this.bot.action(
            /time-picker-minute-(plus|minus) (\d+) (\d+)/,
            async (ctx: Context) => {
                // @ts-expect-error define so far unknown property `match`
                const operation = ctx?.match[1];
                // @ts-expect-error define so far unknown property `match`
                let currentHour = +ctx?.match[2];
                // @ts-expect-error define so far unknown property `match`
                let currentMinute = parseInt(ctx?.match[3]);

                console.log({ currentHour, currentMinute });
                const editedMinute =
                    operation === 'plus'
                        ? (currentMinute + 5) % 60
                        : currentMinute - 5 < 0
                        ? 55
                        : currentMinute;

                let editedHour =
                    operation === 'plus' && currentMinute === 55
                        ? currentHour++
                        : currentHour;

                editedHour =
                    operation === 'minus' && currentMinute === 0
                        ? currentHour - 1
                        : currentHour;

                console.log({ editedHour, editedMinute });

                await Promise.all([
                    ctx.answerCbQuery(),
                    ctx.editMessageText(
                        deunionize(ctx.callbackQuery.message)?.text,
                        this.getTimePicker(editedHour, editedMinute)
                    )
                ]);
            }
        );

        this.bot.action('time-picker-hour-plus-null', (ctx: Context) =>
            ctx.answerCbQuery()
        );

        this.bot.action(/time-picker-hour-submit (\d+) (\d+)/, async (ctx: Context) => {
            // @ts-expect-error define so far unknown property `match`
            const currentHour = ctx?.match[1];
            // @ts-expect-error define so far unknown property `match`
            const currentMinute = ctx?.match[2];

            await next(ctx, +currentHour, currentMinute);
        });

        this.bot.action('time-picker-hour-cancel', async (ctx: Context) => {
            await Promise.all([ctx.deleteMessage(), ctx.answerCbQuery()]);
        });
    }
}
