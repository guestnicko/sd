import { useEffect, useRef, useState } from "react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import sdk from "@farcaster/miniapp-sdk";
import { Button } from "../components/ui/button";
import { Progress } from "@radix-ui/react-progress";

interface Horse {
  id: number;
  name: string;
  color: string;
  secondaryColor: string;
  answerChoice: string;
  speed: number;
  position: number;
  emoji: string;
}

interface Question {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  difficulty: string;
  points: number;
}

interface RaceResult {
  winner: Horse;
  positions: Horse[];
}

interface QuizState {
  selectedAnswer: number | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  currentQuestion: Question | null;
  isRacing: boolean;
  raceResult: RaceResult | null;
  lastScore: number;
  streak: number;
}

const HORSES: Horse[] = [
  {
    id: 1,
    name: "Option A",
    color: "#FF6B6B",
    secondaryColor: "#FF8E8E",
    answerChoice: "A",
    speed: 0,
    position: 0,
    emoji: "🅰️",
  },
  {
    id: 2,
    name: "Option B",
    color: "#4ECDC4",
    secondaryColor: "#6BCCC4",
    answerChoice: "B",
    speed: 0,
    position: 0,
    emoji: "🅱️",
  },
  {
    id: 3,
    name: "Option C",
    color: "#45B7D1",
    secondaryColor: "#67C5D1",
    answerChoice: "C",
    speed: 0,
    position: 0,
    emoji: "🔵",
  },
  {
    id: 4,
    name: "Option D",
    color: "#96CEB4",
    secondaryColor: "#AACEB4",
    answerChoice: "D",
    speed: 0,
    position: 0,
    emoji: "🟢",
  },
];

type MainMenuProps = {
  onStart: (state: "menu" | "quiz" | "category") => void;
};
type QuizCategory = {
  onSelect: (category: "Science" | "Math" | "History" | "exit") => void;
};
type GameState = "menu" | "quiz" | "category";

