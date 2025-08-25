import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface CategoryMenuProps {
  onSelect: (category: string, difficulty: string) => void;
}

export default function CategoryMenu({ onSelect }: CategoryMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (category: string) => {
    if (category === "exit") {
      onSelect("exit", ""); // or you can handle 'exit' differently
    } else {
      setSelectedCategory(category);
    }
  };

  const handleDifficultySelect = (difficulty: string) => {
    if (selectedCategory) {
      onSelect(selectedCategory, difficulty);
      setSelectedCategory(null); // Reset for next selection
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="shadow-xl max-w-md w-full my-8 border-2 border-teal-700 rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-gray-800">
            {selectedCategory ? `🎯 Choose Difficulty for ${selectedCategory}` : "📚 Select a Category"}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {!selectedCategory ? (
            <>
              <Button
                onClick={() => handleCategorySelect("Science")}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white"
              >
                🔬 Science
              </Button>
              <Button
                onClick={() => handleCategorySelect("Math")}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white"
              >
                ➕ Math
              </Button>
              <Button
                onClick={() => handleCategorySelect("History")}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg text-white"
              >
                📜 History
              </Button>
              <Button
                onClick={() => handleCategorySelect("exit")}
                variant="outline"
                className="w-full h-12 text-lg font-bold border-2 bg-black border-gray-400 hover:bg-gray-900"
              >
                ⬅️ Exit to Main Menu
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => handleDifficultySelect("Easy")}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 shadow-lg text-white"
              >
                🟢 Easy
              </Button>
              <Button
                onClick={() => handleDifficultySelect("Medium")}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg text-white"
              >
                🟠 Medium
              </Button>
              <Button
                onClick={() => handleDifficultySelect("Hard")}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg text-white"
              >
                🔴 Hard
              </Button>
              <Button
                onClick={() => setSelectedCategory(null)}
                variant="outline"
                className="w-full h-12 text-lg font-bold border-2 bg-black border-gray-400 hover:bg-gray-900"
              >
                ⬅️ Back to Categories
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}