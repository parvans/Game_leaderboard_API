import express from 'express';
import { getAllPlayers, registerPlayer, updatePlayerScore, userLogin, userProfile } from '../controllers/user-controller.js';
import verifyToken from '../middleware/verifyToken.js';
import veriftyAdmin from '../middleware/adminAuth.js';

const router=express.Router();

router.get("/players",verifyToken,getAllPlayers);

router.get("/profile",verifyToken,userProfile);

router.post("/player",[verifyToken,veriftyAdmin],registerPlayer);

router.post("/login",userLogin);

router.put("/player",verifyToken,updatePlayerScore);

export default router;
