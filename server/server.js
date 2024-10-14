const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Deployment
const __dirname1 = path.resolve();
app.use(express.static(path.join(__dirname1, "client", "build")));

if(process.env.NODE_ENV==="production"){
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname1, "client","build","index.html"));
  });

  app.get('/player', (req, res) => {
    res.sendFile(path.join(__dirname1, "client","build","index.html"));
});
} else{
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname1, "client","build","index.html"));
  });

// The "catchall" handler: for any request that doesn't match one above, send back index.html.
app.get('/player', (req, res) => {
  res.sendFile(path.join(__dirname1, "client","build","index.html"));
});
}

// Questions array
const questions = [
  {
    question: '1. What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4', // Correct answer
  },
  {
    question: '2. What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    correctAnswer: 'Paris', // Correct answer
  },
  {
    question: '3. Who wrote "Romeo and Juliet"?',
    options: ['Mark Twain', 'Charles Dickens', 'William Shakespeare', 'Jane Austen'],
    correctAnswer: 'William Shakespeare', // Correct answer
  },
  {
    question: '4. What is the largest planet in our Solar System?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Jupiter', // Correct answer
  },
  {
    question: '5. What is the boiling point of water?',
    options: ['0°C', '50°C', '100°C', '200°C'],
    correctAnswer: '100°C', // Correct answer
  },
  // Add more questions as needed...
];



// Handle socket connections
io.on('connection', (socket) => {
  console.log('A new client connected:', socket.id);

  // Notify host when a player accesses the game
  socket.on('playerAccessed', () => {
    io.emit('playerAccessed');
  });
  
  // Start the game and emit questions to both player and host
  socket.on('startGame', (name) => {
    io.emit('gameStarted', { questions, playerName: name });
  });

  // Handle the answer from the player
  socket.on('answer', (data) => {
    io.emit('answerResult', data);
  });

  // Handle moving to the next question
  socket.on('moveToNextQuestion', () => {
    socket.broadcast.emit('moveToNextQuestion'); // Emit to all clients except the sender
  });

  socket.on('enableNextButton', () => {
    io.emit('nextButtonState', false);
});

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Set the port to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
