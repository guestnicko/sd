// Added guide component to be reused
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

// I DON'T KNOW NGANO ANG REDUNDANT KO ANI NA TYPE AND FUNCTION SA MAIN_MENU.TSX
type MainMenuProps = {
  onStart: (state: "menu" | "quiz" | "category") => void;
};
function Guide({ onStart }: MainMenuProps){
    const handleClick = () => {
        onStart("category");
    };
    return (
        <>
        {/* Game Guide */}
        <Card className="w-fit">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">
              How to Play Quiz Racing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-base">
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
                <h4 className="font-semibold text-gray-700 text-base">
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

            <div className="flex justify-center mt-10">
                <Button
                    onClick={handleClick}
                    className="cursor-pointer h-14 px-8 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white"
                >
                🚀 Start Game
                </Button>
            </div>

          </CardContent>
        </Card>
        </>
    )
}

export default Guide;