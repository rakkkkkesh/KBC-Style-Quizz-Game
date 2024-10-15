# KBC-Style Quiz Game

This project is a Kaun Banega Crorepati (KBC)-style quiz game built using React and Socket.IO. It allows players to participate in a real-time quiz game where they can answer multiple-choice questions while the host monitors their progress. The game consists of two main screens: the Host Screen and the Player Screen, each with distinct functionalities.

## Features

- **Real-time Interaction:** The game supports real-time communication using Socket.IO, enabling smooth interaction between the host and the player.
- **QR Code Participation:** Players can join the game by scanning a QR code displayed on the Host Screen.
- **Multiple-Choice Questions:** Players can answer a series of multiple-choice questions, with feedback provided for each attempt.
- **Automatic or Manual Question Navigation:** The game can be configured to automatically move to the next question or allow manual progression.
- **Real-time Feedback:** Feedback is displayed after each question, indicating whether the answer was correct or incorrect.
- **Player Disconnection Handling:** The game detects when a player disconnects, allowing the host to take appropriate action.
- **Responsive Design:** The application is styled to be mobile-friendly, using Tailwind CSS for a polished appearance.

## Technologies Used

- **React:** For building the user interface.
- **Socket.IO:** For real-time communication between the host and player screens.
- **QRCode.react:** For generating QR codes to allow players to join the game.
- **Tailwind CSS:** For styling and responsive design.
- **Express:** For the backend server handling Socket.IO connections.

## Project Structure

The project consists of two main components:

- **Host Screen:** Displays the questions, monitors the player's progress, and provides feedback.
- **Player Screen:** Allows players to join the game, view questions, and submit answers.

## Usage

The Host Screen displays a QR code for players to scan and join the game.
Once a player joins, the host can start the game, and the questions will be displayed on both the Host Screen and the Player Screen.
Players select their answers on the Player Screen, and the host receives real-time feedback on their answers.
The game continues until all questions are answered, after which the results are displayed.

## Customization

The game settings can be adjusted to enable or disable automatic question navigation.
Modify the list of questions or adjust the feedback display duration by updating the relevant code sections in the HostScreen and PlayerScreen components.
