#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('tajrobe-server:server');
var http = require('http');
const socketIo = require("socket.io");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
/** Random Generator */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
/** global variables **/
let userData = [];
let intervals = [];
let movementAllow = true;
let mineData = [];
let count = 3;
let state = 0;
let music = 0;
const stateMessage = [{title:"",body:"به حمله یک یا تعداد بیشتر کامپیوتر به یک یا تعداد بیشتری شبکه حمله سایبری گفته می شود.“حمله سایبری” یک محیط دو بعدی در صفحه \n" +
      "مرورگر شماست و هدف آن شبیه سازی چگونگی تشکیل گروه‌هایی از افراد با قصدی مشخص در برخوردهای تصادفی با یکدیگر است. در اینجا کامپیوتر حمله کننده شما هستید و می توانید به نقاطی از شهر حمله کنید. این اتفاق می تواند به صورت فردی و یا جمعی صورت پذیرد.\n فراموش نکنید هویت شما در طول این اجرا ناشناس باقی می ماند. هرگز نام خود یا فرد دیگری را فاش نکنید. از افراد سوال هایی نپرسید که باعث شود هویت آن ها فاش شود. شما تحت خطرید. ناشناس بمانید."},
  {title:"",body:"صفر سبز رنگ وسط صفحه شما هستید و باقی صفرها سایر شرکت کنندگان می باشند. در فضا حرکت کنید. این کار را با کلید های چپ/راست/بالا/پایین کیبورد کامپیوترتان می توانید انجام دهید. اگر قادر به حرکت نیستید با موس خود یک بار روی صفحه کلیک کنید. مین هایی از قبل در نقاطی از نقشه کار گذاشته شده اند. سعی کنید به آن ها نزدیک شوید. مراقب جان خود باشید. سعی کنید ناشناس باقی بمانید."},
  {title:"",body:"سمت راست صفحه یک چت باکس وجود دارد. شما با آن می توانید با سایر افراد حاضر در محیط صحبت کنید. برای این کار لازم است تا در یک قدمی او قرار بگیرید و پیام خود را ارسال کنید.همانطور که در خیابان تنها می توانید با فرد نزدیک خود صحبت کنید.خودتان و افراد دیگر را آماده چندین حمله انتحاری  همزمان کنید.\n سعی کنید ناشناس باقی بمانید."},
  {title:"",body:"چت کردن برای مدتی از دسترس خارج میشود. احتمالا تا الان متوجه شده اید که در یک زمین مین گذاری شده قدم میزنید. مین ها جملات هستند. جملاتی که صاحبانشان آن ها را در جایی دفن کرده اند. در این محیط جملات مین هایی هستند که اگر قدم رویشان بگذارید منفجر خواهند شد. انفجار قابل دیدن است و صدایی مهیب می دهد. صدایی که همه آن را می شنوند. اگر صاحبان هر جمله ای هستید که روزی میخواستید آن را دفن کنید و خودتان جرئت منفجر کردنش را نداشتید در این مدت زمان ۵ دقیقه ای آن ها را هر کجا که خواستید در چت باکس بنویسید و همانجا با زدن کلید مین گذاری دفن کنید. سعی کنید مین ها را در نزدیکی سایر مین ها نگذارید. مراقب باشید کسی متوجه این عمل انتحاری شما نشود. سعی کنید ناشناس باقی بمانید."},
  {title:"",body:"امیدوارم ماموریت خود را به درستی انجام داده باشید. مین ها در زمین قرار گرفتند. اکنون به شما یک پرچم تعلق میگیرد و شما یک مین یاب هستید. در شهر قدم بزنید و هرکجا از روی مینی عبور کردید که حاوی کلمه یا عبارتی بود که کنجکاوی شما را بر می انگیخت ِ با پرچم خود آن را مشخص کنید. توجه کتید که شما تنها یک مین را می توانید پرچم گذاری کنید و سایر مین ها بعد از این مرحله برای همیشه از بین خواهند رفت. هویت خود را همچنان مخفی نگه دارید."},
  {title:"",body:"مین های انتخاب نشده از بین رفتند. حال شما باید از بین پرچم های مشخص شده در نقشه یکی را انتخاب کرده و کنار آن بایستید. در شهر قدم بزنید و پرچم ها را ببینید. در صورتی که در کنار آن ها قرار بگیرید کلمه ای از جمله اصلی مین پرچم گذاری شده را خواهید دید. این کلمات موضوعات صحبت در مرحله بعد هستند. در کنار پرچمی قرار بگیرید که موضوعش برای شما جذاب تر است. شما برای این کار ۳ دقیقه وقت دارید. عجله کنید و موقعیت نهایی خود را در شهر انتخاب کنید. در این مرحله باید اجتماع خود را پیدا کنید. همچنان ناشناس باقی بمانید."},
  {title:"",body:"امیدوارم تا به اینجا اجتماع خود را پیدا کرده باشید. در این مرحله شما قادر به حرکت کردن نیستید و باید در یک مکان بایستید اما صدای شما به گوش تمامی افرادی که در زاویه دید شما قرار دارند خواهد رسید همانطور که شما صدای آن ها را می شنوید. با اجتماع خود راجب پرچمی که در کنار آن قرار گرفته اید صحبت کنید. چقدر این جمله به شما نزدیک است ؟ شما چه تجربه نزدیک به این جمله را دارید؟ سعی کنید با دیگر افراد اجتماعتان هم صحبت شوید ولی مراقب سایر اجتماعات باشید. آن ها صدای شما را می شنوند چون در کنار یک پرچم بزرگ در تهران ایستاده اید. ناشناس بودن خود را حفظ کنید."},
  {title:"",body:"دیگر زمان آن رسیده است که شما جملات خود را فریاد بزنید. به سمت میدان انقلاب بروید و در آن جا تجمع کنید. جملات خود را در آنجا فریاد بزنید. در این مرحله صدای شما را هرکسی در این شهر حضور داشته باشد می شنود. ناشناس باقی بمانید و به سمت میدان انقلاب بروید"},
  {title:"",body:"اجرای حمله سایبری در این نقطه تمام می شود. شعارهای شما در راه پیمایی امروز ورودی یک شبکه هوش مصنوعی خواهد بود که جملات شما را به تصویر تبدیل خواهد کرد. طی روزهای آینده تصویرهای ساخته شده که شما نقاشان آن بوده اید منتشر خواهد شد و در سطح شهر و دانشگاه تهران خواهید دید. تمام فعالیت شما در این اجرا ناشناس بوده و هیچ داده ای از شما ذخیره نشده است. تنها جملات هستند که وارد شبکه عصبی طراحی شده ما میشوند. ممنون از مشارکت شما در این اجرا."},]
