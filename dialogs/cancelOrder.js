/* eslint-disable no-unused-vars */
const { ComponentDialog,
    ChoicePrompt,
    ChoiceFactory,
    WaterfallDialog,
    TextPrompt,
    Dialog } = require('botbuilder-dialogs');

const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');

// const card = require('../cancelOrder.json');
const card = require('../resources/cards/cancelOrder.json');

const CANCEL_ORDER = 'CANCEL_ORDER';
const CANCEL_ORDER_WATERFALL = 'CANCEL_ORDER_WATERFALL';

const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const CHOICE_PROMPT_ONE = 'CHOICE_PROMPT_ONE';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const { CancelAndHelpDialog } = require('./cancelHelpDialog');

class CancelOrder extends ComponentDialog {
    constructor(id) {
        super(id || CANCEL_ORDER);

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_ONE))
            .addDialog(new WaterfallDialog(CANCEL_ORDER_WATERFALL, [
                this.firstStep.bind(this),
                this.secondStep.bind(this)
                // this.finalStep.bind(this)
            ]));

        this.initialDialogId = CANCEL_ORDER_WATERFALL;
    }

    async firstStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [this.createAdaptiveCard()]
        });

        return await Dialog.EndOfTurn;

        // return await stepContext.prompt(TEXT_PROMPT_ONE, 'Please enter your order number');
    }

    async secondStep(stepContext) {
        await timeout(2000);
        await stepContext.context.sendActivity(`Your order number ${ stepContext.context.activity.value.order } is cancelled`);

        await timeout(5000);
        return stepContext.endDialog();

        // stepContext.values.order = stepContext.result;
        // return await stepContext.prompt(CHOICE_PROMPT_ONE,{
        //     prompt: 'Please select the reason to cancel. If the options do not fit choose others.',
        //     choices: ChoiceFactory.toChoices(['Order by mistake', 'Others'])
        // });
    }

    async finalStep(stepContext) {
        await stepContext.context
            .sendActivity(`Your order number ${ stepContext.values.order } is cancelled. Checkout our new www.amazon.in`);

        await timeout(4000);
        return stepContext.endDialog();
    }

    createAdaptiveCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.CancelOrder = CancelOrder;
