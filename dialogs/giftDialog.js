/* eslint-disable no-unused-vars */
const { ComponentDialog,
    Dialog,
    WaterfallDialog,
    ChoiceFactory,
    ChoicePrompt,
    TextPrompt } = require('botbuilder-dialogs');

const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

const { CancelAndHelpDialog } = require('./cancelHelpDialog');

// const card = require('../giftChoicesCard.json');
const card = require('../resources/cards/giftChoicesCard.json');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const GIFT_DIALOG = 'GIFT_DIALOG';
const GIFT_DIALOG_WATERFALL = 'GIFT_DIALOG_WATERFALL';

const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';

const CHOICE_PROMPT_ONE = 'CHOICE_PROMPT_ONE';
const CHOICE_PROMPT_TWO = 'CHOICE_PROMPT_TWO';
const CHOICE_PROMPT_THREE = 'CHOICE_PROMPT_THREE';

class GiftDialog extends ComponentDialog {
    constructor(id) {
        super(id || GIFT_DIALOG);

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_ONE))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_TWO))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT_THREE))
            .addDialog(new WaterfallDialog(GIFT_DIALOG_WATERFALL, [
                this.firstStep.bind(this),
                this.secondStep.bind(this),
                this.thirdStep.bind(this)
            ]));

        this.initialDialogId = GIFT_DIALOG_WATERFALL;
    }

    async firstStep(stepContext) {
        await stepContext.context.sendActivity('I am happy to help you find the perfect gift for your loved ones.');

        await timeout(1000);
        // await stepContext.context.sendActivity('Who is this gift for?');
        await timeout(2000);
        // await stepContext.context.sendActivity({
        //     attachments: [this.createHeroCardMale(), this.createHeroCardFemale()],
        //     attachmentLayout: AttachmentLayoutTypes.Carousel
        // });

        return await stepContext.next();
    }

    async secondStep(stepContext) {
        await stepContext.context.sendActivity({
            attachments: [this.createAdaptivecard()]
        });

        return Dialog.EndOfTurn;

        // return await stepContext.prompt(CHOICE_PROMPT_ONE, {
        //     prompt: "What is the age of the person this gift is for?",
        //     choices: ChoiceFactory.toChoices(['>10' , '10-20', '<20' ])
        // });
    }

    async thirdStep(stepContext) {
        console.log(stepContext.context.activity.value.age);

        switch (stepContext.context.activity.value.age) {
        case 'less' :
            await stepContext.context.sendActivity({
                attachments: [this.createHeroCardToy()],
                attachmentLayout: AttachmentLayoutTypes.Carousel
            });

            await timeout(3000);
            return await stepContext.endDialog();

        case 'between':
            await stepContext.context.sendActivity('I think they will love these new recommendations.');
            await timeout(2000);

            switch (stepContext.context.activity.value.interest) {
            case 'reading':
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardMotivational(), this.createHeroCardPhilosophical(), this.createHeroCardFiction()],
                    attachmentLayout: AttachmentLayoutTypes.Carousel
                });

                return await stepContext.endDialog();

            case 'video_game':
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardVideoGame()]
                });

                await timeout(2000);
                return await stepContext.endDialog();

            case 'outdoor_games':
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardRackets()]
                });
                await timeout(2000);
                return await stepContext.endDialog();
            }
            break;

        case 'more':

            await stepContext.context.sendActivity('I hope you like these recommendations.');

            switch (stepContext.context.activity.value.moreinterest) {
            case 'art':
                await stepContext.context.sendActivity('I recommend this great painting.');
                await timeout(2000);
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardArt()]
                });
                await timeout(4000);
                return stepContext.endDialog();

            case 'music':
                await stepContext.context.sendActivity('I personally like this album and it\'s been on top of the list when it came out for 1 month');
                await timeout(1000);
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardMusic()]
                });
                await timeout(2000);
                return stepContext.endDialog();

            case 'books':
                await stepContext.context.sendActivity('You will love these top choices of readers.');
                await timeout(1000);
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardMotivational(), this.createHeroCardPhilosophical(), this.createHeroCardFiction()],
                    attachmentLayout: AttachmentLayoutTypes.Carousel
                });
                await timeout(2000);
                return stepContext.endDialog();
            }
        }
    }

    async fourStep(stepContext) {
        if (stepContext.values.skip !== 'continue') {
            switch (stepContext.result.value) {
            case 'Reading':

                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardMotivational(), this.createHeroCardPhilosophical(), this.createHeroCardFiction()],
                    attachmentLayout: AttachmentLayoutTypes.Carousel
                });

                return await stepContext.endDialog();

            case 'Video Games':
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardVideoGame()]
                });

                await timeout(1000);
                return await stepContext.endDialog();

            case 'Outdoor Games':
                await stepContext.context.sendActivity({
                    attachments: [this.createHeroCardRackets()]
                });
                return await stepContext.endDialog();
            }
        }

        return await stepContext.endDialog();
    }

    createHeroCardArt() {
        return CardFactory.heroCard(
            'Painting',
            CardFactory.images(['https://i.ibb.co/cgVDF0B/paint.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Buy Now',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardMale() {
        return CardFactory.heroCard(
            'Male',
            CardFactory.images(['https://i.ibb.co/qY9tkj6/males.png']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Male',
                    value: 'Male'
                }
            ])
        );
    }

    createHeroCardFemale() {
        return CardFactory.heroCard(
            'Female',
            CardFactory.images(['https://i.ibb.co/71q8rm7/femailessasas.jpg']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Female',
                    value: 'Female'
                }
            ])
        );
    }

    createHeroCardToy() {
        return CardFactory.heroCard(
            'Baby Bear',
            CardFactory.images(['https://i.ibb.co/gm6CmGC/main.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'BUY NOW',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardMotivational() {
        return CardFactory.heroCard(
            'Motivational Books', // https://i.ibb.co/3hf3NMh/m.jpg
            CardFactory.images(['https://i.ibb.co/WKKt01B/mzzz.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Get Book',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardPhilosophical() {
        return CardFactory.heroCard(
            'Philosophical Books', // https://i.ibb.co/5YrsKqh/p.jpg
            CardFactory.images(['https://i.ibb.co/Bs0yLt9/pzzzz.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Get Book',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardFiction() {
        return CardFactory.heroCard(
            'Fiction Books', // https://i.ibb.co/NWJyR72/f.jpg
            CardFactory.images(['https://i.ibb.co/5kz0hpn/fictzzz.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Get Book',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardVideoGame() {
        return CardFactory.heroCard(
            'GTA X',
            CardFactory.images(['https://i.ibb.co/BNR6CWN/gta.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'BUY NOW',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardRackets() {
        return CardFactory.heroCard(
            'Badminton Racquets',
            CardFactory.images(['https://i.ibb.co/nL2bK66/rackets.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'BUY NOW',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createAdaptivecard() {
        return CardFactory.adaptiveCard(card);
    }

    createHeroCardMusic() {
        return CardFactory.heroCard(
            'Album',
            CardFactory.images(['https://i.ibb.co/hYY23VG/newmusoo.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Buy Now',
                    value: 'www.amazon.in'
                }
            ])
        );
    }
}

module.exports.GiftDialog = GiftDialog;
