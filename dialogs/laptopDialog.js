/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { ComponentDialog,
    WaterfallDialog,
    TextPrompt,
    ChoicePrompt,
    ChoiceFactory,
    Dialog
} = require('botbuilder-dialogs');

const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

const LAPTOP_DIALOG_WATERfALL = 'LAPTOP_DIALOG_WATERfALL';
const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const CHOICE_PROMPT_ONE = 'CHOICE_PROMPT_ONE';
const CHOICE_PROMPT_TWO = 'CHOICE_PROMPT_TWO';
const CHOICE_PROMPT_THREE = 'CHOICE_PROMPT_THREE';
const CHOICE_PROMPT_FOUR = 'CHOICE_PROMPT_FOUR';

const { ProductDb } = require('../config/db.config');

const card = require('../resources/cards/AdaptiveCardLaptop.json');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class LaptopDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        // Add waterfall steps in here
        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_TWO))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_THREE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_FOUR))
            .addDialog(new WaterfallDialog(LAPTOP_DIALOG_WATERfALL, [
                this.showExisting.bind(this),
                this.askOs.bind(this),
                this.askScreen.bind(this)
            // this.askRam.bind(this),
            // this.askProcessor.bind(this),
            // this.finalStep.bind(this),
            ]));

        this.initialDialogId = LAPTOP_DIALOG_WATERfALL;

        // console.log(this.id);
    }

    async showExisting(stepContext) {
        await stepContext.context.sendActivity('Here are some top products');

        const products = await ProductDb.find({ device: 'laptop' });
        const holder = [];

        products.forEach(element => {
            holder.push(this.createHeroCard(element.brand, element.image, element.url));
        });

        await stepContext.context.sendActivity({
            attachments: holder,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });

        await timeout(3000);
        await stepContext.context.sendActivity('Or you can also filter product');
        // TEMP
        return await stepContext.prompt(TEXT_PROMPT_ONE, 'Do you want a customised laptop');
    }

    async askOs(stepContext) {
        console.log(stepContext.result.toLowerCase());

        if (stepContext.result.toLowerCase() === 'yes' || stepContext.result.toLowerCase() === 'ok') {
            console.log('in this');
            await stepContext.context.sendActivity({
                attachments: [this.createAdaptiveCard()]
            });

            return Dialog.EndOfTurn;
        }
        return await stepContext.endDialog();
    }

    async askScreen(stepContext) {
        console.log(stepContext.context.activity.value.os.toLowerCase());

        await stepContext.context.sendActivity('Here\'s the best matching laptop according to your requirements');

        await timeout(2000);

        const url = await ProductDb.findOne({ device: 'laptop', brand: stepContext.context.activity.value.os.toLowerCase() });
        await stepContext.context.sendActivity({
            attachments: [this.createHeroCard(url.brand, url.image, url.url)]
        });

        await timeout(4000);
        return await stepContext.endDialog();
    }

    async askRam(StepContext) {
        StepContext.values.screen = StepContext.result.value;
        return await StepContext.prompt(CHOICE_PROMPT_THREE, {
            prompt: 'How much Ram do you need?',
            choices: ChoiceFactory.toChoices(['4GB', '8GB'])
        });
    }

    async askProcessor(StepContext) {
        StepContext.values.ram = StepContext.result.value;
        return await StepContext.prompt(CHOICE_PROMPT_FOUR, {
            prompt: 'Which processor do you need?',
            choices: ChoiceFactory.toChoices(['i5', 'i7'])
        });
    }

    async finalStep(StepContext) {
        StepContext.values.processor = StepContext.result.value;
        // Database query for fecthing the product URL
        const url = await ProductDb.findOne({ device: 'laptop', brand: StepContext.values.os });
        await StepContext.context.sendActivity({
            attachments: [this.createHeroCard(url.brand, url.image, url.url)]
        });

        await timeout(5000);
        return await StepContext.endDialog();
    }

    createHeroCard(title, imageUrl, productUrl) {
        return CardFactory.heroCard(
            title,
            CardFactory.images([imageUrl]),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Buy Now',
                    value: productUrl
                }
            ])
        );
    }

    createAdaptiveCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.LaptopDialog = LaptopDialog;
