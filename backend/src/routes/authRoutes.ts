import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// Authentication routes
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/validate', AuthController.validateToken);

export default router;
