import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Item from "@material-ui/core/Grid";
import {TextField, Button, TextareaAutosize} from "@mui/material";
const ENDPOINT = "http://127.0.0.1:3000";
let text;
function App() {
  const [near, setNear] = useState([])
  const [map, setMap] = useState(Array(11).fill(0).map(row => new Array(11).fill(0)));
  const [locX, setLocX] = useState(1);
  const [locY, setLocY] = useState(1);
  const [count, setCount] = useState(0);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [socket, setSocket] = useState();
  // const [socketId, setSocketId] = useState()
  const [isConnected,setIsConnected]=useState(0);
  const [interval, setInterval]=useState(undefined)
  const [textArea, setTextArea] = useState("");
  let update=0;
  let socketId=0;

  let timer=0;
  let mineNum=-1;
  let mineFlag="";
  // let board = Array(30).fill(0).map(row => new Array(30).fill(0))
  // setMap(board)
  useEffect(() => {
      let textList = [];
      const socket = socketIOClient(ENDPOINT,{transports:['websocket']});
      setSocket(socket);
      socketId = socket.id;
      socket.emit("isAdmin",'');
      socket.on("gameStatus",data=>{
        setCount(prevstate=>prevstate=data.count)
      })
      socket.on("adminMineMassage",(data)=>{

        textList = data;
      setTextArea(prevState => prevState="");
      textList.map(item => {
        setTextArea(prevState => prevState = item.mineId+":"+item.mineText+'\n'+prevState);
      })
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
  function setTimer(e){
    timer=e.target.value
  }
  function setMineNum(e){
    mineNum=e.target.value
  }
  function setMineFlag(e){
    mineFlag=e.target.value
  }
  function sendTimer(){
    socket.emit("startTimer",timer)
  }
  function setInputText(e){
    text=e.target.value
  }
  function sendText(){
    socket.emit("giveAdminText",text)
  }
  function sendMine(){
    socket.emit("setMine",{text:text,x:locX,y:locY})
  }
  function sendFlag(){
    socket.emit("setMineToFlag",{mineId:mineNum,mineFlag:mineFlag})
  }
  function sendChatOn(){
    socket.emit("setChat",false)
  }
  function sendChatOff(){
    socket.emit("setChat",true)
  }
  function sendMineOn(){
    socket.emit("setMineFlag",false)
  }
  function sendMineOff(){
    socket.emit("setMineFlag",true)
  }
  function sendChatPvOn(){
    socket.emit("setChatPv",true)
  }
  function sendChatPvOff(){
    socket.emit("setChatPv",false)
  }
  function sendChatPublic(){
    socket.emit("setChatPublic",true)
  }
  function sendMainFlagOn(){
    socket.emit("setMainFlagOn",true)
  }
  function sendDeleteMines(){
    socket.emit("deleteUnflaggedMines",true)
  }
  function sendState0(){
    socket.emit("setStateNumber",0)
  }
  function sendState1(){
    socket.emit("setStateNumber",1)
  }
  function sendState2(){
    socket.emit("setStateNumber",2)
  }
  function sendState3(){
    socket.emit("setStateNumber",3)
  }
  function sendState4(){
    socket.emit("setStateNumber",4)
  }
  function sendState5(){
    socket.emit("setStateNumber",5)
  }
  function sendState6(){
    socket.emit("setStateNumber",6)
  }
  function sendState7(){
    socket.emit("setStateNumber",7)
  }
  function sendState8(){
    socket.emit("setStateNumber",8)
  }
  function sendStopMovement(){
    socket.emit("setMovement",false)
  }
  function sendStartMovement(){
    socket.emit("setMovement",true)
  }
  function sendBaseMusic(){
    socket.emit("setMusic",0)
  }
  function sendEndMusic(){
    socket.emit("setMusic",1)
  }
  return (
      <div tabIndex={0} onKeyDown={keyDownHandler}>
        <div style={{ height: '100%', position: 'absolute', left: '0px', width: '100%', overflow: 'hidden',backgroundColor:'white'}}>
          <div style={{ height: '100%', position: 'fixed', left: '0px', width: '70%', overflow: 'hidden',backgroundColor:'black'}}>
            <div style={{backgroundColor:"white", width:"20%"}}>
              <TextField fullWidth  color={"warning"} onChange={setTimer} hiddenLabel id="outlined-basic" label="" variant="outlined" />
              <Button variant="outlined" color="error" onClick={sendTimer}>شروع تایمر</Button>
            </div>
            <Button variant="outlined" color="error" onClick={sendChatOn}>chat on</Button>
            <Button variant="outlined" color="error" onClick={sendChatOff}>chat off</Button>
            <Button variant="outlined" color="error" onClick={sendMineOn}>mine on</Button>
            <Button variant="outlined" color="error" onClick={sendMineOff}>mine off</Button>
            <Button variant="outlined" color="error" onClick={sendChatPvOn}>Chat Pv On</Button>
            <Button variant="outlined" color="error" onClick={sendChatPvOff}>Chat Pv off</Button>
            <Button variant="outlined" color="error" onClick={sendChatPublic}>Public chat</Button>
            <Button variant="outlined" color="error" onClick={sendMainFlagOn}>Main Flag on</Button>
            <Button variant="outlined" color="error" onClick={sendDeleteMines}>delete unflaged mines</Button>
            <Button variant="outlined" color="error" onClick={sendStopMovement}>stop movement</Button>
            <Button variant="outlined" color="error" onClick={sendStartMovement}>start movement</Button>
            <Button variant="outlined" color="error" onClick={sendBaseMusic}>base music</Button>
            <Button variant="outlined" color="error" onClick={sendEndMusic}>end music</Button>
            <div style={{backgroundColor:"white", width:"20%"}}>
              <TextField fullWidth  color={"warning"} onChange={setMineNum} placeholder='Mine num' hiddenLabel id="outlined-basic" label="" variant="outlined" />
              <TextField fullWidth  color={"warning"} onChange={setMineFlag} placeholder='flag' hiddenLabel id="outlined-basic" label="" variant="outlined" />
              <Button variant="outlined" color="error" onClick={sendFlag}>send mine flag</Button>
            </div>
            <Button variant="outlined" color="error" onClick={sendState0}>state 0</Button>
            <Button variant="outlined" color="error" onClick={sendState1}>state 1</Button>
            <Button variant="outlined" color="error" onClick={sendState2}>state 2</Button>
            <Button variant="outlined" color="error" onClick={sendState3}>state 3</Button>
            <Button variant="outlined" color="error" onClick={sendState4}>state 4</Button>
            <Button variant="outlined" color="error" onClick={sendState5}>state 5</Button>
            <Button variant="outlined" color="error" onClick={sendState6}>state 6</Button>
            <Button variant="outlined" color="error" onClick={sendState7}>state 7</Button>
            <Button variant="outlined" color="error" onClick={sendState8}>state 8</Button>
          </div>
          <div style={{ height: '100%', position: 'fixed', left: '70%', width: '30%', overflow: 'hidden',backgroundColor:'darkblue', border:'5pt solid white',color:'white'}}>
            number of users : {count}
            <br/>
            <TextareaAutosize
                maxRows={40}
                aria-label="maximum height"
                placeholder="صدای محیط"
                defaultValue={textArea}
                style={{ width: "100%"} }
            />
            <div style={{backgroundColor:"white",position:"absolute",bottom:"2vh", width:"100%"}}>
              <TextField fullWidth  color={"warning"} onChange={setInputText} hiddenLabel id="outlined-basic" label="" variant="outlined" />
              <Button variant="outlined" color="error" onClick={sendText}>صدا سازی</Button>
              <Button variant="outlined" color="error" onClick={sendMine} > گذاری</Button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;