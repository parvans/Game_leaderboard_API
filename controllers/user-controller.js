import Player from "../models/Player.js";
import { firstNameSecondNameCapForReg, isEmail, isEmpty, isNull, ReE, ReS, too } from "../services/util.service.js";
import HttpStatus from "http-status";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export const registerPlayer=async(req,res)=>{
    let err;
    const body=req.body;
    const fields = ["name","email", "password"];
    let inVaildFields = fields.filter(x => isNull(body[x]));

    if(!isEmpty(inVaildFields)){
        return ReE(res,{ message: `Please enter required fields ${inVaildFields}!.` }, HttpStatus.BAD_REQUEST);
    }

    const {name,email,password,isAdmin} = body;

    if (String(name).trim().length < 3) {
        return ReE(res,{ message: "Please enter name with more than 3 characters!." },HttpStatus.BAD_REQUEST);
    }

    if (String(name).trim().length > 18) {
        return ReE(res,{ message: "Please enter name with maximum 18 characters!." },HttpStatus.BAD_REQUEST);
    }

    if (!(await isEmail(email))) {
        return ReE(res,{ message: "Please enter vaild email !." },HttpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err,checkUser]=await too(Player.findOne({email:email}));
    
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!isNull(checkUser)) {
        return ReE(res,{ message: "User does not exit." },HttpStatus.BAD_REQUEST);
    }

    if (String(password).trim().length < 3) {
        return ReE(res,{ message: "Please enter password with more the 3 characters!." },HttpStatus.BAD_REQUEST);
    }

    if (String(password).trim().length > 18) {
        return ReE(res,{ message: "Please enter password with maximum 18 characters!." },HttpStatus.BAD_REQUEST);
    }

    let hashPassword;
    [err, hashPassword] = await too(bcrypt.hash(password, bcrypt.genSaltSync(10)));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(hashPassword)) {
        return ReE(res,{ message: "Something went wrong with password!." },HttpStatus.BAD_REQUEST);
    }

    const createUser=new Player({
        name:firstNameSecondNameCapForReg(name),
        email:email.toLowerCase(),
        password:hashPassword,
        isAdmin:isAdmin
    }).save();

    if (!isNull(createUser)) {
        return ReS(res,{ message: "User Register Successfully"},HttpStatus.OK);
    }


}

export const userLogin=async(req,res)=>{
    let err;
    const body=req.body;
    const fields = ["email", "password"];
    
    let inVaildFields = fields.filter(x => isNull(body[x]));

    if(!isEmpty(inVaildFields)){
        return ReE(res,{ message: `Please enter required fields ${inVaildFields}!.` }, HttpStatus.BAD_REQUEST);
    }
    const {email,password} = body;

    let checkUser;
    [err,checkUser]=await too(Player.findOne({email:email}));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (isNull(checkUser)) {
        return ReE(res,{ message: "User does not exit." },HttpStatus.BAD_REQUEST);
    }

    let checkPassword;
    [err, checkPassword] = await too(bcrypt.compare(password,checkUser.password));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!checkPassword) {
        return ReE(res,{ message: "Please check your user name and password!." },HttpStatus.BAD_REQUEST);
    }

    let token = Jwt.sign({id:checkUser._id,isAdmin:checkUser.isAdmin},process.env.JWT_SECRET_KEY,{expiresIn:'6h'});

    if(isNull(token)){
        return ReE(res, { message: "Something went wrong to genrate token!." }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ReS(res, { message: `Welcome ${checkUser.name}`, token: token,id:checkUser._id}, HttpStatus.OK);

}

export const getAllPlayers=async(req,res)=>{

    let err;
    let search = req.query.search;
    let getPlayers,optionsPlayers={
        isAdmin:false,
        ...(search? {
            $or:[
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }, 
        ]
    }:{})
    };

    [err,getPlayers]=await too(Player.find(optionsPlayers).sort({score:-1,name:1}).select('-password').limit(10));

    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const rankedPlayers=getPlayers?.map((player,index)=>({
        rank: player.score > 0 ? index + 1 : 'N/A',
        name: player.name,
        score:player.score

    }));

    return ReS(res, { data: rankedPlayers }, HttpStatus.OK);

}

export const userProfile=async(req,res)=>{
    let err;
    let user = req.user.id;
    if(isNull(user)){
        return ReE(res, { message: "Something went wrong" }, HttpStatus.BAD_REQUEST);
    }

    let getUser;

    [err, getUser] = await too(Player.findById(user).select('-password'));

    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(getUser)){
        return ReE(res, { message: "User does not exist!." }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res,{message:'User profile',data:getUser},HttpStatus.OK)

}

export const updatePlayerScore=async(req,res)=>{
    let err;
    const playerId=req.params.id;
    let playerExist;

    [err,playerExist]=await too(Player.findById(playerId));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(playerExist)){
        return ReS(res,{ message: "Player Not Found"},HttpStatus.BAD_REQUEST);
    }

    let updatePlayer;
    [err,updatePlayer]=await too(Player.findByIdAndUpdate(playerId,req.body,{new:true}));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(updatePlayer)){
        return ReS(res,{ message: "Player is updated"},HttpStatus.BAD_REQUEST);
    }

    return ReS(res,{ message: "Player updated successfully"},HttpStatus.OK);


}