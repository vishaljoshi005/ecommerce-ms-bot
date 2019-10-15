const { Dialog, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { CardFactory, AttachmentLayoutTypes } = require('botbuilder');

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

        await stepContext.context.sendActivity({
            attachments: [
                this.createReceiptCardMouse(),
                this.createReceiptCardLaptop(),
                this.createReceiptCardMonitor()
            ],
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });

        await stepContext.context.sendActivity('Choose from above Or you can type in your order number.');
        return Dialog.EndOfTurn;
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

    createHeroCardMobile() {
        return CardFactory.heroCard(
            'Mobile',
            CardFactory.images(['https://i.ibb.co/kXcKFjc/neee.jpg']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Get Invoice',
                    value: 'mobile'

                }
            ])
        );
    }

    createHeroCardLaptop() {
        return CardFactory.heroCard(
            'Laptop',
            CardFactory.images(['https://i.ibb.co/drksR5q/newmac.jpg']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Get Invoice',
                    value: 'laptop'
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
                    type: 'imBack',
                    title: 'Get Invoice',
                    value: 'monitor'
                }
            ])
        );
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
}

module.exports.GetInvoice = GetInvoice;

// I was adding the user email and password for login
// implementing invoice
