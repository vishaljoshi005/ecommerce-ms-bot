
const { InputHints } = require('botbuilder');
const { ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
class CancelAndHelpDialog extends ComponentDialog {

    async onContinueDialog(innerDc) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDc);
    }

    async interrupt(innerDc) {
        if (innerDc.context.activity.text) {
            const text = innerDc.context.activity.text.toLowerCase();

            switch (text) {
            case 'help':
            case '?':
                const cancelMessageTexts = 'Cancelling...';
                await innerDc.context.sendActivity(cancelMessageTexts, cancelMessageTexts, InputHints.IgnoringInput);
                await timeout(5000);
                return await innerDc.replaceDialog('MAIN_DIALOG_WATERFALL');
                // return await innerDc.cancelAllDialogs();
            case 'cancel':
            case 'quit':
                const cancelMessageText = 'Cancelling...';
                await innerDc.context.sendActivity(cancelMessageText, cancelMessageText, InputHints.IgnoringInput);
                await timeout(5000);
                return await innerDc.replaceDialog('MAIN_DIALOG_WATERFALL');
                // return await innerDc.cancelAllDialogs();
            }
        }
    }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
