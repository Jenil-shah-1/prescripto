import express from 'express';
import { requestPasswordReset, verifyOTP, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Forgot password routes
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router; 