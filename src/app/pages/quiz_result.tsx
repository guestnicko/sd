// components/ResultsSummary.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

type ResultsSummaryProps = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
};

export default function ResultsSummary({
  score,
  correctAnswers,
  totalQuestions,
  streak,
}: ResultsSummaryProps) {
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

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
            🎯 Final Score: <span className="font-bold">{score}</span>
          </p>
          <p>
            ✅ Correct Answers: {correctAnswers}/{totalQuestions}
          </p>
          <p>🔥 Longest Streak: {streak}</p>
          <p>📊 Accuracy: {accuracy}%</p>

          <div className="flex gap-4 mt-6">
            <Button className="bg-green-600 text-white px-6 py-2">
              🔄 Play Again
            </Button>
            <Button variant="outline" className="px-6 py-2 border-gray-400">
              ⬅️ Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
