import express from 'express';
import { login, googleLogin, googleDevLogin } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/google-dev', googleDevLogin);

export default router;
