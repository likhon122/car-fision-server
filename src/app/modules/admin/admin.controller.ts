import AppError from "../../error/AppError"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { adminServices } from "./admin.services"

// user block controller
const userBlockController = catchAsync(async (req, res) => {
    const userId = req.params.userId
    const {status} = req.body
    const result = await adminServices.adminBlockUserFromDB(userId, status)
    if (!result) {
        throw new AppError(404, 'User not found !');
    }
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'User blocked successfully',
    })

})
const getAllUser = catchAsync(async (req, res) => {
    const query = req.query
    const result = await adminServices.getAllUser(query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User is retrieved successfully',
        meta: result.meta,
        data: result.result,
    });
});
const getAllOrderController = catchAsync(async (req, res) => {
    const query = req.query
    const result = await adminServices.getAllOrder(query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order retrieved successfully',
        meta: result.meta,
        data: result.result,
    });
});
const confirmOrder = catchAsync(async (req, res) => {
    
    const id = req.params.orderId
    const result = await adminServices.confirmOrder(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order confirm successfully',
        data: result,
    });
});
const updateProduct = catchAsync(async (req, res) => {
    
    const id = req.params.productId
    const {productData} = req.body
    const result = await adminServices.updateProduct(id, productData);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order confirm successfully',
        data: result,
    });
});


  
export const adminController = {
    userBlockController,
    getAllUser,
    getAllOrderController,
    confirmOrder,
    updateProduct
}