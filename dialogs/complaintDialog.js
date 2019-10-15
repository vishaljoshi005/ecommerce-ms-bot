/* eslint-disable no-unused-vars */
const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { WaterfallDialog, Dialog, ComponentDialog } = require('botbuilder-dialogs');

const card = require('../resources/cards/ComplaintCard.json');

const { message, mail } = require('../config/email.config');

const COMPLAINT_DIALOG = 'COMPLAINT_DIALOG';
const COMPLAINT_DIALOG_WATERFALL = 'COMPLAINT_DIALOG_WATERFALL';

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class ComplaintDialog extends ComponentDialog {
    constructor(id) {
        super(id || COMPLAINT_DIALOG);

        this.addDialog(new WaterfallDialog(COMPLAINT_DIALOG_WATERFALL, [
            this.showCard.bind(this),
            this.sendEmail.bind(this)
        ]));

        this.initialDialogId = COMPLAINT_DIALOG_WATERFALL;
    }

    async showCard(stepContext) {
        await timeout(1000);
        await stepContext.context.sendActivity('I am here to help resolve your issue. Please fill the form below');
        await timeout(2000);
        await stepContext.context.sendActivity({
            attachments: [this.createComplaintCard()]
        });

        return await Dialog.EndOfTurn;
    }

    async sendEmail(stepContext) {
        const email = stepContext.context.activity.value.email.toLowerCase();
        console.log(`[ComplaintDialog] \n email is ${ email }`);
        const reason = stepContext.context.activity.value.reason;
        const inputMessage = stepContext.context.activity.value.message;

        message.to = `vishal.provis@gmail.com, ${ email }`;
        message.subject = reason;
        message.text = JSON.stringify(inputMessage);

        const mails = await mail.sendMail(message);
        console.log(mails);

        await timeout(2000);

        await stepContext.context
            .sendActivity(`I have registered your compliant under reason ${ reason },
         Please check your email for complaint number and other details.`);

        return await stepContext.endDialog();
    }

    createComplaintCard() {
        return CardFactory.adaptiveCard(card);
    }
}

module.exports.ComplaintDialog = ComplaintDialog;
