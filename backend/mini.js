const express=require('express');
const app=express();
app.get('/',(req,res) => {
res.send('ok mini');
});
app.listen(4000, () => console.log('mini ok'));
