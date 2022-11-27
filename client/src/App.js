import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Item from "@material-ui/core/Grid";
import {TextField, Button, TextareaAutosize, Dialog, DialogTitle, DialogContent} from "@mui/material";
import MultiPlayer from './multiPlayer'
const ENDPOINT = "http://127.0.0.1:3000";
let text;
function App() {
  const [near, setNear] = useState([])
  const [map, setMap] = useState(Array(11).fill(0).map(row => new Array(11).fill(0)));
  const [locX, setLocX] = useState(1);
  const [locY, setLocY] = useState(1);
  const [timer, setTimer] = useState(0);
  const [count, seCount] = useState(3);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [socket, setSocket] = useState();
  // const [socketId, setSocketId] = useState()
  const [isConnected,setIsConnected]=useState(0);
  const [interval, setInterval]=useState(undefined)
  const [countNum,setCountNum]=useState(0);
  const [textArea, setTextArea] = useState("");
  const [adminArea, setAdminArea] = useState("");
  const [chatFlag,setChatFlag] = useState(true);
  const [mineFlag,setMineFlag] = useState(true);
  const [mainFlag,setMainFlag] = useState(true);
  const [yesFlag,setYesFlag] = useState(true);
  const [noFlag,setNoFlag] = useState(true);
  const [selectedMine,setSelectedMine] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle,setDialogTitle] = useState('');
  const [dialogBody,setDialogBody] = useState('');
  const [deadLine,setDeadLine] = useState(false);
  const urls=[
    'https://audio.jukehost.co.uk/QoChTNVHPly3Sv0m9Pi850VmEWjxM6kR',
    'https://audio.jukehost.co.uk/CNSoxTgbQdGS06mUzZNme9v4CiiWcr5U',
    'https://audio.jukehost.co.uk/dCr43B0x5EyJ80LdkCuz4Tr8dGIow68n',
    'https://audio.jukehost.co.uk/foXcld6TLiXF0ZaWVMXIHaV0pg1n6OxC',
    'https://audio.jukehost.co.uk/z9RJrBAqWF9TmOKL226gwyF4U8UCt73b',
  ]
  const [musicSelect,setMusicSelect] = useState(0)
  const [sources] = useState(
      urls.map(url => {
        return {
          url,
          audio: new Audio(url),
          playing:false
        }
      }),
  )
  sources[0].audio.addEventListener('ended', () => {
    sources[0].playing = false
  })
  let update=0;
  let socketId=0;
  // let board = Array(30).fill(0).map(row => new Array(30).fill(0))
  // setMap(board)

  useEffect(() => {
    // console.log('i fire once');
      let x;
      let y;
      let textList = [];
      let adminList = [];
      const socket = socketIOClient(ENDPOINT,{transports:['websocket']});
      setSocket(socket);
      socketId = socket.id;
    // if(interval){
    //   clearInterval(interval);
    // }
    // const tempInterval = setInterval(()=> {console.log("emiiting"); socket.emit("giveLoc",socketId)},1000)
    // setInterval(tempInterval)
    socket.on('ping',data=>{
      if(socketId === data){
        socket.emit("pong",{socketId:data,status:true});
      }else{
        socket.emit("pong",{socketId:data,status:false});
      }
    })
    socket.on('setChatFlag',data=>{
      setChatFlag(data);
    })
    socket.on('setMineFlag',data=>{
      setMineFlag(data);
    })
    socket.on('initLoc', data =>{
      console.log("heh2:",data.socketId)
      socketId = data.socketId;
      // setSocketId(prevState =>{return prevState = data.socketId})
      setLocX(data.x);
      setLocY(data.y);
      x = data.x;
      y = data.y;
    })
    socket.on('setMainFlag',data=>{
      setMainFlag(data)
    })
    function updateShapes(){
      const shapes=[{value:11,x:15, y:5},{value:13,x:14, y:10},{value:10,x:15, y:15}
        ,{value:12,x:15, y:20},{value:14,x:10, y:5},{value:15,x:10, y:20},{value:16,x:10, y:13},{value:17,x:15, y:25}
        ,{value:18,x:20, y:16},{value:19,x:22, y:25},{value:20,x:8, y:7}]
      /** walls**/
      let j =0;
        for(j;j<30;j++){
            const xDif = 0 - x;
            const yDif = j - y;
            if(xDif <= 5 && xDif >= -5 && yDif <=5 && yDif >= -5){
              setMap(prevState => {
                prevState[5+xDif][5+yDif] = 50 ; return prevState})
            }
          const xDifW2 = 30 - x;
          const yDifW2 = j - y;
          if(xDifW2 <= 5 && xDifW2 >= -5 && yDifW2 <=5 && yDifW2 >= -5){
            setMap(prevState => {
              prevState[5+xDifW2][5+yDifW2] = 50 ; return prevState})
          }
          const xDifW3 = j - x;
          const yDifW3 = 0 - y;
          if(xDifW3 <= 5 && xDifW3 >= -5 && yDifW3 <=5 && yDifW3 >= -5){
            setMap(prevState => {
              prevState[5+xDifW3][5+yDifW3] = 51 ; return prevState})
          }
          const xDifW4 = j - x;
          const yDifW4 = 30 - y;
          if(xDifW4 <= 5 && xDifW4 >= -5 && yDifW4 <=5 && yDifW4 >= -5){
            setMap(prevState => {
              prevState[5+xDifW4][5+yDifW4] = 51 ; return prevState})
          }
          }

      shapes.map(shape=>{
        const xDif = shape.x - x;
        const yDif = shape.y - y;
        if(xDif <= 5 && xDif >= -5 && yDif <=5 && yDif >= -5){
          setMap(prevState => {
            prevState[5+xDif][5+yDif] = shape.value ; return prevState})
        }
      })
    }
    function updateMap(neighbours,mines){
      let i;
      let j;
      for(i=0;i < 11; i++){
        for(j=0;j<11;j++){
          map[i][j] = 0;
        }
      }
      updateShapes();
      neighbours.map(user => {
        const xDif = user.x - x;
        const yDif = user.y - y;
        if(xDif <= 5 && xDif >= -5 && yDif <=5 && yDif >= -5){
          setMap(prevState => {

            prevState[5+xDif][5+yDif] = 1 ; return prevState})
        }

      })
      mines.map(mine => {
        const xDif = mine.x - x;
        const yDif = mine.y - y;
        if(xDif <= 5 && xDif >= -5 && yDif <=5 && yDif >= -5 && mine.flagged == 0){
          setMap(prevState => {

            prevState[5+xDif][5+yDif] = 3 ; return prevState})
        }else if(xDif <= 5 && xDif >= -5 && yDif <=5 && yDif >= -5 && mine.flagged == 1){
          setMap(prevState => {

            prevState[5+xDif][5+yDif] = 4 ; return prevState})
        }
        if(xDif <= 1 && xDif >= -1 && yDif <=1 && yDif >= -1){
          if(mine.flagged==1){
            if(adminList[adminList.length-1] !== "محتوای مین : "+mine.mineText){
              setSelectedMine(  mine);
              adminList.push("محتوای مین : "+mine.mineText);
              setAdminArea(prevState => prevState="");
              adminList.map(item => {
                setAdminArea(prevState => prevState = item+'\n'+prevState);
              })
            }
          }else{
            if(adminList[adminList.length-1] !== "محتوای مین : ..."+mine.mineFlag){
              setSelectedMine(  mine);
              adminList.push("محتوای مین : ..."+mine.mineFlag);
              setAdminArea(prevState => prevState="");
              adminList.map(item => {
                setAdminArea(prevState => prevState = item+'\n'+prevState);
              })
            }
          }

        }

      })
    }
    socket.on("getMap", data => {
      updateMap(data.neighbours,data.mines)
    });
    socket.on("timer",data=>{
      console.log("timer: ",data)
      setTimer(data);
    })
    socket.on('getLoc', data =>{
      if(data){
        setLocX(prevState => prevState = data.x);
        x = data.x;
      }
      if(data){
        setLocY(data.y);
        y = data.y;
      }
    })
    socket.on("catchMassage",(data)=>{
      sources[2].audio.play()
      textList.push(data);
      setTextArea(prevState => prevState="");
      textList.map(item => {
        setTextArea(prevState => prevState = item+'\n'+prevState);
      })
    })
    socket.on("stateMassage",(data)=>{
      console.log("data",data)
      setDialogTitle(data.title)
      setDialogBody(data.body)
      setOpenDialog(true);
    })
    socket.on("adminMassage",(data)=>{
      sources[3].audio.play();
      adminList.push(data);
      setAdminArea(prevState => prevState="");
      adminList.map(item => {
        setAdminArea(prevState => prevState = item+'\n'+prevState);
      })
    })
    socket.on('musicSelect',(data)=>{
      setMusicSelect(data);
      sources[1].audio.play();
      sources[1].playing = true;
    })
    socket.on('timerDeadLine',(data)=>{
      sources[4].audio.play();
      setDeadLine(data);
    })
    window.addEventListener('keypress',()=>{
      if(!sources[0].playing){
        sources[0].audio.play();
        sources[0].playing = true;
      }

    })

    return () => clearInterval(interval);
  }, [map]);

  const keyDownHandler = (event) => {
    if (event.code === "ArrowLeft") {
      socket.emit("button",{socketId:socket.id,button:0});
    }
    if (event.code === "ArrowUp") {
      socket.emit("button",{socketId:socket.id,button:1});
    }
    if (event.code === "ArrowRight") {
      socket.emit("button",{socketId:socket.id,button:2});
    }
    if (event.code === "ArrowDown") {
      socket.emit("button",{socketId:socket.id,button:3});
    }



  };

  function setInputText(e){
    text=e.target.value
  }
  function sendText(){
    socket.emit("giveText",text)
  }
  function sendMine(){
    socket.emit("setMine",{text:text,x:locX,y:locY})
  }
  function askQuestion(){
    if(selectedMine){
      setYesFlag(false)
      setNoFlag(false)
      setMainFlag(true)
      setAdminArea(prevState => prevState = 'آیا میخواهید مین با این کلمه را پرچم گذاری کنید  ==>' + selectedMine.mineFlag)
    }
    else{
      (setAdminArea(prevState => prevState = 'در نزدیکی یک مین قرار بگیرید'))
    }
  }
  function sendMainFlag(){
    setYesFlag(true)
    setNoFlag(true)
    socket.emit("getSelectedMine",selectedMine)
  }
  function saidNo(){
    setYesFlag(true)
    setNoFlag(true)
    setMainFlag(false)
    setAdminArea(prevState => prevState = '')
  }
  const handleClose = (value) => {
    setOpenDialog(false);
  };
  const handleOpenDialog = (value) => {
    setOpenDialog(true);
  };
  return (
      <div tabIndex={0} onKeyDown={keyDownHandler}>
        <div style={{ height: '100%', position: 'absolute', left: '0px', width: '100%', overflow: 'hidden',backgroundColor:'white'}}>
          <div style={{ height: '100%', position: 'fixed', left: '0px', width: '70%', overflow: 'hidden',backgroundColor:'black'}}>
            {/*{map.map((e, i) => e.map(subItem,index)=><div key={i} style={{color:'white'}}>Row {i}</div>)}*/}
          <div style={{padding:'5%'}} >
            {map.map((items, index) => {
            return(
                <Grid container spacing={10}   justifyContent="center" alignItems="center">
                    {items.map((subItems, sIndex) => {return(
                      <Grid  item lg={1} style={{backgroundColor:deadLine?'white':'black'}}>
                      <Item style={{fontSize:'small',color:index===5 && sIndex===5?"greenyellow" :deadLine?'black':'white',alignItems:'center'}}>{subItems == 0 ? ' . ': subItems == 10 ? ' خیابان انقلاب ':subItems == 50 ? '____':subItems == 51 ? '|':subItems == 11 ? 'میدان انقلاب':subItems == 12 ? 'چهارراه ولیعصر':subItems == 13 ? 'دانشگاه تهران':subItems == 14 ? 'تقاطع کشاورز':subItems == 15 ? 'میدان ولیعصر':subItems == 16 ? 'خیابان کشاورز':subItems == 17 ? 'پل حافظ':subItems == 18 ? 'خیابان پاستور':subItems == 19 ? 'وزارت امور خارجه':subItems == 20 ? 'پارک لاله':subItems == 3 ? "💣":subItems == 4 ? "🚩":subItems == 1 ? ' 0 ':' '}</Item>
                      </Grid>)
                        })}
                </Grid>
              )
            })
        }
          </div>
            )}
          </div>
          <div style={{ height: '100%', position: 'fixed', left: '70%', width: '30%', overflow: 'hidden',backgroundColor:'darkblue', border:'5pt solid white',color:'white'}}>
            {/*{locX},{locY}*/}
            <br/>
            <row>
              <text style={{color:'red'}}>{timer}</text>
              <Button style={{marginLeft:150}} variant="outlined" color="warning" onClick={handleOpenDialog}>توضیح دوباره</Button>
            </row>
            <br/>
            <br/>
            <TextareaAutosize
                maxRows={10}
                aria-label="maximum height"
                placeholder="صدای ادمین"
                defaultValue={adminArea}
                style={{ width: "95%",direction:'rtl',textAlign:'right'} }
            />
            <br/>
            <br/>
            <TextareaAutosize
                maxRows={25}
                aria-label="maximum height"
                placeholder="صدای محیط"
                defaultValue={textArea}
                style={{ width: "95%",direction:'rtl',textAlign:'right'} }
            />
            <div style={{backgroundColor:"white",position:"absolute",bottom:"2vh", width:"100%"}}>
              <TextField fullWidth  color={"warning"} onChange={setInputText} hiddenLabel id="outlined-basic" label="" variant="outlined" />
              <Button variant="outlined" color="error" onClick={sendText} disabled={chatFlag}>ارسال پیام</Button>
              <Button variant="outlined" color="error" onClick={sendMine} disabled={mineFlag}>مین گذاری</Button>
              <Button variant="outlined" color="error" onClick={askQuestion} disabled={mainFlag}>پرچم گذاری مین</Button>
              <Button variant="outlined" color="error" onClick={sendMainFlag} disabled={yesFlag}>آره</Button>
              <Button variant="outlined" color="error" onClick={saidNo} disabled={noFlag}>نه</Button>
            </div>
          </div>
        </div>
        <Dialog onClose={handleClose} open={openDialog}>
          <DialogTitle style={{direction:'rtl',fontFamily:'Press Start 2P',color:"white",backgroundColor:"darkblue"}}>{dialogTitle}</DialogTitle>
          <DialogContent style={{direction:'rtl',fontFamily:'Press Start 2P',color:"white",backgroundColor:"darkblue"}}>
            {dialogBody}
          </DialogContent>


        </Dialog>
      </div>
  );
}

export default App;