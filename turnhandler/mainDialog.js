/* eslint-disable no-unused-vars */
const { ComponentDialog } = require('botbuilder-dialogs');
// eslint-disable-next-line no-unused-vars
const { AttachmentLayoutTypes, CardFactory, ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');

const { LuisConfig } = require('../config/luis.config');
const { LoginDialog } = require('../dialogs/loginDialog');

const { DialogSet, DialogTurnStatus, WaterfallDialog, ChoiceFactory, ChoicePrompt, TextPrompt, Dialog } = require('botbuilder-dialogs');

// helper method
const { createGenericContext } = require('../helper/createGenericContext');
const LOGIN_DIALOG = 'LOGIN_DIALOG';

const USER_INFO_STATE = 'USER_INFO_STATE';
// const USER_CONTEXT_INFO = 'USER_CONTEXT_INFO';

const TEXT_PROMPT_TWO = 'TEXT_PROMPT_TWO';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class MainDialog extends ComponentDialog {
    constructor(config, userState, contextState, userInfoState, LaptopDialog, MobileDialog, CameraDialog,
        MonitorDialog, ManageOrder, GiftDialog, complaintDialog, getInvoice, clothesDialog, buyProductDialog) {
        super('MAIN_DIALOG');

        this.luis = new LuisConfig(config);

        // userinformation Variable
        // eslint-disable-next-line prefer-const
        this.userInformation = null;

        this.userState = userState;

        // this was for saving login data of user
        // this.userInfoState = this.userState.createProperty(USER_INFO_STATE);
        this.userInfoState = userInfoState;

        // This is for tracking context
        // this.userContextInfo = this.userState.createProperty(USER_CONTEXT_INFO);
        this.contextState = contextState;

        this.loginDialog = new LoginDialog(LOGIN_DIALOG, this.userState, this.userInfoState);

        this.addDialog(LaptopDialog)
            .addDialog(MobileDialog)
            .addDialog(CameraDialog)
            .addDialog(MonitorDialog)
            .addDialog(ManageOrder)
            .addDialog(GiftDialog)
            .addDialog(complaintDialog)
            .addDialog(this.loginDialog)
            .addDialog(getInvoice)
            .addDialog(clothesDialog)
            .addDialog(buyProductDialog)
            .addDialog(new TextPrompt(TEXT_PROMPT_TWO))
            .addDialog(new WaterfallDialog('MAIN_DIALOG_WATERFALL', [
                this.start.bind(this),
                this.middle.bind(this),
                this.final.bind(this)
            ]
            ));

        this.initialDialogId = 'MAIN_DIALOG_WATERFALL';
    }

    // Main Dialogs Handler
    async run(context, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);

        const dialogResult = await dialogContext.continueDialog();
        console.log(`[MainDialog variable dialog result]`);
        console.log(dialogResult);
        if (dialogResult.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async start(stepContext) {
        let userInput = stepContext.context.activity.text;
        console.log(`[MAINDIALOG START STEP VARIABLE userInput] ${ userInput }`);

        // This here when the user changes context, userInput then processed by luis
        // This method is for handling the onContinuesMethod of this dialog
        if (stepContext.options.text) {
            console.log('Value is being manipulated from here');
            userInput = stepContext.options.text;
            // Test Code for LUIS
            stepContext.context.activity.text = userInput;
        }
        console.log('After stepcontext options');
        console.log(userInput);
        if (userInput === 'Find Products' || userInput === 'Manage Order' ||
        userInput === 'Find Gift' || userInput === 'Get Invoice' || userInput === 'Register Complaint') {
            // Variable for context property
            userInput = stepContext.context.activity.text;

            // set context for the flow
            await this.contextState.set(stepContext.context, createGenericContext(userInput));
            await this.userState.saveChanges(stepContext.context);

            switch (userInput) {
            case 'Find Products':
                console.log('[MainDialog switch userInput value]');
                console.log(userInput);
                return await stepContext.beginDialog('BUY_PRODUCT', { product: 'product' });

            case 'Manage Order':
                if (this.getUserInfo(stepContext)) {
                    return await stepContext.beginDialog('MANAGE_ORDER');
                }
                return await stepContext.beginDialog('LOGIN_DIALOG', { dialog: 'MANAGE_ORDER' });

            case 'Find Gift':
                return await stepContext.beginDialog('BUY_PRODUCT', { product: 'gift' });

            case 'Get Invoice':
                if (this.getUserInfo(stepContext)) {
                    return await stepContext.beginDialog('GET_INVOICE');
                }
                return await stepContext.beginDialog('LOGIN_DIALOG', { dialog: 'GET_INVOICE' });

            case 'Register Complaint':
                return await stepContext.beginDialog('COMPLAINT_DIALOG');
            }
        }

        const result = await this.luis.executeQuery(stepContext.context);
        console.log(`[MAINDIALOG START STEP]`);
        console.log(result);

        console.log(LuisRecognizer.topIntent(result));

        // Set Context based on LUIS result
        await this.contextState.set(stepContext.context, createGenericContext(LuisRecognizer.topIntent(result)));
        await this.userState.saveChanges(stepContext.context);

        if (LuisRecognizer.topIntent(result) === 'BuyProduct') {
            // This here checks for gift because its same intent but different entity type
            let product = null;
            if (this.luis.getGift(result)) {
                product = 'gift';
            }
            if (this.luis.getProduct(result)) {
                product = this.luis.getProduct(result).product;
            }
            return await stepContext.beginDialog('BUY_PRODUCT', {
                product,
                brand: this.luis.getBrand(result).brand,
                color: this.luis.getColor(result).color,
                size: this.luis.getSize(result).size
                // Add other options begin here
            });
        }

        if (LuisRecognizer.topIntent(result) === 'ManageOrder') {
            if (await this.getUserInfo(stepContext)) {
                console.log('inside method');
                console.log(this.getUserInfo(stepContext));
                return await stepContext.beginDialog('MANAGE_ORDER');
            }

            return await stepContext.beginDialog('LOGIN_DIALOG', { dialog: 'MANAGE_ORDER' });
        }

        if (LuisRecognizer.topIntent(result) === 'RegisterComplaint') {
            if (await this.getUserInfo(stepContext)) {
                return await stepContext.beginDialog('COMPLAINT_DIALOG');
            }

            return await stepContext.beginDialog('LOGIN_DIALOG', { dialog: 'COMPLAINT_DIALOG' });
        }

        if (LuisRecognizer.topIntent(result) === 'GetInvoice') {
            if (await this.getUserInfo(stepContext)) {
                return await stepContext.beginDialog('GET_INVOICE');
            }

            return await stepContext.beginDialog('LOGIN_DIALOG', { dialog: 'GET_INVOICE' });
        }

        if (LuisRecognizer.topIntent(result) === 'None') {
            return await stepContext.next();
        }
    }

    async middle(stepContext) {
        return await stepContext.prompt(TEXT_PROMPT_TWO, 'What else I can help you with?');
    }

    async final(stepContext) {
        await timeout(3000);
        await stepContext.cancelAllDialogs();
        return await stepContext.beginDialog(this.id, { text: stepContext.result });
    }

    // Card methods

    createHeroCardFind() {
        return CardFactory.heroCard(
            'Search Product',
            CardFactory.images(['https://i.ibb.co/vhMsr9k/search-product.jpg']), // 'https://i.ibb.co/1J6g20y/findpro.png'
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
            CardFactory.images(['https://i.ibb.co/rQfNQ6H/manageorder.jpg']), // https://i.ibb.co/86Jz57Y/orderman.jpg
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
            CardFactory.images(['https://i.ibb.co/RDv3cx7/findgift.jpg']), // https://i.ibb.co/jgVxqps/findgif.jpg
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
            CardFactory.images(['https://i.ibb.co/zSxn88J/invoice.jpg']), // https://i.ibb.co/m8dVp76/newinvoice.jpg
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
            CardFactory.images(['https://i.ibb.co/g4vmNcf/registercomplaint.png']), // https://i.ibb.co/59H2cFf/complaint-1.jpg
            CardFactory.actions([
                {
                    type: 'imBack',
                    title: 'Register Complaint',
                    value: 'Register Complaint'
                }
            ])
        );
    }

    // Helper method for getting saved user info

    async getUserInfo(stepContext) {
        return await this.userInfoState.get(stepContext.context, null);
    }

    // Check if user has changed the running dialog
    async onContinueDialog(innerDc) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDc);
    }

    async interrupt(innerDc) {
        if (innerDc.context.activity.text) {
            const userText = innerDc.context.activity.text.toLowerCase();
            console.log(`[Interrupt method VARIABLE userText] ${ userText }`);

            switch (userText) {
            case 'help':
            case 'start over':
            case 'restart':
            case 'stop':
            case 'cancel':
                await this.intro(innerDc);
                return await innerDc.cancelAllDialogs();
            }

            if (await this.contextState.get(innerDc.context, null)) {
                const LUIS_RESULT = await this.luis.executeQuery(innerDc.context);
                console.log(`LUIS RESULT SECOND ${ LuisRecognizer.topIntent(LUIS_RESULT) }`);

                const CONVO_CONTEXT = createGenericContext(LuisRecognizer.topIntent(LUIS_RESULT));
                console.log(`[CONVO_CONTEXT] \n ${ CONVO_CONTEXT }`);

                const SAVED_CONTEXT = await this.contextState.get(innerDc.context);
                console.log(`[saved_CONTEXT] \n ${ SAVED_CONTEXT }`);

                if (CONVO_CONTEXT === SAVED_CONTEXT || CONVO_CONTEXT === 'None') {
                    return null;
                }
                // Test code
                await innerDc.cancelAllDialogs();
                return await innerDc.beginDialog(this.id, { text: innerDc.context.activity.text });
            }
        }
    }

    async intro(stepContext) {
        await stepContext.context.sendActivity('Here are some things I can help you with');

        await stepContext.context.sendActivity({
            attachments: [
                this.createHeroCardFind(),
                this.createHeroCardManage(),
                this.createHeroCardGift(),
                this.createHeroCardGetInvoice(),
                this.createHeroCardRegisterComplaint()],
            attachmentLayout: AttachmentLayoutTypes.Carousel
        });

        await timeout(2000);
        await stepContext.context.sendActivity('What would you like to do? You can choose from above or type your query.');
    }
    // eslint-disable-next-line no-trailing-spaces
}

module.exports.MainDialog = MainDialog;
