const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios')

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

app.get('/player', (req, res) => {
  res.sendFile(path.join(__dirname1, "client","build","index.html"));
});
}

// Function to fetch questions from the API
async function fetchQuestionsFromAPI() {
  try {
    const response = await axios.get('https://opentdb.com/api.php', {
      params: {
        amount: 5, // Number of questions
        category: 18, // Category ID for "Computers" in the API
        type: 'multiple' // Multiple choice questions
      }
    });

    // Format the questions to include options and the correct answer
    const formattedQuestions = response.data.results.map((questionData, index) => {
      const allOptions = [...questionData.incorrect_answers, questionData.correct_answer];
      // Shuffle options
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
      return {
        question: `${index + 1}. ${questionData.question}`,
        options: shuffledOptions,
        correctAnswer: questionData.correct_answer
      };
    });

    return formattedQuestions;
  } catch (error) {
    console.error('Error fetching questions from API:', error);
    return [];
  }
}



// Handle socket connections
io.on('connection', (socket) => {
  console.log('A new client connected:', socket.id);

  // Notify host when a player accesses the game
  socket.on('playerAccessed', () => {
    io.emit('playerAccessed');
  });
  
  // Start the game and emit questions to both player and host
  socket.on('startGame', async (name) => {
    const randomQuestions = await fetchQuestionsFromAPI();
    io.emit('gameStarted', { questions: randomQuestions, playerName: name });
  });

  // Handle the answer from the player
  socket.on('answer', (data) => {
    io.emit('answerResult', data);
  });

  socket.on('moveToNextQuestion', () => {
    socket.broadcast.emit('moveToNextQuestion'); // Emit to all clients except the sender
  });

  socket.on('enableNextButton', () => {
    io.emit('nextButtonState', false);
});

socket.on('disconnect', () => {
  console.log(`Player disconnected: ${socket.id}`);
  // Notify others about the disconnection
  socket.broadcast.emit('playerDisconnected', socket.id);
});
});

// Set the port to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
