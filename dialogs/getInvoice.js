const { Dialog, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');

const { Invoice } = require('../config/db.config');

const GET_INVOICE = 'GET_INVOICE';
const GENERATE_INVOICE_WATERFALL = 'GENERATE_INVOICE_WATERFALL';

class GetInvoice extends ComponentDialog {
    constructor(id) {
        super(id || GET_INVOICE);

        this.addDialog(new WaterfallDialog(GENERATE_INVOICE_WATERFALL, [
            this.showExistingOrders.bind(this),
            this.secondStep.bind(this)
        ]));

        this.initialDialogId = GENERATE_INVOICE_WATERFALL;
    }

    async showExistingOrders(stepContext) {
        await stepContext.context.sendActivity('Here are your recent orders.');
        const productData = [];
        const orders = await Invoice.find({});

        orders.forEach((element) => {
            productData
                .push(this.createReceiptCardData(element.product, element.image, element.orderNumber,
                    element.paymentMethod, element.price, element.tax, element.total));
        });
        console.log(productData.length);
        await stepContext.context.sendActivity({
            attachments: productData,
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });

        await stepContext.context.sendActivity('Choose from above Or you can type in your order number.');
        return stepContext.endDialog();
    }

    async secondStep(stepContext) {
        const input = stepContext.result;

        if (input === 'mobile' || input === 'monitor' || input === 'laptop') {
            await stepContext.context.sendActivity(`You will receive ${ input } invoice in your email`);
            return await stepContext.endDialog();
        }

        await stepContext.context.sendActivity(`You will receive ${ input } invoice in your email`);
        return await stepContext.endDialog();
    }

    createReceiptCardMouse() {
        return CardFactory.adaptiveCard({
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    size: 'Medium',
                    weight: 'Bolder',
                    text: 'Receipt',
                    horizontalAlignment: 'Center',
                    fontType: 'Monospace'
                },
                {
                    type: 'TextBlock',
                    text: 'Mouse'
                },
                {
                    type: 'Image',
                    altText: '',
                    url: 'https://i.ibb.co/WgNDMr8/mouse.jpg'
                },
                {
                    type: 'FactSet',
                    facts: [
                        {
                            title: 'Order Number:',
                            value: '1212'
                        },
                        {
                            title: 'Payment Method',
                            value: 'Visa 0000-xxxx'
                        },
                        {
                            title: 'Price',
                            value: '100'
                        },
                        {
                            title: 'Tax',
                            value: '20'
                        },
                        {
                            title: 'Total ',
                            value: '120'
                        }
                    ]
                }
            ],
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.0'
        });
    }

    createReceiptCardLaptop() {
        return CardFactory.adaptiveCard({
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    size: 'Medium',
                    weight: 'Bolder',
                    text: 'Receipt',
                    horizontalAlignment: 'Center',
                    fontType: 'Monospace'
                },
                {
                    type: 'TextBlock',
                    text: 'Laptop'
                },
                {
                    type: 'Image',
                    altText: '',
                    url: 'https://i.ibb.co/JBqBzrH/Lap.jpg'
                },
                {
                    type: 'FactSet',
                    facts: [
                        {
                            title: 'Order Number:',
                            value: '4565'
                        },
                        {
                            title: 'Payment Method',
                            value: 'Visa 0000-xxxx'
                        },
                        {
                            title: 'Price',
                            value: '500'
                        },
                        {
                            title: 'Tax',
                            value: '100'
                        },
                        {
                            title: 'Total ',
                            value: '600'
                        }
                    ]
                }
            ],
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.0'
        });
    }

    createReceiptCardMonitor() {
        return CardFactory.adaptiveCard({
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    size: 'Medium',
                    weight: 'Bolder',
                    text: 'Receipt',
                    horizontalAlignment: 'Center',
                    fontType: 'Monospace'
                },
                {
                    type: 'TextBlock',
                    text: 'Monitor'
                },
                {
                    type: 'Image',
                    altText: '',
                    url: 'https://i.ibb.co/QCy3ZkS/lori.jpg'
                },
                {
                    type: 'FactSet',
                    facts: [
                        {
                            title: 'Order Number:',
                            value: '2658'
                        },
                        {
                            title: 'Payment Method',
                            value: 'Visa 0000-xxxx'
                        },
                        {
                            title: 'Price',
                            value: '300'
                        },
                        {
                            title: 'Tax',
                            value: '60'
                        },
                        {
                            title: 'Total ',
                            value: '360'
                        }
                    ]
                }
            ],
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.0'
        });
    }

    createReceiptCardData(product, image, orderNumber, paymentMethod, price, tax, total) {
        return CardFactory.adaptiveCard({
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    size: 'Medium',
                    weight: 'Bolder',
                    text: 'Receipt',
                    horizontalAlignment: 'Center',
                    fontType: 'Monospace'
                },
                {
                    type: 'TextBlock',
                    text: product
                },
                {
                    type: 'Image',
                    altText: '',
                    url: image
                },
                {
                    type: 'FactSet',
                    facts: [
                        {
                            title: 'Order Number:',
                            value: orderNumber
                        },
                        {
                            title: 'Payment Method',
                            value: paymentMethod
                        },
                        {
                            title: 'Price',
                            value: price
                        },
                        {
                            title: 'Tax',
                            value: tax
                        },
                        {
                            title: 'Total ',
                            value: total
                        }
                    ]
                }
            ],
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.0'
        });
    }
}

module.exports.GetInvoice = GetInvoice;
