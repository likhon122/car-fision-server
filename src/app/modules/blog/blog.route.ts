
import express from 'express'
import { blogController } from './blob.controller';

const router = express.Router()
router.get('/', blogController.getAllBlog);
router.get('/:blogId', blogController.getSingleBlog);

export const blogRoutes = router