import React from "react";
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
import { Modal, Box } from "@mui/material";

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
    emoji: "A",
  },
  {
    id: 2,
    name: "Option B",
    color: "#4ECDC4",
    secondaryColor: "#6BCCC4",
    answerChoice: "B",
    speed: 0,
    position: 0,
    emoji: "B",
  },
  {
    id: 3,
    name: "Option C",
    color: "#45B7D1",
    secondaryColor: "#67C5D1",
    answerChoice: "C",
    speed: 0,
    position: 0,
    emoji: "C",
  },
  {
    id: 4,
    name: "Option D",
    color: "#96CEB4",
    secondaryColor: "#AACEB4",
    answerChoice: "D",
    speed: 0,
    position: 0,
    emoji: "D",
  },
];

type GameState = "menu" | "quiz" | "category" | "results";

type QuizProps = {
  questions: Question[]; // ✅ now correctly typed
  onExit: (state: "menu" | "quiz" | "category") => void;
  onFinish: (quizState: QuizState) => void; // ✅ parent callback
};
export default function QuizGame({ onFinish, questions, onExit }: QuizProps) {
  const handleClick = () => {
    onExit("menu");
  };
  const QUESTIONS = questions;

  useEffect(() => {
    console.log("Received questions in QuizGame:", questions);
  }, [questions]);

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
    totalQuestions: questions.length,
    correctAnswers: 0,
    currentQuestion: null,
    isRacing: false,
    raceResult: null,
    lastScore: 0,
    streak: 0,
  });

  const [horses, setHorses] = useState<Horse[]>(HORSES.map((h) => ({ ...h })));
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [mistakes, setMistake] = useState<number[]>([]);

  const getRandomQuestion = (): Question | null => {
    // Filter only unanswered question indices
    const available = QUESTIONS.filter(
      (q) => !answeredQuestions.includes(q.id)
    );

    if (available.length === 0) {
      return null; // no more questions left
    }

    const index = Math.floor(Math.random() * available.length);
    return available[index];
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
    document
      .getElementById("question-section")
      ?.scrollIntoView({ behavior: "smooth" });
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
    }));
    const question = QuizState.currentQuestion;
    let gained = question.points;
    // Determine if answer is correct
    const isCorrect = QuizState.selectedAnswer === question.correctAnswer;

    if (isCorrect && question) {
      setAnsweredQuestions((prev) => [...prev, question.id]);
      console.log("the answer is correct");
      console.log(QuizState.totalQuestions);
      console.log(answeredQuestions);

      if (QuizState.totalQuestions == answeredQuestions.length + 1) {
        setIsFinished(true);
      }
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 3) {
        const bonus = Math.floor(newStreak / 3) * 10; // +10 for every 3 in a row
        gained += bonus;
      }
    } else {
      // Wrong answer
      if (!mistakes.includes(question.id)) {
        setMistake((prev) => [...prev, question.id]);
      }
      gained = -5;
      setStreak(0);
    }
    setScore((prev) => Math.max(0, prev + gained));
    if (highestStreak < streak) {
      setHighestStreak(streak);
    }
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

  const checkResult = (): void => {
    console.log(QuizState);
    onFinish({
      selectedAnswer: null,
      score: score,
      totalQuestions: QuizState.totalQuestions,
      correctAnswers: QuizState.totalQuestions - mistakes.length,
      currentQuestion: null,
      isRacing: false,
      raceResult: null,
      lastScore: QuizState.score,
      streak: Math.max(highestStreak, streak),
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
      {/* Exit to Main Menu */}
      <div className="flex justify-center items-center mb-8 mt-2">
        <Button
          onClick={handleClick}
          variant="outline"
          className="w-100 mx-auto h-12 text-lg font-bold border-2 border-gray-400 bg-red-500 hover:bg-red-600"
        >
          ⬅️ Main Menu
        </Button>
      </div>
      {!QUESTIONS ||
        (QUESTIONS.length === 0 && (
          <div className="text-center text-red-500 font-bold mt-8">
            ⚠️ No questions loaded. Please go back and select a valid category &
            difficulty.
          </div>
        ))}
      {/* Question Card */}
      {QUESTIONS.length > 0 && QuizState && (
        <div className="flex items-center justify-between mb-4 my-3">
          <Badge className={` px-4 py-2 `}>
            Questions Answered:{" "}
            {answeredQuestions.length + "/" + questions.length}
          </Badge>
          <div className="flex gap-3">
            <Badge className={` px-4 py-2 `}> Highest Streak: {streak}</Badge>

            <Badge className={` px-4 py-2 `}>Current Streak: {streak}</Badge>
            <Badge className={` px-4 py-2 `}>
              Total Points Scored: {score}
            </Badge>
          </div>
        </div>
      )}
      {QuizState.currentQuestion && (
        <div className="flex flex-col lg:flex-row justify-between">
          {/* Question Section */}
          <Card id="question-section" className="shadow-xl my-3 w-full md:w-1/">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge
                    className={`text-white px-4 py-2 ${getCategoryColor(
                      QuizState.currentQuestion.category
                    )}`}
                  >
                    📚 {QuizState.currentQuestion.category}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Badge
                    className={`text-white text-lg px-4 py-2 ${getDifficultyColor(
                      QuizState.currentQuestion.difficulty
                    )}`}
                  >
                    ⭐ {QuizState.currentQuestion.difficulty}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-lg bg-gray-100 text-gray-950 border-2 border-gray-400"
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

          {/* Race Track Section */}
          <Card className="shadow-xl overflow-hidden my-3 w-full bg-gray-50 rounded-xl">
            <CardHeader className="bg-green-700">
              <CardTitle className="text-2xl text-gray-200 flex justify-center items-center gap-2">
                🏁 Knowledge Racing Track 🏁
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Grandstand Background */}
              <div
                className="h-15 relative overflow-hidden"
                style={{
                  backgroundColor: "#8f8f8f",
                  backgroundImage: `
                            linear-gradient(45deg, #000 25%, transparent 25%),
                            linear-gradient(-45deg, #000 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #000 75%),
                            linear-gradient(-45deg, transparent 75%, #000 75%)
                          `,
                  backgroundSize: "40px 40px",
                  backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
                }}
              >
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                  {QuizState.isRacing && (
                    <div className="flex gap-2 font-bold text-2xl text-yellow-300">
                      <span className="animate-bounce">🎉</span>
                      <span className="animate-bounce delay-150">GO!</span>
                      <span className="animate-bounce delay-300">GO!</span>
                      <span className="animate-bounce delay-500">GO!</span>
                      <span className="animate-bounce delay-700">🎉</span>
                    </div>
                  )}
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
                        {/* Lane Background 
                          -- put isUserChoice instead of isCorrectAnswer para dli ma reveal ang answer
                        */}
                        <div
                          className={`h-16 border-2 rounded-lg relative overflow-hidden shadow-inner ${
                            isUserChoice
                              ? "bg-gradient-to-r from-green-200 via-green-300 to-green-200 border-green-400"
                              : isUserChoice
                              ? "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 border-blue-400"
                              : "bg-gradient-to-r from-white via-gray-100 to-white border-gray-300"
                          }`}
                        >
                          {/* Lane Identifier */}
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg border-2 border-gray-400 shadow">
                            {/* {horse.answerChoice} */}
                            {/* Choice Indicator */}
                            {isUserChoice && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <div className="text-4xl px-2 py-1 rounded font-bold shadow">
                                  💰
                                </div>
                              </div>
                            )}
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
                            className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-75 mx-4 sm:mx-2 lg:mx-4 ${
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
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full border-2 border-gray-400 shadow-lg flex items-center justify-center">
                                  <span className="text-lg font-bold">
                                    {horse.emoji}
                                  </span>
                                </div>

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
        </div>
      )}
      {/* Race Results */}
      <div>
        <Modal
          open={!!QuizState.raceResult}
          onClose={resetGame}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute" as "Absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: 800, // increased from 600 → 800
              bgcolor: "background.paper",
              border: "3px solid #2eb053",
              borderRadius: "16px",
              boxShadow: 24,
              p: 4,
              maxHeight: "95vh", // slightly taller
              overflowY: "auto",
            }}
          >
            {/* Show the Result via Modal */}
            {QuizState.raceResult && (
              <Card className="border-green-400 shadow-xl my-3 rounded-2xl bg-green-400">
                <CardHeader>
                  <CardTitle className="text-2xl text-yellow-800 text-center">
                    🏆 RACE RESULTS & SCORE UPDATE 🏆
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Score Result */}
                    <div className="text-center p-6 rounded-xl">
                      {QuizState.lastScore > 0 ? (
                        <div className="bg-gradient-to-r from-green-200 to-emerald-200 border-green-500 rounded-xl p-4">
                          <p className="text-3xl font-bold text-green-800 mb-2">
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

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                      {!isFinished && (
                        <>
                          <Button
                            onClick={startNewQuestion}
                            className="h-12 px-8 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white"
                          >
                            🎯 Next Question
                          </Button>
                          <Button
                            onClick={resetGame}
                            variant="outline"
                            className="h-12 px-6 text-lg font-bold  bg-black border-gray-400 hover:bg-gray-900"
                          >
                            🔄 New Game
                          </Button>
                        </>
                      )}
                      {isFinished && (
                        <>
                          <Button
                            onClick={checkResult}
                            variant="outline"
                            className="h-12 px-6 text-lg font-bold  bg-black border-gray-400 hover:bg-gray-900"
                          >
                            Check Result
                          </Button>{" "}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </Box>
        </Modal>
      </div>
    </>
  );
}
