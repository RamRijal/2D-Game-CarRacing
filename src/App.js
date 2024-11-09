//Reference: https://www.youtube.com/watch?app=desktop&v=CRzFjBkzpyU//

import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import RedCar from "./assets/redcar.png";
import YellowCar from "./assets/yellowcar.png";
import Crash from "./assets/Crash.mp3";
import BGM from "./assets/RaceBGM.mp3";
import Road from "./assets/Road.png";

const moveRoad = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 25px;
`;

const GameContainer = styled.div`
  width: 500px;
  height: 650px;
  position: relative;
  border: 1px solid black;
  overflow: hidden;
  background-image: url(${require("./assets/Road.png")});
  background-size: 100% 50px;
  animation: ${moveRoad} 3s linear infinite;
`;

const Car = styled.img`
  width: 85px;
  height: 110px;
  position: absolute;
  top: ${(props) => (props.isPlayer ? "auto" : props.y + "px")};
  bottom: ${(props) => (props.isPlayer ? "10px" : "auto")};
  left: ${(props) => props.x + "px"};
  border-radius: 5px;
`;

const Score = styled.div` 
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 30px;
  color: white;
  font-family: Arial, sans-serif;
`;

const Instructions = styled.div`
  margin-left: 0px;
  font-size: 40px;
  color: Gray;
  font-family: Arial, sans-serif;
  padding: 0px;
  border-radius: 5px;
  width: 200px;
  text-align: center;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopUp = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-family: Arial, sans-serif;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  background-color: #ff5722;
  color: white;
`;

const App = () => {
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState(225);
  const [opponents, setOpponents] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const BgMusic = useRef(new Audio(BGM));

  const resetGame = () => {
    setScore(0);
    setPlayer(225);
    setOpponents([]);
    setGameOver(false);
  };

  const CrashSound = useRef(new Audio(Crash));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && player > 0) {
        setPlayer(player - 20);
      }
      if (e.key === "ArrowRight" && player < 430) {
        setPlayer(player + 20);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [player]);

  useEffect(() => {
    const handleRestart = (e) => {
      if (e.key === " "|| "Enter" && gameOver) {
        // Check for "Space" key and if game is over
        resetGame();
      }
    };

    window.addEventListener("keydown", handleRestart);
    return () => window.removeEventListener("keydown", handleRestart);
  }, [gameOver]);

  useEffect(() => {
    BgMusic.current.loop = true; // Set the music to loop
    if (isMusicPlaying && !gameOver) {
      BgMusic.current.play();
    } else {
      BgMusic.current.currentTime = 0;
    }

    return () => BgMusic.current.pause(); // Stop music on component unmount
  }, [isMusicPlaying, gameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        setOpponents((prevOpponents) =>
          prevOpponents
            .map((opponent) => ({
              ...opponent,
              y: opponent.y + opponent.speed,
            }))
            .filter((opponent) => opponent.y < 700)
        );

        if (opponents.length < 4) {
          setOpponents((prevOpponents) => [
            ...prevOpponents,
            {
              x: Math.floor(Math.random() * 450),
              y: -100,
              speed: Math.random() * 5 + 4 + score / 50,
            },
          ]);
        }

        setScore((prevScore) => prevScore + 1);

        for (let opponent of opponents) {
          if (
            opponent.y + 100 > 600 &&
            opponent.x < player + 70 &&
            opponent.x + 70 > player
          ) {
            CrashSound.current.play();
            setGameOver(true);

            clearInterval(interval);
            break;
          }
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [player, score, gameOver, opponents]);

  const toggleMusic = () => {
    setIsMusicPlaying((prev) => !prev);
  };

  return (
    <Container>
      <Instructions>Use Arrow Keys to Move</Instructions>
      <GameContainer src={Road}>
        <Score>Score: {score}</Score>
        <Car src={RedCar} alt="PlayerCar" isPlayer x={player} />
        {opponents.map((opponent, index) => (
          <Car
            key={index}
            src={YellowCar}
            alt="opponentCar"
            x={opponent.x}
            y={opponent.y}
          />
        ))}
      </GameContainer>
      <Instructions>
        <Button onClick={toggleMusic}>
          {isMusicPlaying ? "Sound Off" : "Sound On"}
        </Button>
      </Instructions>
      {gameOver && (
        <PopupOverlay>
          <PopUp>
            <h2>Game Over</h2>
            <p>Your Score: {score}</p>
            <Button onClick={resetGame}>Restart</Button>
          </PopUp>
        </PopupOverlay>
      )}
    </Container>
  );
};

export default App;
