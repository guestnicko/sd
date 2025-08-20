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
export default function MainMenu({ onStart }: MainMenuProps) {
  const handleClick = () => {
    onStart("category");
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-purple-300">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-300 shadow-xl max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-gray-800">
              🏁 Quiz Racing Game 🏁
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <Button
              onClick={handleClick}
              className="h-14 px-8 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white"
            >
              🚀 Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
