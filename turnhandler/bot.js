/* eslint-disable no-unused-vars */
const { ActivityHandler } = require('botbuilder');
const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

const DIALOG_STATE = 'DIALOG_STATE';
const USER_INFO_STATE = 'USER_INFO_STATE';

class Bot extends ActivityHandler {
    constructor(conversationState, userState, botManager) {
        super();
        this.botManager = botManager;
        this.conversationState = conversationState;
        this.userState = userState;

        this.dialogState = this.conversationState.createProperty(DIALOG_STATE);

        this.onMessage(async (context, next) => {
            await this.botManager.run(context, this.dialogState);

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            for (const id in context.activity.membersAdded) {
                if (context.activity.membersAdded[id].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hi, I\'m an eCommerce virtual assistant bot. Here are some things I can help you with.');
                    await context.sendActivity({
                        attachments: [this.createHeroCardFind(),
                            this.createHeroCardManage(),
                            this.createHeroCardGift(),
                            this.createHeroCardGetInvoice(),
                            this.createHeroCardRegisterComplaint()],
                        attachmentLayout: AttachmentLayoutTypes.Carousel
                    });
                    await context.sendActivity('What would you like to do? You can choose from above or type your query.');
                }
            }
            await next();
        });

        this.onDialog(async (context, next) => {
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
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

    // Card methods

    createHeroCardFind() {
        return CardFactory.heroCard(
            'Search Product',
            CardFactory.images(['https://i.ibb.co/vhMsr9k/search-product.jpg']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Find Products',
                    value: 'Find Products'
                }
            ])
        );
    }

    createHeroCardManage() {
        return CardFactory.heroCard(
            'Manage orders',
            CardFactory.images(['https://i.ibb.co/rQfNQ6H/manageorder.jpg']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Manage Order',
                    value: 'Manage Order'
                }
            ])
        );
    }

    createHeroCardGift() {
        return CardFactory.heroCard(
            'Find Perfect Gift',
            CardFactory.images(['https://i.ibb.co/RDv3cx7/findgift.jpg']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Find Gift',
                    value: 'Find Gift'
                }
            ])
        );
    }

    createHeroCardGetInvoice() {
        return CardFactory.heroCard(
            'Get Invoice',
            CardFactory.images(['https://i.ibb.co/zSxn88J/invoice.jpg']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Get Invoice',
                    value: 'Get Invoice'
                }
            ])
        );
    }

    createHeroCardRegisterComplaint() {
        return CardFactory.heroCard(
            'Register Complaint',
            CardFactory.images(['https://i.ibb.co/g4vmNcf/registercomplaint.png']),
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Register Complaint',
                    value: 'Register Complaint'
                }
            ])
        );
    }
}

module.exports.Bot = Bot;
