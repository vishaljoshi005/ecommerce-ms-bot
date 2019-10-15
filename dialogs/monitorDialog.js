/* eslint-disable no-unused-vars */
const { ComponentDialog,
    WaterfallDialog,
    ChoiceFactory,
    ChoicePrompt,
    TextPrompt,
    Dialog } = require('botbuilder-dialogs');

const { ProductDb } = require('../config/db.config');

// const card = require('../monitorDialog.json');
const card = require('../resources/cards/monitorDialog.json');

const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

const TEXT_PROMPT = 'TEXT_PROMPT';
const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const CHOICE_PROMPT_ONE = 'CHOICE_PROMPT_ONE';
const CHOICE_PROMPT_TWO = 'CHOICE_PROMPT_TWO';

const MONITOR_DIALOG_WATERFALL = 'MONITOR_DIALOG_WATERFALL';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class MonitorDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'MONITOR_DIALOG');

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_TWO))
            .addDialog(new WaterfallDialog(MONITOR_DIALOG_WATERFALL, [
                this.showExisting.bind(this),
                this.askCompany.bind(this),
                this.askScreen.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MONITOR_DIALOG_WATERFALL;
    }

    async showExisting(stepContext) {
        await stepContext.context.sendActivity('Here are some top products');

        const products = await ProductDb.find({ device: 'monitor' });
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
        return await stepContext.prompt(TEXT_PROMPT_ONE, 'Do you want to customise monitor?');
    }

    async askCompany(stepContext) {
        console.log(stepContext.result);

        if (stepContext.result.toLowerCase() === 'yes' || stepContext.result.toLowerCase() === 'alright') {
            await stepContext.context.sendActivity({
                attachments: [this.createAdaptiveCard()]
            });

            return Dialog.EndOfTurn;
            //     return await stepContext.prompt(CHOICE_PROMPT_ONE,{
            //     prompt: 'Which company are you looking for?',
            //     choices: ChoiceFactory.toChoices(['Samsung', 'Dell' , 'Apple'])
            // });
        }
        return stepContext.endDialog();
    }

    async askScreen(stepContext) {
    // console.log(stepContext.context.activity.value.os.toLowerCase());

        await timeout(1000);

        await stepContext.context.sendActivity('Here\'s the best matching laptop according to your requirements');

        await timeout(2000);

        const url = await ProductDb.findOne({ device: 'monitor', brand: stepContext.context.activity.value.brand.toLowerCase() });
        // console.log(url);
        await stepContext.context.sendActivity({
            attachments: [this.createHeroCard(url.brand, url.image, url.url)]
        });

        await timeout(6000);
        return await stepContext.endDialog();


    // StepContext.values.company = StepContext.result.value;
    // return await StepContext.prompt(CHOICE_PROMPT_TWO,{
    //     prompt: 'Which screen size are you interested In?',
    //     choices: ChoiceFactory.toChoices(['21', '28' , '32'])
    // });
    }

    async finalStep(StepContext) {
        StepContext.values.screen = StepContext.result.value;

        // Query Database and show cards
        const url = await ProductDb.findOne({ brand: StepContext.values.company, device: 'monitor' });
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

module.exports.MonitorDialog = MonitorDialog;
