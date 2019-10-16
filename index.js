/* eslint-disable no-unused-vars */
// Packages Imports
const restify = require('restify');
const { BotFrameworkAdapter, UserState, ConversationState } = require('botbuilder');
const { CosmosDbStorage } = require('botbuilder-azure');

// Enviroment variable setup
const dotenv = require('dotenv');
const path = require('path');
const ENV = path.join(__dirname, '.env');
dotenv.config({ path: ENV });

const PORT = process.env.PORT || 3978;

// Handler Import
const { Bot } = require('./turnhandler/bot');
const { MainDialog } = require('./turnhandler/mainDialog');

// Dialog Imports
const { LaptopDialog } = require('./dialogs/laptopDialog');
const { MobileDialog } = require('./dialogs/mobileDialog');
const { MonitorDialog } = require('./dialogs/monitorDialog');
const { CameraDialog } = require('./dialogs/cameraDialog');
const { ManageOrder } = require('./dialogs/manageOrder');
const { WhereOrder } = require('./dialogs/whereOrder');
const { CancelOrder } = require('./dialogs/cancelOrder');
const { ReturnOrder } = require('./dialogs/returnOrder');
const { GiftDialog } = require('./dialogs/giftDialog');
const { ComplaintDialog } = require('./dialogs/complaintDialog');
const { GetInvoice } = require('./dialogs/getInvoice');
const { ClothesDialog } = require('./dialogs/clothesDialog');
const { BuyProduct } = require('./dialogs/buyProductDialog');

// Id's For dialog
const LAPTOP_DIALOG = 'LAPTOP_DIALOG';
const CLOTHES_DIALOG = 'CLOTHES_DIALOG';
const GET_INVOICE = 'GET_INVOICE';
const GIFT_DIALOG = 'GIFT_DIALOG';
const RETURN_ORDER = 'RETURN_ORDER';
const CANCEL_ORDER = 'CANCEL_ORDER';
const WHERE_ORDER = 'WHERE_ORDER';
const MANAGE_ORDER = 'MANAGE_ORDER';
const MOBILE_DIALOG = 'MOBILE_DIALOG';
const CAMERA_DIALOG = 'CAMERA_DIALOG';
const MONITOR_DIALOG = 'MONITOR_DIALOG';
const COMPLAINT_DIALOG = 'COMPLAINT_DIALOG';
const BUY_PRODUCT = 'BUY_PRODUCT';

const server = restify.createServer();

// Initialize Adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Storage configurations
const storage = new CosmosDbStorage({
    serviceEndpoint: process.env.DB_SERVICE_ENDPOINT,
    authKey: process.env.AUTH_KEY,
    databaseId: process.env.DATABASE,
    collectionId: process.env.COLLECTION
});

const userState = new UserState(storage);
const conversationState = new ConversationState(storage);

// State Properties for saving context
const CONTEXT_STATE = 'CONTEXT_STATE';
const contextState = userState.createProperty(CONTEXT_STATE);

// State Properties for saving userInformation
const USER_INFORMATION = 'USER_INFORMATION';
const userInfoState = userState.createProperty(USER_INFORMATION);

// Luis COnfigs
const { LuisAppId, LuisApiKey, LuisHostname } = process.env;
const luisConfig = { applicationId: LuisAppId, endpointKey: LuisApiKey, endpoint: LuisHostname };

// Initialize Dialogs
const cancelOrder = new CancelOrder(CANCEL_ORDER);
const returnOrder = new ReturnOrder(RETURN_ORDER);
const whereOrder = new WhereOrder(WHERE_ORDER);

const manageOrder = new ManageOrder(MANAGE_ORDER, cancelOrder, returnOrder, whereOrder);

const laptopDialog = new LaptopDialog(LAPTOP_DIALOG);
const mobileDialog = new MobileDialog(MOBILE_DIALOG);
const cameraDialog = new CameraDialog(CAMERA_DIALOG);
const monitorDialog = new MonitorDialog(MONITOR_DIALOG);
const complaintDialog = new ComplaintDialog(COMPLAINT_DIALOG);
const giftDialog = new GiftDialog(GIFT_DIALOG);
const getInvoice = new GetInvoice(GET_INVOICE);
const clothesDialog = new ClothesDialog(CLOTHES_DIALOG);
const buyProductDialog = new BuyProduct(BUY_PRODUCT, userState, contextState);

// Initialize Main Dialog
const BotManager = new MainDialog(luisConfig, userState, contextState, userInfoState, laptopDialog, mobileDialog,
    cameraDialog, monitorDialog, manageOrder,
    giftDialog, complaintDialog, getInvoice, clothesDialog, buyProductDialog);

// Initialize Turn Handler
const bot = new Bot(conversationState, userState, BotManager);

// Generic Error Handler
adapter.onTurnError = async (context, error) => {
    console.error(`\n [OnTurnError] ${ error }`);
    console.log(error);
    await context.sendActivity('Please try again later');

    await conversationState.load(context);
    await conversationState.clear(context);

    await conversationState.saveChanges(context, false);
};

// Initialize server and EndPoint for messages

server.listen(PORT, () => {
    console.log(`ChatBot is up and running at port ${ server.url }`);
});

server.post('/api/ecommerce', async (request, response) => {
    adapter.processActivity(request, response, async (context) => {
        // add handler
        await bot.run(context);
    });
});
