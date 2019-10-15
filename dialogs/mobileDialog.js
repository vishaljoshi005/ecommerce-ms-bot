/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
const { ComponentDialog,
    WaterfallDialog,
    ChoiceFactory,
    ChoicePrompt,
    TextPrompt,
    Dialog } = require('botbuilder-dialogs');

const { ProductDb } = require('../config/db.config');

// const card = require('../mobileCard.json');
const card = require('../resources/cards/mobileCard.json');

const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

const TEXT_PROMPT = 'TEXT_PROMPT';
const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const CHOICE_PROMPT = 'CHOICE_PROMPT';

const MOBILE_DIALOG_WATERFALL = 'MOBILE_DIALOG_WATERFALL';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class MobileDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'MOBILE_DIALOG');

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(MOBILE_DIALOG_WATERFALL, [
                this.showExisting.bind(this),
                this.askCompany.bind(this),
                this.askbudget.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MOBILE_DIALOG_WATERFALL;
    }

    async showExisting(stepContext) {
        await stepContext.context.sendActivity('Here are some top products');

        const products = await ProductDb.find({ device: 'mobile' });
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
        return await stepContext.prompt(TEXT_PROMPT_ONE, ' Do you want to customise mobile?');
    }

    async askCompany(stepContext) {
        if (stepContext.result.toLowerCase() === 'yes' || stepContext.result.toLowerCase() === 'alright') {
            await stepContext.context.sendActivity({
                attachments: [this.createAdaptiveCard()]
            });

            return Dialog.EndOfTurn;
        }

        return await stepContext.endDialog();
    }

    async askbudget(stepContext) {
        await stepContext.context.sendActivity('Here\'s the best matching Mobile according to your requirements');

        await timeout(1000);

        const url = await ProductDb.findOne({ device: 'mobile', brand: stepContext.context.activity.value.company.toLowerCase() });
        // console.log(url);
        await stepContext.context.sendActivity({
            attachments: [this.createHeroCard(url.brand, url.image, url.url)]
        });

        await timeout(6000);
        return await stepContext.endDialog();
        // StepContext.values.company = StepContext.result.value;

        // return await StepContext.prompt(TEXT_PROMPT, {
        //     prompt: 'How much are you looking to spend? ex.60000'
        // });
    }

    async finalStep(StepContext) {
        StepContext.values.budget = StepContext.result;

        // Query Database and show cards
        const url = await ProductDb.findOne({ device: 'mobile', brand: StepContext.values.company });
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

module.exports.MobileDialog = MobileDialog;
