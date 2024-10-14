import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

const PlayerScreen = () => {
    const [name, setName] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [isNextDisabled, setIsNextDisabled] = useState(true);

    const startGame = () => {
        if (name) {
            socket.emit('startGame', name);
            setPlayerName(name);
        }
    };

     // Notify server that a player has accessed the game
    useEffect(() => {
        socket.emit('playerAccessed');

        return () => {
            socket.emit('playerDisconnected', playerName);
        };
    }, [playerName]);

    useEffect(() => {
        socket.on('gameStarted', ({ questions, error }) => {
            if (error) {
                setError(error);
            } else {
                setQuestions(questions);
                setCurrentQuestionIndex(0);
                setGameStarted(true);
                setFeedback('');
                setGameOver(false);
                setCorrectCount(0);
                setIsNextDisabled(true);
            }
        });

        socket.on('nextButtonState', (isDisabled) => {
            setIsNextDisabled(isDisabled);
        });

        return () => {
            socket.off('gameStarted');
            socket.off('nextButtonState');
        };
    }, []);

    const handleAnswer = (selectedAnswer) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isAnswerCorrect = selectedAnswer === currentQuestion.correctAnswer;

        if (isAnswerCorrect) {
            setCorrectCount(correctCount + 1);
        }

        setIsCorrect(isAnswerCorrect);
        setAnswer(selectedAnswer);
        setFeedback(
            <>
                {isAnswerCorrect ? `🎉 Congratulations ${name} 🎉,` : `❌ Sorry ${name} ❌,`}
                <br />
                {isAnswerCorrect ? 'You attempted it right.' : 'You attempted it wrong.'}
            </>
        );

        socket.emit('answer', {
            question: currentQuestion.question,
            selectedAnswer: selectedAnswer,
            currentQuestionIndex: currentQuestionIndex,
            playerName: name,
        });

        socket.emit('enableNextButton');
        setIsNextDisabled(false);
    };


    const handleOptionSelect = (option) => {
        if (!answer) {
            handleAnswer(option);
        }
    };

    const handleNextSubmit = () => {
        if (!answer) {
            setFeedback('Please select an answer before proceeding.');
            return;
        }

        socket.emit('moveToNextQuestion');

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsCorrect(false);
            setAnswer('');
            setFeedback('');
            setIsNextDisabled(true);
        } else {
            setGameOver(true);
        }
    };

    return (
        <div className="flex justify-center">
            <div className="flex flex-col justify-center p-5 my-20 mx-20 w-auto bg-gray-100 border rounded-lg shadow-lg sm:p-8 md:p-10">
                <p className="text-3xl sm:text-2xl md:text-4xl font-bold mb-5 text-center">Quizz App</p>

                {!gameStarted ? (
                    <div className="flex flex-col justify-center items-center mb-5 text-center">
                        <label htmlFor="nameInput" className="block text-lg mb-2">
                        🌟 Enter Your Name 🌟
                        </label>
                        <input
                            id="nameInput"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border p-2 rounded mb-2 w-full sm:w-80"
                        />
                        <button
                            onClick={startGame}
                            disabled={!name}
                            className={`bg-blue-500 text-white p-2 rounded w-full sm:w-80 ${!name ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                        >
                            Start Game
                        </button>
                    </div>
                ) : (
                    <div className="w-full text-center">
                        {gameOver ? (
                            <div className="w-full text-center mt-2">
                                <h2 className="text-sm sm:text-lg md:text-xl mb-4 text-green-500 text-center"><strong>{name}</strong>, Thank you for playing.</h2>
                                <p>You have attempted {questions.length}/{questions.length} questions.</p>
                                <p>with <strong>{correctCount}</strong> correct answers.</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl mb-5 text-green-500 text-center">Hello <strong>{playerName}</strong>, You are playing the game.</h2>

                                <div className={`mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    {feedback}
                                </div>

                                {error && (
                                    <div className="text-red-500 text-center mb-5">
                                        <strong>Error: </strong>{error}
                                    </div>
                                )}

                                {currentQuestionIndex < questions.length && (
                                    <div className="mb-5 bg-white shadow-lg rounded-lg p-4">
                                        <h2 className="text-xl font-semibold mb-2">Current Question:</h2>

                                        <h3 className="font-semibold ">{questions[currentQuestionIndex].question}</h3>
                                        <div className="mt-3 flex flex-col items-center">
                                            {questions[currentQuestionIndex].options.map((option, index) => {
                                                const isSelected = answer === option;
                                                const isAnswerCorrect = isSelected && option === questions[currentQuestionIndex].correctAnswer;
                                                const isAnswerWrong = isSelected && option !== questions[currentQuestionIndex].correctAnswer;
                                                const optionLabel = String.fromCharCode(65 + index);

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleOptionSelect(option)}
                                                        className={`block w-full mb-2 border p-2 rounded
                                                            ${isAnswerCorrect ? 'bg-green-300' : isAnswerWrong ? 'bg-red-300' : ''}`}
                                                        disabled={!!answer}
                                                    >
                                                        {optionLabel}. {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={handleNextSubmit}
                                            disabled={isNextDisabled}
                                            className={`w-full bg-blue-500 text-white p-2 rounded ${answer ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                                        </button>

                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerScreen;