type QuizProps = {
  questions: Question[]; // ✅ now correctly typed
  onExit: (state: GameState) => void; // ✅ parent callback
};
export default function QuizGame({ onExit, questions }: QuizProps) {
  const handleClick = () => {
    onExit("menu");
  };
  const [QUESTIONS, setQuestions] = useState<Question[]>(questions);

  if (questions) {
  }

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

  const [QuizState, setQuizState] = useState<QuizState>({
    selectedAnswer: null,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    currentQuestion: null,
    isRacing: false,
    raceResult: null,
    lastScore: 0,
    streak: 0,
  });

  const [horses, setHorses] = useState<Horse[]>(HORSES.map((h) => ({ ...h })));
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomQuestion = (): Question => {
    return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  };

  const startNewQuestion = (): void => {
    const newQuestion = getRandomQuestion();
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: newQuestion,
      selectedAnswer: null,
      raceResult: null,
      lastScore: 0,
    }));

    // Reset horse positions
    setHorses(HORSES.map((h) => ({ ...h, position: 0, speed: 0 })));
  };

  const handleAnswerSelect = (answerIndex: number): void => {
    if (QuizState.isRacing) return;
    setQuizState((prev) => ({ ...prev, selectedAnswer: answerIndex }));
  };

  const startRace = (): void => {
    if (
      QuizState.selectedAnswer === null ||
      !QuizState.currentQuestion ||
      QuizState.isRacing
    ) {
      return;
    }

    setQuizState((prev) => ({
      ...prev,
      isRacing: true,
      totalQuestions: prev.totalQuestions + 1,
    }));

    // Determine if answer is correct
    const isCorrect =
      QuizState.selectedAnswer === QuizState.currentQuestion.correctAnswer;

    // Set horse speeds - correct answer horse gets advantage
    const raceHorses = horses.map((horse, index) => {
      let speed;
      if (index === QuizState.currentQuestion!.correctAnswer) {
        // Correct answer horse - faster speed
        speed = isCorrect
          ? Math.random() * 0.8 + 1.8
          : Math.random() * 0.6 + 1.4;
      } else if (index === QuizState.selectedAnswer) {
        // User's selected (wrong) answer - slower speed
        speed = Math.random() * 0.4 + 0.8;
      } else {
        // Other horses - random speed
        speed = Math.random() * 0.8 + 1.0;
      }

      return {
        ...horse,
        position: 0,
        speed,
      };
    });

    setHorses(raceHorses);

    // Start race animation
    const raceInterval = setInterval(() => {
      setHorses((prevHorses) => {
        const updatedHorses = prevHorses.map((horse) => ({
          ...horse,
          position: horse.position + horse.speed * (Math.random() * 0.4 + 0.8),
        }));

        // Check if any horse has finished
        const finishedHorses = updatedHorses.filter(
          (horse) => horse.position >= 100
        );

        if (finishedHorses.length > 0) {
          clearInterval(raceInterval);

          const sortedHorses = [...updatedHorses].sort(
            (a, b) => b.position - a.position
          );
          const winner = sortedHorses[0];

          const raceResult: RaceResult = {
            winner,
            positions: sortedHorses,
          };

          // Calculate score based on correctness
          let scoreGained = 0;
          let newStreak = 0;
          let correctAnswersCount = QuizState.correctAnswers;

          if (
            QuizState.selectedAnswer ===
            QuizState.currentQuestion!.correctAnswer
          ) {
            // Correct answer
            scoreGained = QuizState.currentQuestion!.points;
            newStreak = QuizState.streak + 1;
            correctAnswersCount = QuizState.correctAnswers + 1;

            // Bonus for streak
            if (newStreak >= 3) {
              scoreGained += Math.floor(newStreak / 3) * 10; // Bonus points for streak
            }
          } else {
            // Wrong answer - lose small amount but not below 0
            scoreGained = -5;
            newStreak = 0;
          }

          setQuizState((prev) => ({
            ...prev,
            isRacing: false,
            raceResult,
            score: Math.max(0, prev.score + scoreGained),
            lastScore: scoreGained,
            streak: newStreak,
            correctAnswers: correctAnswersCount,
          }));

          return updatedHorses.map((horse) => ({
            ...horse,
            position: Math.min(horse.position, 100),
          }));
        }

        return updatedHorses;
      });
    }, 80);

    raceIntervalRef.current = raceInterval;
  };

  const resetGame = (): void => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
    }

    setHorses(HORSES.map((h) => ({ ...h, position: 0, speed: 0 })));
    setQuizState({
      selectedAnswer: null,
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      currentQuestion: null,
      isRacing: false,
      raceResult: null,
      lastScore: 0,
      streak: 0,
    });
  };

  useEffect(() => {
    // Load first question on mount
    if (!QuizState.currentQuestion) {
      startNewQuestion();
    }

    return () => {
      if (raceIntervalRef.current) {
        clearInterval(raceIntervalRef.current);
      }
    };
  }, [QuizState.currentQuestion]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "Science":
        return "bg-blue-500";
      case "History":
        return "bg-purple-500";
      case "Geography":
        return "bg-green-500";
      case "Sports":
        return "bg-orange-500";
      case "Technology":
        return "bg-gray-500";
      case "Mathematics":
        return "bg-pink-500";
      default:
        return "bg-indigo-500";
    }
  };
  return (
    <>
      {" "}
      <Button
        onClick={handleClick}
        variant="outline"
        className="w-full h-12 text-lg font-bold border-2 border-gray-400 bg-red-400 hover:bg-red-500"
      >
        ⬅️ Exit to Main Menu
      </Button>
      {/* Question Card */}
      {QuizState.currentQuestion && (
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-300 shadow-xl my-3">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge
                className={`text-white px-4 py-2 ${getCategoryColor(
                  QuizState.currentQuestion.category
                )}`}
              >
                📚 {QuizState.currentQuestion.category}
              </Badge>
              <div className="flex gap-2">
                <Badge
                  className={`text-white px-4 py-2 ${getDifficultyColor(
                    QuizState.currentQuestion.difficulty
                  )}`}
                >
                  ⭐ {QuizState.currentQuestion.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 bg-purple-100 border-purple-300"
                >
                  🎯 {QuizState.currentQuestion.points} pts
                </Badge>
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-800 leading-relaxed">
              {QuizState.currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QuizState.currentQuestion.answers.map((answer, index) => {
                const horse = horses[index];
                const isSelected = QuizState.selectedAnswer === index;
                const isCorrect =
                  index === QuizState.currentQuestion!.correctAnswer;
                const showResult = QuizState.raceResult !== null;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={QuizState.isRacing}
                    className={`
                        h-auto p-6 text-left justify-start relative overflow-hidden text-wrap
                        ${
                          isSelected && !showResult
                            ? "ring-4 ring-blue-400 bg-blue-100 border-blue-400"
                            : ""
                        }
                        ${
                          showResult && isCorrect
                            ? "bg-green-100 border-green-400 ring-4 ring-green-400"
                            : ""
                        }
                        ${
                          showResult && !isCorrect && isSelected
                            ? "bg-red-100 border-red-400 ring-4 ring-red-400"
                            : ""
                        }
                        ${
                          !isSelected && !showResult
                            ? "bg-white hover:bg-gray-50 border-gray-300"
                            : ""
                        }
                        transition-all duration-300 transform hover:scale-102
                      `}
                    variant="outline"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-2xl font-bold"
                          style={{ backgroundColor: horse.color }}
                        >
                          {horse.emoji}
                        </div>
                        <div className="text-2xl font-bold text-gray-700">
                          {horse.answerChoice}.
                        </div>
                      </div>
                      <div className="flex-1 text-lg font-medium text-gray-800">
                        {answer}
                      </div>
                      {showResult && isCorrect && (
                        <div className="text-2xl">✅</div>
                      )}
                      {showResult && !isCorrect && isSelected && (
                        <div className="text-2xl">❌</div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={startRace}
                disabled={
                  QuizState.isRacing || QuizState.selectedAnswer === null
                }
                className="h-14 px-8 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white"
              >
                {QuizState.isRacing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🏃</span>
                    Racing in Progress...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🚀 Start the Race! 🚀
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Race Track */}
      <Card className="bg-gradient-to-b from-purple-200 to-purple-300 border-purple-400 shadow-xl overflow-hidden my-3">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-800 flex items-center gap-2">
            🏁 Knowledge Racing Track 🏁
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Grandstand Background */}
          <div className="h-24 bg-gradient-to-b from-gray-300 to-gray-500 border-b-4 border-gray-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 via-white to-purple-200 opacity-30"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-gray-700 font-bold text-sm">
              🏟️ QUIZ CHAMPIONS STADIUM 🏟️
            </div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
              Crowd: {QuizState.isRacing ? "🎉 GO! GO! GO!" : "🤔 Thinking..."}
            </div>
          </div>

          {/* Racing Track */}
          <div className="track-gradient p-6 relative">
            <div className="space-y-4">
              {horses.map((horse, index) => {
                const isCorrectAnswer =
                  QuizState.currentQuestion &&
                  index === QuizState.currentQuestion.correctAnswer;
                const isUserChoice = QuizState.selectedAnswer === index;

                return (
                  <div key={horse.id} className="relative">
                    {/* Lane Background */}
                    <div
                      className={`h-16 border-2 rounded-lg relative overflow-hidden shadow-inner ${
                        isCorrectAnswer
                          ? "bg-gradient-to-r from-green-200 via-green-300 to-green-200 border-green-400"
                          : isUserChoice
                          ? "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 border-blue-400"
                          : "bg-gradient-to-r from-white via-gray-100 to-white border-gray-300"
                      }`}
                    >
                      {/* Lane Identifier */}
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border-2 border-gray-400 shadow">
                        {horse.answerChoice}
                      </div>

                      {/* Track Lines */}
                      <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-1/2 left-16 right-4 h-px bg-white opacity-40"></div>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 h-full w-px bg-white opacity-30"
                            style={{ left: `${16 + i * 10}%` }}
                          ></div>
                        ))}
                      </div>

                      {/* Finish Line */}
                      <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-r from-red-500 to-red-600 border-l-2 border-red-700 shadow-lg flex items-center justify-center">
                        <div className="text-white text-xs font-bold transform rotate-90">
                          🏁
                        </div>
                      </div>

                      {/* Horse Sprite */}
                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-75 ${
                          QuizState.isRacing ? "racing" : ""
                        }`}
                        style={{
                          left: `${Math.max(
                            8,
                            Math.min(88, 8 + horse.position * 0.8)
                          )}%`,
                          zIndex: 10 - index,
                        }}
                      >
                        {/* Dust Trail */}
                        {QuizState.isRacing && horse.speed > 0 && (
                          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                            <div className="dust-trail w-4 h-2 bg-purple-400 opacity-50 rounded-full"></div>
                          </div>
                        )}

                        {/* Horse Body */}
                        <div className="relative">
                          <div
                            className="horse-sprite w-16 h-12 rounded-xl shadow-xl border-3 border-white relative overflow-hidden"
                            style={{
                              background: `linear-gradient(45deg, ${horse.color} 0%, ${horse.secondaryColor} 100%)`,
                            }}
                          >
                            {/* Horse Emoji */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl drop-shadow-lg">
                                🐎
                              </span>
                            </div>

                            {/* Answer Choice Badge */}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-gray-400 shadow-lg flex items-center justify-center">
                              <span className="text-lg font-bold">
                                {horse.emoji}
                              </span>
                            </div>

                            {/* Choice Indicator */}
                            {isUserChoice && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold shadow">
                                  YOUR PICK
                                </div>
                              </div>
                            )}

                            {isCorrectAnswer && QuizState.raceResult && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold shadow animate-pulse">
                                  CORRECT!
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Speed Indicator */}
                          {QuizState.isRacing && horse.speed > 0 && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                              <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold shadow">
                                {(horse.speed * 60).toFixed(0)} mph
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <Progress
                        value={Math.min(horse.position, 100)}
                        className="h-3 bg-gray-200"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Race Status */}
            <div className="mt-6 text-center">
              {QuizState.isRacing ? (
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg inline-block shadow-lg animate-pulse">
                  🏃‍♂️ KNOWLEDGE RACE IN PROGRESS! 🧠
                </div>
              ) : (
                <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg inline-block shadow-lg">
                  🎓 Ready for Quiz Racing! 🏁
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Race Results */}
      {QuizState.raceResult && (
        <Card className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 border-yellow-400 shadow-xl my-3">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-800 text-center">
              🏆 RACE RESULTS & SCORE UPDATE 🏆
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Winner Announcement */}
              <div className="text-center p-6 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 border-4 border-yellow-600 rounded-xl shadow-lg">
                <h3 className="text-3xl md:text-4xl font-bold text-yellow-900 mb-2">
                  🎉 WINNER: Option {QuizState.raceResult.winner.answerChoice}{" "}
                  🎉
                </h3>
                <div className="text-xl text-yellow-800">
                  {QuizState.raceResult.winner.emoji} The Correct Answer!{" "}
                  {QuizState.raceResult.winner.emoji}
                </div>
              </div>

              {/* Correct Answer Display */}
              {QuizState.currentQuestion && (
                <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-800 mb-2">
                      ✅ Correct Answer:{" "}
                      {
                        QuizState.currentQuestion.answers[
                          QuizState.currentQuestion.correctAnswer
                        ]
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Score Result */}
              <div className="text-center p-6 rounded-xl border-2 shadow-lg">
                {QuizState.lastScore > 0 ? (
                  <div className="bg-gradient-to-r from-green-200 to-emerald-200 border-green-500 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-800 mb-2">
                      🎊 CORRECT! WELL DONE! 🎊
                    </p>
                    <p className="text-xl text-green-700">
                      +{QuizState.lastScore} points earned! 🌟
                    </p>
                    {QuizState.streak > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        🔥 {QuizState.streak} question streak! Keep it up!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-200 to-pink-200 border-red-500 rounded-xl p-4">
                    <p className="text-xl font-bold text-red-800 mb-2">
                      📚 Keep Learning!
                    </p>
                    <p className="text-lg text-red-700">
                      {QuizState.lastScore < 0
                        ? `${QuizState.lastScore} points`
                        : "No points this time"}
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Every question is a learning opportunity! 🧠
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={startNewQuestion}
                  className="h-12 px-8 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white"
                >
                  🎯 Next Question
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="h-12 px-6 text-lg font-bold border-2 border-gray-400 hover:bg-gray-100"
                >
                  🔄 New Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
