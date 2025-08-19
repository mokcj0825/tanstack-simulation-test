import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { ValidationMiddleware } from '../middleware/validation';

const router = Router();

// Register validation schemas
ValidationMiddleware.registerSchema('GET /users', ValidationMiddleware.getUsersSchema());
ValidationMiddleware.registerSchema('GET /users/:id', ValidationMiddleware.getUserSchema());
ValidationMiddleware.registerSchema('POST /users', ValidationMiddleware.createUserSchema());
ValidationMiddleware.registerSchema('PUT /users/:id', ValidationMiddleware.updateUserSchema());
ValidationMiddleware.registerSchema('DELETE /users/:id', ValidationMiddleware.deleteUserSchema());
ValidationMiddleware.registerSchema('POST /users/generate', ValidationMiddleware.generateUsersSchema());
ValidationMiddleware.registerSchema('POST /users/updateProfile', ValidationMiddleware.updateProfileSchema());
ValidationMiddleware.registerSchema('GET /users/bookList', ValidationMiddleware.getBookListSchema());

// User routes
router.get('/', ValidationMiddleware.validate('GET /users'), UserController.getUsers);
router.get('/stats', UserController.getUsersStats);
router.get('/bookList', ValidationMiddleware.validate('GET /users/bookList'), UserController.getBookList);
router.get('/:id', ValidationMiddleware.validate('GET /users/:id'), UserController.getUserById);
router.post('/', ValidationMiddleware.validate('POST /users'), UserController.createUser);
router.put('/:id', ValidationMiddleware.validate('PUT /users/:id'), UserController.updateUser);
router.delete('/:id', ValidationMiddleware.validate('DELETE /users/:id'), UserController.deleteUser);
router.post('/generate', ValidationMiddleware.validate('POST /users/generate'), UserController.generateUsers);
router.post('/updateProfile', ValidationMiddleware.validate('POST /users/updateProfile'), UserController.updateProfile);

export default router;