mineData.push({mineId:0,mineText:"امروز از بانک ملی اینجا دزدی کردم",x:16,y:10,mineFlag:"امروز از بانک ملی اینجا دزدی کردم",flagged:0})
mineData.push({mineId:0,mineText:"من بارها با تصور اینکه داره بهم تجاوز می‌شه خودارضایی کردم",x:17,y:20,mineFlag:"من بارها با تصور اینکه داره بهم تجاوز می‌شه خودارضایی کردم",flagged:0})
mineData.push({mineId:0,mineText:"ما از بهشت شما بیزاریم",x:23,y:5,mineFlag:"ما از بهشت شما بیزاریم",flagged:0})
mineData.push({mineId:0,mineText:"اینجا از مامور کتک خوردم",x:5,y:20,mineFlag:"اینجا از مامور کتک خوردم",flagged:0})

let adminSocket;
let adminInterval
/** get specific user data */
function getUserLoc (socketId) {
  return userData.find(el=> el.socketId === socketId)
}
function getUserInterval (socketId) {
  return intervals.find(el=> el.socketId === socketId)
}
function setUserLoc (socketId,newX,newY) {
  userData.find(el=>{ if(el.socketId === socketId){el.x=newX,el.y=newY}})
}
let timer = 0;
let timerInterval;
let pvChatFlag = true;
let publicChatFlag = false;
/** socket implement **/
const io = socketIo(server);
try{
io.on("connection", (socket) => {
  let isAdmin = false;
  console.log("New client connected",socket.id);
  const x = getRandomInt(30);
  const y = getRandomInt(30);
  const userTempData = {socketId:socket.id, x:x,y:y};
  const tempInterval = setInterval(sendMap,100);
  intervals.push({socketId: socket.id, intervalId: tempInterval});
  userData.push(userTempData);
  socket.emit('stateMassage',stateMessage[state])
  if(state == 1 || state == 0){
    socket.emit("setChatFlag",true)
    socket.emit("setMineFlag",true)
  }
  else if(state == 2){
    socket.emit("setChatFlag",false)
  }else if(state == 3){
    socket.emit("setChatFlag",true)
    socket.emit("setMineFlag",false)
  }else if(state == 4){
    socket.emit("setChatFlag",true)
    socket.emit("setMineFlag",true)
    socket.emit("setMainFlag",false)
  }else if(state == 5){
    io.sockets.emit("setChatFlag",false)
    io.sockets.emit("setMineFlag",true)
    io.sockets.emit("setMainFlag",true)
  }else if(state == 6){
    io.sockets.emit("setChatFlag",false)
    io.sockets.emit("setMineFlag",true)
    io.sockets.emit("setMainFlag",true)
  }else if(state == 7){
    io.sockets.emit("setChatFlag",false)
    io.sockets.emit("setMineFlag",true)
    io.sockets.emit("setMainFlag",true)
  }

  function handleTimer(){
    io.sockets.emit("timer",timer);
    if(timer === 9)
      io.sockets.emit("timerDeadLine",true)
    else if(timer === 8)
      io.sockets.emit("timerDeadLine",false)
    else if(timer === 7)
      io.sockets.emit("timerDeadLine",true)
    else if(timer === 6)
      io.sockets.emit("timerDeadLine",false)
    else if(timer === 5)
      io.sockets.emit("timerDeadLine",true)
    else if(timer === 4)
      io.sockets.emit("timerDeadLine",false)
    else if(timer === 3)
      io.sockets.emit("timerDeadLine",true)
    else if(timer === 2)
      io.sockets.emit("timerDeadLine",false)
    else if(timer === 1)
      io.sockets.emit("timerDeadLine",true)
    if(timer === 0){
      clearInterval(timerInterval);
      io.sockets.emit("timerDeadLine",false)
    }

    else
      timer--;
  }
  /** admin */
  socket.on("isAdmin",date=>{
    console.log("123333334544")
    isAdmin = true;
    adminSocket = socket.id;
    adminInterval= setInterval(gameStatus,1000)
    const user = getUserLoc(socket.id);
    const index = userData.indexOf(user);
    if(index > -1 ){
      userData.splice(index,1);
    }
    const interval = getUserInterval(socket.id);
    const intervalIndex = intervals.indexOf(interval);
    if(intervalIndex > -1){
      intervals.splice(intervalIndex,1);
      clearInterval(interval)
    }
  })
  function gameStatus(){
    socket.emit("gameStatus",{count:userData.length})
  }
  socket.on("giveAdminText",(text)=>{
    io.sockets.emit("adminMassage","admin : "+text)
  })
  socket.on("startTimer",(data)=>{
    console.log("timer",data)
    timer = data;
    timerInterval = setInterval(handleTimer,1000);
  })
  socket.on("setChat",data=>{
    io.sockets.emit("setChatFlag",data)
  })
  socket.on("setChatPv",data=>{
    pvChatFlag = data;
  })
  socket.on("setChatPublic",data=>{
        publicChatFlag = data;
    })

  socket.on("setMineFlag",data=>{
    io.sockets.emit("setMineFlag",data)
  })
  socket.on("setMineToFlag",data=>{
    console.log("heyyy",data)
    mineData.map(item=>{
      if(item.mineId==data.mineId){
        console.log("fuckkk");
        item.mineFlag = data.mineFlag;
      }
    })
  })
  socket.on("setMainFlagOn",data=>{
    io.sockets.emit("setMainFlag",true)
  })
  socket.on("deleteUnflaggedMines",data=>{
    let unflaggedMinesIndex = [];
    mineData.map((item,index)=>{
        if(item.flagged == 0)
            unflaggedMinesIndex.push(index)
    })
    unflaggedMinesIndex.map(item=>{
    if(item > -1 ){
            mineData.splice(item,1);
          }
    })
  })
  socket.on('setStateNumber',data=>{
    state = data;
    io.sockets.emit('stateMassage',stateMessage[data])
    if(data == 1){
      io.sockets.emit("setChatFlag",true)
      io.sockets.emit("setMineFlag",true)
      io.sockets.emit("setMainFlag",true)
    }
    else if(data == 2){
      io.sockets.emit("setChatFlag",false)
      io.sockets.emit("setMineFlag",true)
      io.sockets.emit("setMainFlag",true)
    }else if(data == 3){
      io.sockets.emit("setChatFlag",true)
      io.sockets.emit("setMineFlag",false)
      io.sockets.emit("setMainFlag",true)
    }else if(data == 4){
      io.sockets.emit("setChatFlag",true)
      io.sockets.emit("setMineFlag",true)
      io.sockets.emit("setMainFlag",false)
    }else if(data == 5){
      io.sockets.emit("setChatFlag",false)
      io.sockets.emit("setMineFlag",true)
      io.sockets.emit("setMainFlag",true)
    }else if(data == 6){
      io.sockets.emit("setChatFlag",false)
      io.sockets.emit("setMineFlag",true)
      io.sockets.emit("setMainFlag",true)
    }else if(data == 7){
      io.sockets.emit("setChatFlag",false)
      io.sockets.emit("setMineFlag",true)
      io.sockets.emit("setMainFlag",true)
    }

  })
  socket.on("setMovement",(data)=>{
    movementAllow = data
  })
  socket.on("setMusic",(data)=>{
    music = data;
    console.log(data)
    io.sockets.emit('musicSelect',data)
  })
  /**      */
  console.log(userTempData);
  socket.emit("initLoc", userTempData);
  socket.on("giveLoc", (socketId) => {
    console.log("heyy");
    sendLoc(socketIo);
  })
  socket.on("getSelectedMine",data=>{
    mineData.map(item=>{
        if(item.mineId === data.mineId){
        item.flagged = 1;
        }
    })
  })
  function sendLoc(socketIo){
    const userData = getUserLoc(socketIo);
    socket.emit("getLoc",userData);
  }
  function calNeighbours(user){
    let neighbours = [];
    userData.map(data => {
      const xDif = data.x - user.x;
      const yDif = data.y - user.y;
      if(xDif <=5 && xDif >= -5 && yDif <=5 && yDif >= -5){
        neighbours.push(data);
      }
    })
    return neighbours;
  }
  function calMines(user){
    let Mines = [];
    mineData.map(data => {
      const xDif = data.x - user.x;
      const yDif = data.y - user.y;
      if(xDif <=5 && xDif >= -5 && yDif <=5 && yDif >= -5){
        Mines.push(data);
      }
    })
    return Mines;
  }
  function calNeighboursOnly(user){
    let neighbours = [];
    userData.map(data => {
      const xDif = data.x - user.x;
      const yDif = data.y - user.y;
      if(xDif <=5 && xDif >= -5 && yDif <=5 && yDif >= -5){
        neighbours.push(data);
      }
    })
    return neighbours;
  }
  function calPvNeighboursOnly(user){
    let neighbours = [];
    userData.map(data => {
      const xDif = data.x - user.x;
      const yDif = data.y - user.y;
      if(xDif <=1 && xDif >= -1 && yDif <=1 && yDif >= -1){
        neighbours.push(data);
      }
    })
    return neighbours;
  }

  function sendMap(){
    socket.emit("ping",socket.id)
    sendLoc(socket.id)
    const user = getUserLoc(socket.id)
    if(user){
      const neighbours = calNeighbours(user)
      const mines = calMines(user);
      socket.emit("getMap",{neighbours:neighbours,mines:mines,timer:timer});
    }
  }
  socket.on("button",(data)=>{
    console.log("button",data)
    const user = getUserLoc(data.socketId);
    if(data.button === 2 && movementAllow){
      if(user.y+1<30){
        setUserLoc(socket.id,user.x,user.y+1);
        sendLoc(data.socketId)
      }
    }else if(data.button === 3 && movementAllow){
        if(user){
        }
      if(user.x+1<30){
        setUserLoc(socket.id,user.x+1,user.y);
        sendLoc(data.socketId)
      }
    }else if(data.button === 0 && movementAllow){
      if(user.y-1>0){
        setUserLoc(socket.id,user.x,user.y-1);
        sendLoc(data.socketId)
      }
    }else if(data.button === 1 && movementAllow){
      if(user.x-1>0){
        setUserLoc(socket.id,user.x-1,user.y);
        sendLoc(data.socketId)
      }
    }
  })
  socket.emit("ping",socket.id)
  socket.on("pong", data => {
    if(!data.status){
      const user = getUserLoc(data.socketId);
      const index = userData.indexOf(user);
      if(index > -1 ){
        userData.splice(index,1);
      }
      const interval = getUserInterval(data.socketId);
      const intervalIndex = intervals.indexOf(interval);
      if(intervalIndex > -1){
        intervals.splice(intervalIndex,1);
        clearInterval(interval)
      }
      socket.disconnect();
    }
  })
  socket.on("giveText",(text)=>{
  if(publicChatFlag)
    socket.emit("catchMassage","شعار من :"+text)
    else
    socket.emit("catchMassage"," من :"+text)
    const user = getUserLoc(socket.id)
    if(publicChatFlag){
        io.sockets.emit("catchMassage","شعار رهگذران :"+text)

    }else{
        if(pvChatFlag){
        const neighbours = calPvNeighboursOnly(user)
              neighbours.map(item => {
                socket.to(item.socketId).emit("catchMassage","رهگذر :"+text)
              })
        }else{
        const neighbours = calNeighboursOnly(user)
              neighbours.map(item => {
                socket.to(item.socketId).emit("catchMassage","رهگذر :"+text)
              })}

    }
  })
  socket.on("setMine",(data)=>{
    console.log(data);
    mineData.push({mineId:count,mineText:data.text,x:data.x,y:data.y,mineFlag:"",flagged:0})
    mineData.map(item=>{
    if(item.x == data.x && item.y == data.y){
        if(data.text != item.mineText){
        console.log(data)
        console.log(item)
        socket.emit("adminMassage","ادمین : در اینجا قبلا مین وجود داشته است")
        mineData.splice(mineData.length -1,1);
        }
    }})
    let unResolvedMines=[];
    mineData.map(item=>{
      if(item.mineFlag==="")
        unResolvedMines.push(item);
    })
    io.sockets.emit("adminMineMassage",unResolvedMines)
    count++;
  })
  socket.on("disconnect", () => {
    const user = getUserLoc(socket.id);
    const index = userData.indexOf(user);
    if(index > -1 ){
      userData.splice(index,1);
    }
    const interval = getUserInterval(socket.id);
    const intervalIndex = intervals.indexOf(interval);
    if(intervalIndex > -1){
      intervals.splice(intervalIndex,1);
      clearInterval(interval)
    }
    console.log("Client disconnected");
  });
});
}catch(e){
}

app.set('socketio', io);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    console.log( error);
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      console.log(error);
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
