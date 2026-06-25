import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller.js';
import { validateRegister } from '../middlewares/validateRegister.js';
import { validateLogin } from '../middlewares/validateLogin.js';
import { validateRefresh } from '../middlewares/validateRefresh.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', validateRefresh, refresh);
router.post('/logout', validateRefresh, logout);
router.get('/me', authenticate, me);

export default router;
