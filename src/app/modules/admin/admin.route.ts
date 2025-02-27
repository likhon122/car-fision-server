

import express from 'express'
import auth from '../../middleware/auth'
import { adminController } from './admin.controller'
import { USER_ROLE } from '../auth/auth.constant'

const router = express.Router()

// admin routes
router.patch('/users/:userId/block', auth(USER_ROLE.admin), adminController.userBlockController)
router.get('/all-user', auth(USER_ROLE.admin), adminController.getAllUser);
router.get('/view-all-order', auth(USER_ROLE.admin), adminController.getAllOrderController);
router.patch('/order/:orderId/confirm', auth(USER_ROLE.admin), adminController.confirmOrder);
router.patch('/product/:productId/update', auth(USER_ROLE.admin), adminController.updateProduct);

export const AdminRoute = router