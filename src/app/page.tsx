"use client";

import { useState, useEffect, JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

import { sdk } from "@farcaster/miniapp-sdk";
import QuizGame from "./pages/quiz.";
import MainMenu from "./pages/main_menu";
import CategoryMenu from "./pages/choose_category";

type GameState = "menu" | "quiz" | "category";
type QuizCategory = "Science" | "Math" | "History" | "exit";

export default function QuizRacingGame(): JSX.Element {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [quizCategory, setQuizCategory] = useState<QuizCategory>("Science");

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
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50 p-4">
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

      <header className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="rainbow-bg border-indigo-500 shadow-xl">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🧠 QUIZ RACING CHAMPIONSHIP 🏁
            </CardTitle>
            <div className="text-lg text-white mb-4 drop-shadow">
              Test Your Knowledge & Watch the Race!
            </div>
          </CardHeader>
        </Card>
      </header>

      <main className="my-5">
        {gameState === "menu" && (
          <MainMenu onStart={(newState) => setGameState(newState)} />
        )}
        {gameState === "quiz" && (
          <QuizGame onStart={(newState) => setGameState(newState)} />
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

      <footer>
        {/* Game Guide */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-800">
              🎯 How to Play Quiz Racing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-700 text-base">
                  🧠 Racing Rules:
                </h4>
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-green-600">🟢</span>
                    <span>
                      Read the question and pick your answer (A, B, C, or D)
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-blue-600">🔵</span>
                    <span>Each horse represents a different answer choice</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-600">🔴</span>
                    <span>
                      Watch the race - correct answers win more often!
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-700 text-base">
                  📊 Scoring System:
                </h4>
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-yellow-600">⭐</span>
                    <span>Easy: 15 pts, Medium: 20 pts, Hard: 30 pts</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-purple-600">💜</span>
                    <span>Streak bonuses: +10 pts every 3 correct answers</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-orange-600">🧡</span>
                    <span>Wrong answers: -5 points (but never below 0!)</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
