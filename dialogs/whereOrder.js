/* eslint-disable no-unused-vars */
const { ComponentDialog,
    WaterfallDialog,
    TextPrompt,
    Dialog } = require('botbuilder-dialogs');

const { CardFactory } = require('botbuilder');
const { Order } = require('../config/db.config');

const card = require('../resources/cards/whereOrder.json');

const WHERE_ORDER = 'WHERE_ORDER';
const WHERE_ORDER_WATERFALL = 'WHERE_ORDER_WATERFALL';

const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const TEXT_PROMPT_TWO = 'TEXT_PROMPT_TWO';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class WhereOrder extends ComponentDialog {
    constructor(id) {
        super(id || WHERE_ORDER);

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new TextPrompt(TEXT_PROMPT_TWO))
            .addDialog(new WaterfallDialog(WHERE_ORDER_WATERFALL, [
                this.firstStep.bind(this),
                this.secondStep.bind(this)
            ]));

        this.initialDialogId = WHERE_ORDER_WATERFALL;
    }

    async firstStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [this.createOrderCard()]
        });
        return Dialog.EndOfTurn;
    }

    async secondStep(stepContext) {
        const orderNumber = stepContext.context.activity.value.order;
        await timeout(1000);
        const data = await Order.findOne({ orderNumber });
        let status = null;
        if (data) {
            status = data.status;
            await stepContext.context
                .sendActivity(`Your order number ${ orderNumber } is currently in ${ status } at local post office and it will be delivered today.`);
            await timeout(5000);
            return await stepContext.endDialog();
        }
        await stepContext.context.sendActivity('This order does not exist please enter correct order number');
        return await stepContext.replaceDialog(this.id);
    }

    createOrderCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.WhereOrder = WhereOrder;
