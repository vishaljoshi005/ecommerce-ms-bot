/* eslint-disable no-unused-vars */
const { ComponentDialog, ChoiceFactory, ChoicePrompt, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const CHOICE_PROMPT_ONE = 'CHOICE_PROMPT_ONE';

const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const TEXT_PROMPT_TWO = 'TEXT_PROMPT_TWO';

const MANAGE_ORDER = 'MANAGE_ORDER';
const MANAGE_ORDER_WATERFALL = 'MANAGE_ORDER_WATERFALL';

class ManageOrder extends ComponentDialog {
    constructor(id, cancelOrder, returnOrder, whereOrder) {
        super(id || MANAGE_ORDER);

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new TextPrompt(TEXT_PROMPT_TWO))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_ONE))
            .addDialog(cancelOrder)
            .addDialog(whereOrder)
            .addDialog(returnOrder)
            .addDialog(new WaterfallDialog(MANAGE_ORDER_WATERFALL, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MANAGE_ORDER_WATERFALL;
    }

    async firstStep(stepContext) {
        await timeout(2000);
        return await stepContext.prompt(CHOICE_PROMPT_ONE, {
            prompt: 'Hi There, I will help you with your orders. Please choose the appropriate query',
            choices: ChoiceFactory.toChoices(['Where\'s my order?', 'Cancel my order', 'Return my order'])
        });
    }

    async secondStep(stepContext) {
        await timeout(2000);

        switch (stepContext.result.value) {
        case 'Where\'s my order?':
            return await stepContext.beginDialog('WHERE_ORDER');
        case 'Cancel my order' :
            return await stepContext.beginDialog('CANCEL_ORDER');
        case 'Return my order':
            return await stepContext.beginDialog('RETURN_ORDER');
        }
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }
}

module.exports.ManageOrder = ManageOrder;
