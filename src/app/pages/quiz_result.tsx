// components/ResultsSummary.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
type GameState = "menu" | "quiz" | "category" | "results";
interface QuizState {
  selectedAnswer: number | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  isRacing: boolean;
  lastScore: number;
  streak: number;
}

type ResultsSummaryProps = {
   lastQuiz : QuizState;
    onExit: (state: GameState) => void; // ✅ parent callback

};

export default function ResultsSummary({
  lastQuiz,
  onExit
}: ResultsSummaryProps) {
  const accuracy =
    lastQuiz.totalQuestions > 0
      ? Math.round((lastQuiz.correctAnswers / lastQuiz.totalQuestions) * 100)
      : 0;
  const handleClick = (state : GameState) => {
    onExit(state)
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300">
      <Card className="bg-white border-yellow-400 shadow-xl max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-yellow-800">
            🏆 Results Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center text-lg text-gray-700">
          <p>
            🎯 Final Score: <span className="font-bold">{lastQuiz.score}</span>
          </p>
          <p>
            ✅ Correct Answers: {lastQuiz.correctAnswers}/{lastQuiz.totalQuestions}
          </p>
          <p>🔥 Longest Streak: {lastQuiz.streak}</p>
          <p>📊 Accuracy: {accuracy}%</p>

          <div className="flex gap-4 mt-6">
            <Button 
            onClick={()=> handleClick("category")}
            className="bg-green-600 text-white px-6 py-2">
              🔄 Play Again
            </Button>
            <Button
            onClick={()=> handleClick("menu")}
            variant="outline" className="px-6 py-2 border-gray-400">
              ⬅️ Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
