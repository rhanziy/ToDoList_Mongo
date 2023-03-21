const express = require("express");
const User = require("../model");
const router = express.Router();
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.urlencoded({extended: true}));


router.get('/register', (req, res)=>{
    res.render('register.ejs');
});

router.post(
    "/register",
    async(req, res)=>{
        const { name, id, pw } = req.body;
        
    
        try{
            let user = await User.findOne({ id });
            if(user) return res.status(400).json({ error : [{ msg: "User already exists" }]});

            user = new User({
                name,
                id,
                pw
            });

            const salt = await bcrypt.genSalt(10);
            user.pw = await bcrypt.hash(pw, salt);

            user.save();

            res.send("Success");

        } catch(err){
            console.log(err.message);
        }

    }
)


module.exports = router;