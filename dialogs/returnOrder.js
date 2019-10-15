/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
const { ComponentDialog,
    ChoiceFactory,
    ChoicePrompt,
    TextPrompt,
    WaterfallDialog,
    Dialog } = require('botbuilder-dialogs');

const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');

const card = require('../resources/cards/returnOrder.json');

const RETURN_ORDER = 'RETURN_ORDER';
const RETURN_ORDER_WATERFALL = 'RETURN_ORDER_WATERFALL';

const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';

const CHOICE_PROMPT_ONE = 'CHOICE_PROMPT_ONE';
const CHOICE_PROMPT_TWO = 'CHOICE_PROMPT_TWO';

const CHOICE_PROMPT_THREE = 'CHOICE_PROMPT_THREE';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class ReturnOrder extends ComponentDialog {
    constructor(id) {
        super(id || RETURN_ORDER);

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_TWO))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_THREE))
            .addDialog(new WaterfallDialog(RETURN_ORDER_WATERFALL, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                // this.thirdStep.bind(this),
                this.fourStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = RETURN_ORDER_WATERFALL;
    }


    async firstStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [this.createAdaptiveCard()]
        });

        return Dialog.EndOfTurn;
    }

    async secondStep(stepContext) {
        const returnChoice = stepContext.context.activity.value.returnChoice;

        if (returnChoice === 'exchange') {
            return await stepContext.next();
        }

        await timeout(2000);
        await stepContext.context.sendActivity('Your Money will be refunded in your account within 5 days.');

        return await stepContext.endDialog();
    }


    async fourStep(stepContext) {
        return await stepContext.prompt(CHOICE_PROMPT_THREE, {
            prompt: 'Please select the appropriate size.',
            choices: ChoiceFactory.toChoices(['L', 'XL', 'XXL'])
        });
    }

    async finalStep(stepContext) {
        stepContext.values.size = stepContext.result.value;

        await stepContext.context.sendActivity(`Your order for size ${ stepContext.result.value } has been placed and will be delivered to you by ${ new Date(+new Date() + 5 * 86400000) }`);

        await timeout(4000);

        return await stepContext.endDialog();
    }

    createAdaptiveCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.ReturnOrder = ReturnOrder;
