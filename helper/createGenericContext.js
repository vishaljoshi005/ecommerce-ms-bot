// eslint-disable-next-line no-unused-vars
function createGenericContext(value) {
    switch (value) {
    case 'Manage Order':
    case 'ManageOrder':
    case 'MANAGE_ORDER':
        return 'MANAGE_ORDER';

    // Check this explicitly
    case 'BuyProduct':
    case 'Find Products':
        return 'BUY_PRODUCT';

    case 'Get Invoice':
    case 'GetInvoice':
    case 'GET_INVOICE':
        return 'GET_INVOICE';

    case 'Register Complaint':
    case 'RegisterComplaint':
    case 'REGISTER_COMPLAINT':
        return 'COMPLAINT_DIALOG';

    case 'Find Gift':
    case 'GIFT_DIALOG':
        return 'GIFT_DIALOG';

    case 'MONITOR_DIALOG':
        return 'MONITOR_DIALOG';

    case 'CAMERA_DIALOG':
        return 'CAMERA_DIALOG';

    case 'LAPTOP_DIALOG':
        return 'LAPTOP_DIALOG';

    case 'MOBILE_DIALOG':
        return 'MOBILE_DIALOG';

    case 'CLOTHES_DIALOG':
        return 'CLOTHES_DIALOG';

    default:
        return 'None';
    }
}

module.exports.createGenericContext = createGenericContext;
