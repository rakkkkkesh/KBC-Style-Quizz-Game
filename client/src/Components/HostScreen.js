import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { QRCodeCanvas } from 'qrcode.react';

const socket = io();

const HostScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('');
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [playerAccessed, setPlayerAccessed] = useState(false);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);

  useEffect(() => {
    // Listen for player accessing the game
    socket.on('playerAccessed', () => {
      setPlayerAccessed(true);
      setWaitingForPlayer(true);
    });

    // Listen for player being ready (name entered)
    socket.on('playerReady', (name) => {
      setPlayerName(name);
      setWaitingForPlayer(false);
      setGameStarted(true);
    });

    socket.on('gameStarted', ({ questions, playerName }) => {
      setQuestions(questions);
      setPlayerName(playerName);
      setGameStarted(true);
      setCurrentQuestionIndex(0);
      setGameFinished(false);
      setCorrectCount(0);
      setSelectedAnswers({});
      setFeedbackMessage('');
      setFeedbackColor('');
      setIsNextDisabled(true);
    });

    socket.on('moveToNextQuestion', () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setFeedbackMessage('');
        setFeedbackColor('');
        setIsNextDisabled(true)
      } else {
        setGameFinished(true);
      }
    });

    socket.on('answerResult', (data) => {
      const isCorrect = data.selectedAnswer === questions[currentQuestionIndex].correctAnswer;
      if (isCorrect) {
        setCorrectCount((prevCount) => prevCount + 1);
        setFeedbackMessage(`🎉 Congratulations 🎉,<br/> ${data.playerName} attempted right answer.`);
        setFeedbackColor('text-green-500');
      } else {
        setFeedbackMessage(`❌ Sorry ❌,<br/> ${data.playerName} attempted wrong answer.`);
        setFeedbackColor('text-red-500');
      }
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: data.selectedAnswer,
      }));
      setIsNextDisabled(false);
    });


    return () => {
      socket.off('playerAccessed');
      socket.off('playerReady');
      socket.off('gameStarted');
      socket.off('moveToNextQuestion');
      socket.off('answerResult');
    };
  }, [currentQuestionIndex, questions]);

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center p-5 my-20 mx-20 w-auto bg-gray-100 border rounded-lg shadow-lg sm:p-8 md:p-10">
        <h1 className="text-3xl sm:text-2xl md:text-4xl font-bold mb-5 text-center">Host Screen</h1>

        {waitingForPlayer && !gameStarted && (
          <p className="text-center mb-5 text-yellow-500 text-sm sm:text-lg md:text-xl">⏳ Waiting for {playerName || 'player'} to join the game... ⏳</p>
        )}

        {gameStarted && (!gameFinished && (
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-blue-600 text-center">
            🚀 Real-time Action Unleashed! 🚀
          </h2>
        ))}

        {gameStarted && (gameFinished ? (
          <span className="text-sm sm:text-lg md:text-xl mb-4 text-green-500 text-center"><strong>{playerName}</strong> finished the game.</span>
        ) : (
          <span className="text-sm sm:text-lg md:text-xl mb-4 text-green-500 text-center">🎮 Now, <strong>{playerName}</strong> is Playing Game 🎮</span>
        ))}
        {!playerAccessed && !gameStarted && (
          <div className="mb-5 flex flex-col items-center w-full">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold mb-6 animate-pulse text-blue-600 text-center">
              🎉 Welcome to the KBC Game Show! 🎉
            </h1>
            <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-700 mb-6 text-center">
              🎮 Please scan the QR code to participate in the Game 🎮
            </h2>
            <QRCodeCanvas value="https://kbc-style-quizz-game.onrender.com/player" size={256} />
          </div>
        )}
        {gameStarted && questions.length > 0 && !gameFinished && (
          <div className="w-full text-center">
            {/* Display feedback message with conditional color */}
            {feedbackMessage && (
              <p className={`mb-4 ${feedbackColor}`} dangerouslySetInnerHTML={{ __html: feedbackMessage }} />
            )}
            <h2 className="text-xl font-semibold mb-2">Current Question:</h2>
            <div className="mb-4 bg-white shadow-lg rounded-lg p-4 w-full">
              <h3 className="font-semibold">{questions[currentQuestionIndex]?.question}</h3>
              <div className="mt-3 flex flex-col items-center">
                {questions[currentQuestionIndex]?.options.map((option, i) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === option;
                  return (
                    <button
                      key={i}
                      className={`block w-full mb-2 border p-2 rounded hover:bg-blue-200 ${isSelected ? (option === questions[currentQuestionIndex].correctAnswer ? 'bg-green-300' : 'bg-red-300') : ''}`}
                    >
                      {String.fromCharCode(65 + i)}. {option}
                    </button>
                  );
                })}
              </div>
              <button
                className={`w-full bg-blue-500 p-2 rounded ${isNextDisabled ? ' opacity-50 cursor-not-allowed ' : 'opacity-100 '}`}
                disabled={isNextDisabled}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        )}
        {gameFinished && (
          <div className="w-full text-center mt-2">
            <p>
              {playerName} has attempted {questions.length}/{questions.length} questions.
            </p>
            <p>
              with <strong>{correctCount}</strong> correct answers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostScreen;
