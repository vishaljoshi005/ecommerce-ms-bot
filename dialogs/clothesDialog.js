/* eslint-disable no-unused-vars */
const { WaterfallDialog, TextPrompt, ComponentDialog } = require('botbuilder-dialogs');

const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');

const { ProductDb } = require('../config/db.config');

const CLOTHES_DIALOG = 'CLOTHES_DIALOG';
const CLOTHES_DIALOG_WATERFALL = 'CLOTHES_DIALOG_WATERFALL';

const TEXT_PROMPT_ONE = 'TEXT_PROMPT_ONE';
const TEXT_PROMPT_TWO = 'TEXT_PROMPT_TWO';
const TEXT_PROMPT_THREE = 'TEXT_PROMPT_THREE';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class ClothesDialog extends ComponentDialog {
    constructor(id) {
        super(id || CLOTHES_DIALOG);

        this.productDetails = {};

        this.addDialog(new TextPrompt(TEXT_PROMPT_ONE))
            .addDialog(new TextPrompt(TEXT_PROMPT_TWO))
            .addDialog(new TextPrompt(TEXT_PROMPT_THREE))
            .addDialog(new WaterfallDialog(CLOTHES_DIALOG_WATERFALL, [
                this.askProduct.bind(this),
                this.askColor.bind(this),
                this.askSize.bind(this),
                this.askBrand.bind(this),
                this.final.bind(this)
            ]));

        this.initialDialogId = CLOTHES_DIALOG_WATERFALL;
    }

    async askProduct(stepContext) {
        this.productDetails = stepContext.options;

        if (!this.productDetails.product) {
            return await stepContext.prompt(TEXT_PROMPT_ONE, 'Please enter the product you are looking for?');
        }

        return await stepContext.next(this.productDetails.product);
    }

    async askColor(stepContext) {
        this.productDetails.product = stepContext.result;

        if (!this.productDetails.color) {
            return await stepContext.prompt(TEXT_PROMPT_TWO, `Please enter the color of the ${ this.productDetails.product } you are looking for?`);
        }

        return await stepContext.next(this.productDetails.color);
    }

    async askSize(stepContext) {
        this.productDetails.color = stepContext.result;

        if (!this.productDetails.size) {
            return await stepContext.prompt(TEXT_PROMPT_THREE, `Please enter the size of the ${ this.productDetails.product } you are looking for?`);
        }

        return await stepContext.next(this.productDetails.size);
    }

    async askBrand(stepContext) {
        this.productDetails.size = stepContext.result;

        if (!this.productDetails.brand) {
            return await stepContext.prompt(TEXT_PROMPT_THREE, `Please enter the brand of the ${ this.productDetails.product } you are looking for?`);
        }

        return await stepContext.next(this.productDetails.brand);
    }

    async final(stepContext) {
        this.productDetails.brand = stepContext.result;
        const attach = [];

        const result = await ProductDb.find({ product: this.getProduct(this.productDetails.product) });

        result.forEach((element) => {
            attach.push(this.createHeroCardOne(element.product, element.brand, element.description, element.image));
        });

        await stepContext.context.sendActivity({
            attachments: attach, // attach
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });

        await stepContext.context.sendActivity(`Here are the collected details Product ${ this.productDetails.product } , Size ${ this.productDetails.size } and color ${ this.productDetails.color } and brand: ${ this.productDetails.brand }`);

        await timeout(5000);
        return await stepContext.endDialog();
    }

    getProduct(product) {
        switch (product) {
        case 'jeans':
        case 'jean':
            return 'jeans';

        case 'sweatshirts':
        case 'sweatshirt':
            return 'sweatshirt';

        case 'jacket':
        case 'jackets':
            return 'jacket';

        case 'shirt':
        case 'shirts':
            return 'shirt';
        }
    }

    createHeroCardOne(product, brand, description, imageUrl) {
        return {
            contentType: 'application/vnd.microsoft.card.hero',
            content: {
                title: `${ product }\n     Price : Rs 600`,
                subtitle: brand,
                text: `${ description }`,
                images: [
                    {
                        url: imageUrl
                    }
                ],
                buttons: [
                    {
                        type: 'openUrl',
                        title: 'BUY now',
                        value: 'www.amazon.com'
                    }
                ]
            }
        };
    }
}
module.exports.ClothesDialog = ClothesDialog;
