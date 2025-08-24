"use client";

import { useState, useEffect, JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
// Added guide component
import Guide from "./components/ui/guide";

import { sdk } from "@farcaster/miniapp-sdk";
import QuizGame from "./pages/quiz.";
import MainMenu from "./pages/main_menu";
import CategoryMenu from "./pages/choose_category";
import easy_science from "./questions/science/easy_science.json";
import easy_math from "./questions/math/easy_math.json";
import easy_history from "./questions/history/easy_history.json";

type GameState = "menu" | "quiz" | "category" | "results";
type QuizCategory = "Science" | "Math" | "History" | "exit";
interface Question {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  difficulty: string;
  points: number;
  isAnswered: boolean;
}

export default function QuizRacingGame(): JSX.Element {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [quizCategory, setQuizCategory] = useState<QuizCategory>("Science");

  const questionBank: Record<string, Question[]> = {
    Science: easy_science,
    Math: easy_math,
    History: easy_history,
  };

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (document.readyState !== "complete") {
          await new Promise((resolve) => {
            if (document.readyState === "complete") {
              resolve(void 0);
            } else {
              window.addEventListener("load", () => resolve(void 0), {
                once: true,
              });
            }
          });
        }

        await sdk.actions.ready();
        console.log(
          "Farcaster SDK initialized successfully - app fully loaded"
        );
      } catch (error) {
        console.error("Failed to initialize Farcaster SDK:", error);
        setTimeout(async () => {
          try {
            await sdk.actions.ready();
            console.log("Farcaster SDK initialized on retry");
          } catch (retryError) {
            console.error("Farcaster SDK retry failed:", retryError);
          }
        }, 1000);
      }
    };

    initializeFarcaster();
  }, []);

  return (
    // Added svg background
    <div
      className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 902 451' preserveAspectRatio='none'><rect x='0' y='0' width='902' height='451' fill='%23ffffff'/><g><path d='M -551.00 -15.10 S -285.50 -37.65 0.00 -15.10 173.00 -37.65 551.00 -15.10 816.50 -52.10 1102.00 -15.10 1226.00 -60.10 1653.00 -15.10 h 110 V 651 H -551.00 Z' fill='%23F6F6F6'/><path d='M -551.00 30.00 S -285.50 2.00 0.00 30.00 265.50 7.45 551.00 30.00 814.00 2.00 1102.00 30.00 1367.50 7.45 1653.00 30.00 h 110 V 651 H -551.00 Z' fill='%23e2ede5'/><path d='M -551.00 75.10 S -285.50 33.10 0.00 75.10 265.50 44.10 551.00 75.10 710.00 52.55 1102.00 75.10 1165.00 43.10 1653.00 75.10 h 110 V 651 H -551.00 Z' fill='%23cee4d4'/><path d='M -551.00 120.20 S -285.50 97.65 0.00 120.20 265.50 80.20 551.00 120.20 665.00 76.20 1102.00 120.20 1094.00 93.20 1653.00 120.20 h 110 V 651 H -551.00 Z' fill='%23badbc3'/><path d='M -551.00 165.30 S -285.50 128.30 0.00 165.30 265.50 142.75 551.00 165.30 816.50 138.30 1102.00 165.30 1367.50 122.30 1653.00 165.30 h 110 V 651 H -551.00 Z' fill='%23a6d2b2'/><path d='M -551.00 210.40 S -285.50 173.40 0.00 210.40 53.00 187.85 551.00 210.40 816.50 169.40 1102.00 210.40 1301.00 181.40 1653.00 210.40 h 110 V 651 H -551.00 Z' fill='%2392c9a1'/><path d='M -551.00 255.50 S -285.50 232.95 0.00 255.50 265.50 211.50 551.00 255.50 816.50 228.50 1102.00 255.50 1123.00 225.50 1653.00 255.50 h 110 V 651 H -551.00 Z' fill='%237ec090'/><path d='M -551.00 300.60 S -398.00 256.60 0.00 300.60 75.00 278.05 551.00 300.60 816.50 278.05 1102.00 300.60 1151.00 263.60 1653.00 300.60 h 110 V 651 H -551.00 Z' fill='%236ab77f'/><path d='M -551.00 345.70 S -285.50 313.70 0.00 345.70 171.00 323.15 551.00 345.70 580.00 323.15 1102.00 345.70 1367.50 311.70 1653.00 345.70 h 110 V 651 H -551.00 Z' fill='%2356ae6e'/><path d='M -551.00 390.80 S -365.00 358.80 0.00 390.80 265.50 361.80 551.00 390.80 723.00 349.80 1102.00 390.80 1367.50 359.80 1653.00 390.80 h 110 V 651 H -551.00 Z' fill='%2342a55d'/><path d='M -551.00 435.90 S -357.00 409.90 0.00 435.90 265.50 395.90 551.00 435.90 816.50 395.90 1102.00 435.90 1344.00 394.90 1653.00 435.90 h 110 V 651 H -551.00 Z' fill='%232e9c4c'/></g></svg>")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Racing Styles */}
      <style jsx>{`
        @keyframes gallop {
          0%,
          100% {
            transform: translateY(0px) scaleX(1);
          }
          25% {
            transform: translateY(-2px) scaleX(1.05);
          }
          50% {
            transform: translateY(0px) scaleX(1);
          }
          75% {
            transform: translateY(-1px) scaleX(0.95);
          }
        }

        @keyframes dust {
          0% {
            transform: translateX(0px) scale(0);
            opacity: 0.6;
          }
          50% {
            transform: translateX(-20px) scale(1);
            opacity: 0.3;
          }
          100% {
            transform: translateX(-40px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes rainbow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .horse-sprite {
          animation: gallop 0.3s infinite ease-in-out;
        }

        .racing .horse-sprite {
          animation: gallop 0.15s infinite ease-in-out;
        }

        .dust-trail {
          animation: dust 0.8s infinite ease-out;
        }

        .rainbow-bg {
          background: linear-gradient(
            -45deg,
            #ee7752,
            #e73c7e,
            #23a6d5,
            #23d5ab
          );
          background-size: 400% 400%;
          animation: rainbow 3s ease infinite;
        }

        .track-gradient {
          background: linear-gradient(
            to bottom,
            #6366f1 0%,
            #8b5cf6 20%,
            #a855f7 40%,
            #c084fc 60%,
            #d8b4fe 80%,
            #e9d5ff 100%
          );
        }
      `}</style>

      <header className="mx-auto space-y-8">
        {/* Header */}
        <Card className="rainbow-bg bg-green-700">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🧠 StallionQuiz 🏁
            </CardTitle>
            <div className="text-lg text-white mb-4 drop-shadow">
              Test Your Knowledge & Watch the Race!
            </div>
          </CardHeader>
        </Card>
      </header>

      <main className="my-0">
        {gameState === "menu" && (
          <MainMenu onStart={(newState) => setGameState(newState)} />
        )}
        {gameState === "quiz" && (
          <QuizGame
            questions={questionBank[quizCategory]}
            onExit={(state) => setGameState(state)}
          />
        )}
        {gameState === "category" && (
          <CategoryMenu
            onSelect={(cat) => {
              if (cat === "exit") {
                setGameState("menu");
              } else {
                setQuizCategory(cat);
                setGameState("quiz");
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
