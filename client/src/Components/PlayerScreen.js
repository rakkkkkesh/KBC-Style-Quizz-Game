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
    // const [isNextDisabled, setIsNextDisabled] = useState(true);

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
                // setIsNextDisabled(true);
            }
        });

        // Uncomments this code to disable next-submit button, if option is not selected.

        // socket.on('nextButtonState', (isDisabled) => {
        //     setIsNextDisabled(isDisabled);
        // });

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

        // Uncomments this code to enable next-submit button, if option is selected.
        // socket.emit('enableNextButton');
        // setIsNextDisabled(false); 

        //Start of automatically move to next question.
        // Comment this code if you don't want to move to next qustion automatically.
        socket.emit('moveToNextQuestion');

        // Automatically move to the next question after 2 seconds
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setIsCorrect(false);
                setAnswer('');
                setFeedback('');
            } else {
                setGameOver(true);
            }   
        }, 2000);

        //End of automatically move to next question.

    };


    const handleOptionSelect = (option) => {
        if (!answer) {
            handleAnswer(option);
        }
    };


    //Start of move to next question with next-submit button.
    // Uncomment this code if you want to move to next qustion using next-submit button.

    // const handleNextSubmit = () => {
    //     if (!answer) {
    //         setFeedback('Please select an answer before proceeding.');
    //         return;
    //     }

    //     socket.emit('moveToNextQuestion');

    //     if (currentQuestionIndex < questions.length - 1) {
    //         setCurrentQuestionIndex(currentQuestionIndex + 1);
    //         setIsCorrect(false);
    //         setAnswer('');
    //         setFeedback('');
    //         setIsNextDisabled(true);
    //     } else {
    //         setGameOver(true);
    //     }
    // };

    //End of move to next question with next-submit button.


    return (
        <div className="flex justify-center">
            <div className="flex flex-col justify-center p-5 my-20 mx-2 w-full bg-gray-100 border rounded-lg shadow-lg sm:p-8 md:p-10 sm:mx-4 md:mx-6 max-w-screen-sm">
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
                            <div className="w-full text-center mt-2 sm:mt-4 md:mt-6">
                                <h2 className="text-sm sm:text-lg md:text-xl mb-4 text-green-500 text-center"><strong>{name}</strong>, Thank you for playing.</h2>
                                <p className='text-sm sm:text-base md:text-lg'>You have attempted {questions.length}/{questions.length} questions.</p>
                                <p className='text-sm sm:text-base md:text-lg'>with <strong>{correctCount}</strong> correct answers.</p>
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
                                    <div className="flex flex-col items-center text-center mb-4 bg-white shadow-lg rounded-lg p-3 sm:p-4 md:p-6 w-full max-w-screen-sm mx-auto">
                                        <h2 className="text-sm sm:text-xl md:text-xl font-semibold mb-2 text-center">Current Question:</h2>
                                        <h3 className="font-semibold text-sm sm:text-base md:text-lg text-center">{questions[currentQuestionIndex].question}</h3>
                                        <div className="mt-3 p-2 flex flex-col items-center w-full sm:mx-5 md:mx-10">
                                            {questions[currentQuestionIndex].options.map((option, index) => {
                                                const isSelected = answer === option;
                                                const isAnswerCorrect = isSelected && option === questions[currentQuestionIndex].correctAnswer;
                                                const isAnswerWrong = isSelected && option !== questions[currentQuestionIndex].correctAnswer;
                                                const optionLabel = String.fromCharCode(65 + index);

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleOptionSelect(option)}
                                                        className={`text-center text-sm sm:text-base md:text-lg lg:text-md xl:text-base w-full mb-2 border p-2 rounded hover:bg-blue-200
                                                            ${isAnswerCorrect ? 'bg-green-300' : isAnswerWrong ? 'bg-red-300' : ''}`}
                                                        disabled={!!answer}
                                                    >
                                                        {optionLabel}. {option}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Start of move to next question with next-submit button. */}
                                        {/* Uncomment this code if you want to move to next questions with next-submit button. */}
                                        
                                        {/* <button
                                            onClick={handleNextSubmit}
                                            disabled={isNextDisabled}
                                            className={`text-center w-full bg-blue-500 text-white p-2 rounded ${answer ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                                        </button> */}

                                        {/* End of move to next question with next-submit button. */}
                                        
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
