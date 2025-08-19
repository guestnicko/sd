import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

type MainMenuProps = {
  onStart: (state: "menu" | "quiz" | "category") => void;
};
type CategoryMenuProps = {
  onSelect: (category: "Science" | "Math" | "History" | "exit") => void;
};

export default function CategoryMenu({ onSelect }: CategoryMenuProps) {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-purple-300">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-300 shadow-xl max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-gray-800">
              📚 Select a Category
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button
              onClick={() => onSelect("Science")}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white"
            >
              🔬 Science
            </Button>
            <Button
              onClick={() => onSelect("Math")}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white"
            >
              ➕ Math
            </Button>
            <Button
              onClick={() => onSelect("History")}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg text-white"
            >
              📜 History
            </Button>
            <Button
              onClick={() => onSelect("exit")}
              variant="outline"
              className="w-full h-12 text-lg font-bold border-2 border-gray-400 hover:bg-gray-100"
            >
              ⬅️ Exit to Main Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
