// const express = require('express');
// const app = express();
// const server1 = require('http').Server(app);
// const fs = require('fs');
// server1.listen(process.env.PORT || 8080);
//
// app.use(express.static('public'));
// app.set('view engine', 'ejs');
// app.get('/', (req, res) => {
//   res.render('frontpage');
// })
//
// const { v4: uuidv4 } = require('uuid');
// var un, pc;
// app.get('/newroom', (req, res) => {
//   un = req.query.username;
//   pc = req.query.passcode;
//   var roomId = uuidv4();
//   fs.appendFileSync("public/meeting-log.txt", roomId + ":" + pc + "\n", "utf-8");
//   res.redirect(`/${roomId}`);
// })
//
// var unJ, inJ, pcJ;
// app.get('/joinroom', (req, res) => {
//   unJ = req.query.username;
//   inJ = req.query.invitation;
//   pcJ = req.query.passcode;
//   var log = fs.readFileSync("public/meeting-log.txt", "utf-8");
//   var findInvitation = log.indexOf(inJ + ":" + pcJ);
//   if (findInvitation != -1) {
//     res.redirect(`/${inJ}`);
//     un = unJ,
//       pc = pcJ
//   } else {
//     var findInvitation = log.indexOf(inJ);
//     if (findInvitation == -1) {
//       res.send("Invalid invitation. Please <a href=/>go back</a>");
//     } else {
//       var findPassCode = log.indexOf(inJ + ":" + pcJ);
//       if (findPassCode == -1) {
//         res.send("Invalid password. Please <a href=/>go back</a>");
//       }
//     }
//   }
// });
//
// app.get('/:room', (req, res) => {
//   res.render('meeting-room', {
//     roomId: req.params.room,
//     username: un,
//   });
// })
//
// const { ExpressPeerServer } = require('peer');
// const peerServer = ExpressPeerServer(server1, {
//   debug: true
// });
// app.use('/peerjs', peerServer);
//
// const io1 = require('socket.io')(server1);
// io1.on('connection', socket => {
//   socket.on('join-room', (roomId, peerId) => {
//     socket.join(roomId);
//     socket.to(roomId).emit('user-connected', peerId);
//
//     socket.on('stop-screen-share', (peerId) => {
//       io1.to(roomId).emit('no-share', peerId);
//     })
//
//     socket.on('message', (message, sender, color, time) => {
//       io1.to(roomId).emit('createMessage', message, sender, color, time);
//     })
//
//     socket.on('leave-meeting', (peerId, peerName) => {
//       io1.to(roomId).emit('user-leave', peerId, peerName);
//     })
//   })
// })
//
// app.post('/upload', (req, res) => {
//   const fileName = req.headers['file-name'];
//   req.on('data', (chunk) => {
//     fs.appendFileSync(__dirname + '/public/uploaded-files/' + fileName, chunk);
//   })
//   res.end('uploaded');
// });

const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files for your application
app.use(express.static('public'));

// Setting the view engine to EJS
app.set('view engine', 'ejs');

// Start the server
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});

// Event handling for ExpressPeerServer
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);

// Function to handle AI response
async function getAIResponse(inputData) {
  try {
    const response = await axios.post('http://localhost:8000/api/ai-endpoint/', inputData);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw error;
  }
}

// Handle incoming socket connections and events
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle AI requests from the client
  socket.on('ai-request', async (inputData) => {
    console.log('Received ai-request event with data:', inputData);

    try {
      const aiResponse = await getAIResponse(inputData);
      console.log('AI response:', aiResponse);
      socket.emit('ai-response', aiResponse);
    } catch (error) {
      console.error('Error handling AI request:', error);
    }
  });

  // Handling other socket events (e.g., join-room, stop-screen-share, etc.)
  socket.on('join-room', (roomId, peerId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', peerId);

    socket.on('stop-screen-share', (peerId) => {
      io.to(roomId).emit('no-share', peerId);
    });

    socket.on('message', (message, sender, color, time) => {
      io.to(roomId).emit('createMessage', message, sender, color, time);
    });

    socket.on('leave-meeting', (peerId, peerName) => {
      io.to(roomId).emit('user-leave', peerId, peerName);
    });
  });
});

// Handling application routes
app.get('/', (req, res) => {
  res.render('frontpage');
});
var un, passcode, roomId;
app.get('/newroom', (req, res) => {
  un = req.query.username;
  passcode = req.query.passcode;
  roomId = uuidv4();

  fs.appendFileSync("public/meeting-log.txt", `${roomId}:${passcode}\n`, "utf-8");
  res.redirect(`/${roomId}`);
});

var unj, invitation, passcodej;
app.get('/joinroom', (req, res) => {
  unj = req.query.username;
  invitation = req.query.invitation;
  passcodej = req.query.passcode;

  const log = fs.readFileSync("public/meeting-log.txt", "utf-8");
  const findInvitation = log.indexOf(`${invitation}:${passcodej}`);

  if (findInvitation !== -1) {
    res.redirect(`/${invitation}`);
    un = unj,
        passcode = passcodej
  } else {
    res.send("Invalid invitation or passcode. Please <a href=/>go back</a>");
  }
});

app.get('/:room', (req, res) => {
  res.render('meeting-room', {
    roomId: req.params.room,
    username: un,
  });
});

app.post('/upload', (req, res) => {
  const fileName = req.headers['file-name'];

  req.on('data', (chunk) => {
    fs.appendFileSync(__dirname + '/public/uploaded-files/' + fileName, chunk);
  });

  res.end('uploaded');
});
