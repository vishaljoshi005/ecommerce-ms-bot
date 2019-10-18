/* eslint-disable no-unused-vars */
const { ComponentDialog,
    ChoicePrompt,
    WaterfallDialog,
    TextPrompt,
    Dialog } = require('botbuilder-dialogs');

const { CardFactory } = require('botbuilder');

const { Order } = require('../config/db.config');

// const card = require('../cancelOrder.json');
const card = require('../resources/cards/cancelOrder.json');

const CANCEL_ORDER = 'CANCEL_ORDER';
const CANCEL_ORDER_WATERFALL = 'CANCEL_ORDER_WATERFALL';

const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const CHOICE_PROMPT_ONE = 'CHOICE_PROMPT_ONE';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class CancelOrder extends ComponentDialog {
    constructor(id) {
        super(id || CANCEL_ORDER);

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_ONE))
            .addDialog(new WaterfallDialog(CANCEL_ORDER_WATERFALL, [
                this.showCard.bind(this),
                this.cancelOrder.bind(this)
            ]));

        this.initialDialogId = CANCEL_ORDER_WATERFALL;
    }

    async showCard(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [this.createAdaptiveCard()]
        });

        return await Dialog.EndOfTurn;

        // return await stepContext.prompt(TEXT_PROMPT_ONE, 'Please enter your order number');
    }

    async cancelOrder(stepContext) {
        // await timeout(2000);
        const orderNumber = stepContext.context.activity.value.order;
        const reason = stepContext.context.activity.value.reason;
        const data = await Order.findOneAndUpdate({ orderNumber }, { status: 'cancel', reason });
        await stepContext.context.sendActivity(`Your order number ${ orderNumber } is cancelled`);

        await timeout(5000);
        return stepContext.endDialog();
    }

    createAdaptiveCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.CancelOrder = CancelOrder;
