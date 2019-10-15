/* eslint-disable no-unused-vars */
const { ComponentDialog,
    WaterfallDialog,
    TextPrompt,
    ChoiceFactory,
    ChoicePrompt,
    Dialog } = require('botbuilder-dialogs');

const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

// const card = require('../whereOrder.json');
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
                // this.finalStep.bind(this)
            ]));

        this.initialDialogId = WHERE_ORDER_WATERFALL;
    }

    async firstStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [this.createOrderCard()]
        });
        return Dialog.EndOfTurn;
        // return await stepContext.prompt(TEXT_PROMPT_ONE, 'Please enter your registered email address');
    }

    async secondStep(stepContext) {
        await timeout(2000);
        await stepContext.context
            .sendActivity(`Your order number ${ stepContext.context.activity.value.order } is currently in transit at local post office and it will be delivered today.`);
        await timeout(5000);
        return await stepContext.endDialog();

        // stepContext.values.email = stepContext.result;
        // return await stepContext.prompt(TEXT_PROMPT_TWO, 'Please enter your order number');
    }

    // async finalStep(stepContext) {
    //     stepContext.values.order = stepContext.result;
    //     await stepContext.context.sendActivity(`Your order number ${stepContext.result} associated with email: ${stepContext.values.email} is currently in transit at local post office and it will be delivered today.`);
    //     await timeout(5000);
    //     return await stepContext.endDialog();
    // }

    createOrderCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.WhereOrder = WhereOrder;
