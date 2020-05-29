module.exports = {
    // wechat sign test
    sign: (req, res) => {
        const {signature, timestamp, nonce, echostr} = req.params;
        console.log(signature, timestamp, nonce, echostr);
        
        res.send(echostr);
    }
}