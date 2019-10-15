const { Dialog,
    WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { CardFactory } = require('botbuilder');
const { User } = require('../models/userModel');

const card = require('../resources/cards/loginCard.json');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const LOGIN_DIALOG = 'LOGIN_DIALOG';
const LOGIN_DIALOG_WATERFALL = 'LOGIN_DIALOG_WATERFAL';

let gotoDialog = '';

class LoginDialog extends ComponentDialog {
    constructor(id, userState, userInfoState) {
        super(id || LOGIN_DIALOG);

        this.userInfoState = userInfoState;
        this.userState = userState;

        this.addDialog(new WaterfallDialog(LOGIN_DIALOG_WATERFALL, [
            this.loginCard.bind(this),
            this.afterSubmit.bind(this)
        ]));

        this.initialDialogId = LOGIN_DIALOG_WATERFALL;
    }

    async loginCard(stepContext) {
        stepContext.values.userInfo = new User();

        gotoDialog = stepContext.options.dialog;

        await stepContext.context.sendActivity({
            attachments: [this.createLoginCard()]
        });
        return await Dialog.EndOfTurn;
    }

    async afterSubmit(stepContext) {
        const userProfile = await this.userInfoState.get(stepContext.context, new User());
        stepContext.values.userInfo.email = stepContext.context.activity.value.email.toLowerCase();
        stepContext.values.userInfo.password = stepContext.context.activity.value.password.toLowerCase();

        console.log('[LOGIN Dialog JS] UserProfile state object');
        console.log(userProfile);

        console.log(stepContext.values.userInfo);

        await this.userInfoState.set(stepContext.context, stepContext.values.userInfo);
        await this.userState.saveChanges(stepContext.context, false);
        await timeout(2000);

        return await stepContext.beginDialog(gotoDialog);
    }

    createLoginCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.LoginDialog = LoginDialog;
