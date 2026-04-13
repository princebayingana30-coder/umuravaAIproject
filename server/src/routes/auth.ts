import express from 'express';
import { login, googleLogin } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/google', googleLogin);

export default router;
