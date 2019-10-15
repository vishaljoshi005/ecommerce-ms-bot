/* eslint-disable no-unused-vars */
const { ComponentDialog, WaterfallDialog, Dialog, TextPrompt } = require('botbuilder-dialogs');
const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

// Generic context method
const { createGenericContext } = require('../helper/createGenericContext');

// Dialog ID
const BUY_PRODUCT = 'BUY_PRODUCT';
const BUY_PRODUCT_WATERFALL = 'BUY_PRODUCT_WATERFALL';
const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';

// Delay Function
const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class BuyProduct extends ComponentDialog {
    constructor(id, state, contextState) {
        super(id || BUY_PRODUCT);
        this.state = state;
        this.contextState = contextState;

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new WaterfallDialog(BUY_PRODUCT_WATERFALL, [
                this.checkEntity.bind(this),
                this.initiateDialog.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = BUY_PRODUCT_WATERFALL;
    }

    async checkEntity(stepContext) {
        console.log('[BUYPRODUCT DIALOG METHOD CHECK ENTITY]');
        console.log(stepContext.options);
        if (stepContext.options.product) {
            const product = stepContext.options.product;
            return await stepContext.next(product);
        }

        return await stepContext.prompt(TEXT_PROMPT_ONE, 'What are you looking for today? Please type in the product you are looking.');
    }

    async initiateDialog(stepContext) {
        const product = stepContext.result;
        return await this.beginEntity(product, stepContext);
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }

    // Main Catalouge
    createHeroCardMobile() {
        return CardFactory.heroCard(
            'Mobiles',
            CardFactory.images(['https://i.ibb.co/kXcKFjc/neee.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Learn More',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardLaptop() {
        return CardFactory.heroCard(
            'Laptops',
            CardFactory.images(['https://i.ibb.co/drksR5q/newmac.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Learn More',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardCamera() {
        return CardFactory.heroCard(
            'Camera',
            CardFactory.images(['https://i.ibb.co/p1TQ4Xw/newcam.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Learn More',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    createHeroCardMonitor() {
        return CardFactory.heroCard(
            'Monitor',
            CardFactory.images(['https://i.ibb.co/CWNk3F4/newmon.jpg']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Learn More',
                    value: 'www.amazon.in'
                }
            ])
        );
    }

    // Check for appropriate entity and begin dialog
    async beginEntity(product, stepContext) {
        switch (product) {
        case 'laptop' :
        case 'laptops':
        case 'computer':
        case 'computers' :
            await this.contextState.set(stepContext.context, createGenericContext('LAPTOP_DIALOG'));
            await this.state.saveChanges(stepContext.context);
            return await stepContext.beginDialog('LAPTOP_DIALOG');

        case 'mobile':
        case 'phone':
        case 'mobiles':
        case 'phones' :
            await this.contextState.set(stepContext.context, createGenericContext('MOBILE_DIALOG'));
            await this.state.saveChanges(stepContext.context);
            return await stepContext.beginDialog('MOBILE_DIALOG');

        case 'monitor':
        case 'monitors':
            await this.contextState.set(stepContext.context, createGenericContext('MONITOR_DIALOG'));
            await this.state.saveChanges(stepContext.context);
            return await stepContext.beginDialog('MONITOR_DIALOG');

        case 'camera':
        case 'cameras':
            await this.contextState.set(stepContext.context, createGenericContext('CAMERA_DIALOG'));
            await this.state.saveChanges(stepContext.context);
            return await stepContext.beginDialog('CAMERA_DIALOG');
        case 'gift':
        case 'gifts':
        case 'present':
            await this.contextState.set(stepContext.context, createGenericContext('GIFT_DIALOG'));
            await this.state.saveChanges(stepContext.context);
            return await stepContext.beginDialog('GIFT_DIALOG');

        case 'products':
        case 'product':
            await stepContext.context.sendActivity({
                attachments: [
                    this.createHeroCardMobile(),
                    this.createHeroCardCamera(),
                    this.createHeroCardLaptop(),
                    this.createHeroCardMonitor()
                ],
                attachmentLayout: AttachmentLayoutTypes.Carousel
            });
            // await stepContext.context.sendActivity('What are you looking for today?');
            return await stepContext.replaceDialog(this.id);

        case 'jean':
        case 'jeans':
        case 'shirt':
        case 'shirts':
        case 'jacket':
        case 'jackets':
        case 'sweatshirt':
        case 'sweatshirts':
            await this.contextState.set(stepContext.context, createGenericContext('CLOTHES_DIALOG'));
            await this.state.saveChanges(stepContext.context);
            console.log('[Inside switch case]');
            console.log(stepContext.options);
            return await stepContext.beginDialog('CLOTHES_DIALOG', stepContext.options);

        default:
            console.log(`Switch case default`);
            await stepContext.sendActivity(`I'm currently working to add new products.`);
            await timeout(5000);
            return await stepContext.endDialog();
        }
    }
}

module.exports.BuyProduct = BuyProduct;
