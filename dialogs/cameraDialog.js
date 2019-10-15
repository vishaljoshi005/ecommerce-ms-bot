/* eslint-disable no-unused-vars */
const { ComponentDialog,
    WaterfallDialog,
    ChoiceFactory,
    ChoicePrompt,
    TextPrompt,
    Dialog } = require('botbuilder-dialogs');

const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

const { ProductDb } = require('../config/db.config');

const card = require('../resources/cards/CameraCard.json');

const TEXT_PROMPT = 'TEXT_PROMPT';
const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const CHOICE_PROMPT = 'CHOICE_PROMPT';

const CAMERA_DIALOG_WATERFALL = 'CAMERA_DIALOG_WATERFALL';
const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class CameraDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'CAMERA_DIALOG');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(CAMERA_DIALOG_WATERFALL, [
                this.showExisting.bind(this),
                this.askPixel.bind(this),
                this.askbudget.bind(this)
            ]));

        this.initialDialogId = CAMERA_DIALOG_WATERFALL;
    }

    async showExisting(stepContext) {
        await stepContext.context.sendActivity('Here are some top products');

        const products = await ProductDb.find({ device: 'camera' });
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
        return await stepContext.prompt(TEXT_PROMPT_ONE, 'Do you want to customise?');
    }

    async askPixel(stepContext) {
        if (stepContext.result.toLowerCase() === 'yes' || stepContext.result.toLowerCase() === 'alright' || stepContext.result.toLowerCase() === 'ok') {
            await stepContext.context.sendActivity({
                attachments: [this.createAdaptiveCard()]
            });

            return Dialog.EndOfTurn;
        }
        return await stepContext.endDialog();
    }

    async askbudget(stepContext) {
        await stepContext.context.sendActivity('Here\'s the best matching camera according to your requirements');

        await timeout(1000);

        const url = await ProductDb.findOne({ device: 'camera', mp: '32MP' });
        await stepContext.context.sendActivity({
            attachments: [this.createHeroCard(url.device, url.image, url.url)]
        });

        await timeout(6000);
        return await stepContext.endDialog();
    }

    async finalStep(StepContext) {
        StepContext.values.budget = StepContext.result;

        // Query Database and show cards
        const url = await ProductDb.findOne({ mp: StepContext.values.pixel });
        console.log(url);
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

module.exports.CameraDialog = CameraDialog;
