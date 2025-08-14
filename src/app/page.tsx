'use client'

import { useState, useEffect, useRef, JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Label } from './components/ui/label'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'

import { sdk } from '@farcaster/miniapp-sdk'

interface Horse {
  id: number
  name: string
  color: string
  secondaryColor: string
  answerChoice: string
  speed: number
  position: number
  emoji: string
}

interface Question {
  id: number
  category: string
  question: string
  answers: string[]
  correctAnswer: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  points: number
}

interface RaceResult {
  winner: Horse
  positions: Horse[]
}

interface GameState {
  selectedAnswer: number | null
  score: number
  totalQuestions: number
  correctAnswers: number
  currentQuestion: Question | null
  isRacing: boolean
  raceResult: RaceResult | null
  lastScore: number
  streak: number
}

const HORSES: Horse[] = [
  { id: 1, name: 'Option A', color: '#FF6B6B', secondaryColor: '#FF8E8E', answerChoice: 'A', speed: 0, position: 0, emoji: '🅰️' },
  { id: 2, name: 'Option B', color: '#4ECDC4', secondaryColor: '#6BCCC4', answerChoice: 'B', speed: 0, position: 0, emoji: '🅱️' },
  { id: 3, name: 'Option C', color: '#45B7D1', secondaryColor: '#67C5D1', answerChoice: 'C', speed: 0, position: 0, emoji: '🔵' },
  { id: 4, name: 'Option D', color: '#96CEB4', secondaryColor: '#AACEB4', answerChoice: 'D', speed: 0, position: 0, emoji: '🟢' }
]

const QUESTIONS: Question[] = [
  // Science Questions
  {
    id: 1,
    category: 'Science',
    question: 'Who is known as the father of physics?',
    answers: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'],
    correctAnswer: 1,
    difficulty: 'Medium',
    points: 20
  },
  {
    id: 2,
    category: 'Science',
    question: 'What is the chemical symbol for gold?',
    answers: ['Go', 'Au', 'Ag', 'Gd'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 3,
    category: 'Science',
    question: 'How many bones are there in an adult human body?',
    answers: ['196', '206', '216', '226'],
    correctAnswer: 1,
    difficulty: 'Hard',
    points: 30
  },
  {
    id: 4,
    category: 'Science',
    question: 'What planet is known as the Red Planet?',
    answers: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 5,
    category: 'Science',
    question: 'What is the speed of light in vacuum?',
    answers: ['300,000 km/s', '299,792,458 m/s', '186,000 mph', '150,000 km/s'],
    correctAnswer: 1,
    difficulty: 'Hard',
    points: 30
  },
  
  // History Questions
  {
    id: 6,
    category: 'History',
    question: 'In which year did World War II end?',
    answers: ['1944', '1945', '1946', '1947'],
    correctAnswer: 1,
    difficulty: 'Medium',
    points: 20
  },
  {
    id: 7,
    category: 'History',
    question: 'Who was the first President of the United States?',
    answers: ['George Washington', 'Thomas Jefferson', 'John Adams', 'Benjamin Franklin'],
    correctAnswer: 0,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 8,
    category: 'History',
    question: 'Which ancient wonder of the world was located in Alexandria?',
    answers: ['Hanging Gardens', 'Lighthouse of Alexandria', 'Colossus of Rhodes', 'Statue of Zeus'],
    correctAnswer: 1,
    difficulty: 'Hard',
    points: 30
  },
  
  // Geography Questions
  {
    id: 9,
    category: 'Geography',
    question: 'What is the capital of Australia?',
    answers: ['Sydney', 'Canberra', 'Melbourne', 'Brisbane'],
    correctAnswer: 1,
    difficulty: 'Medium',
    points: 20
  },
  {
    id: 10,
    category: 'Geography',
    question: 'Which is the longest river in the world?',
    answers: ['Amazon River', 'Nile River', 'Mississippi River', 'Yangtze River'],
    correctAnswer: 1,
    difficulty: 'Medium',
    points: 20
  },
  {
    id: 11,
    category: 'Geography',
    question: 'How many continents are there?',
    answers: ['5', '6', '7', '8'],
    correctAnswer: 2,
    difficulty: 'Easy',
    points: 15
  },
  
  // Sports Questions
  {
    id: 12,
    category: 'Sports',
    question: 'How many players are on a basketball team on the court at once?',
    answers: ['4', '5', '6', '7'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 13,
    category: 'Sports',
    question: 'In which sport would you perform a slam dunk?',
    answers: ['Volleyball', 'Basketball', 'Tennis', 'Football'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 14,
    category: 'Sports',
    question: 'Which country has won the most FIFA World Cups?',
    answers: ['Germany', 'Brazil', 'Argentina', 'Italy'],
    correctAnswer: 1,
    difficulty: 'Medium',
    points: 20
  },
  
  // Technology Questions
  {
    id: 15,
    category: 'Technology',
    question: 'What does "CPU" stand for?',
    answers: ['Computer Processing Unit', 'Central Processing Unit', 'Core Processing Unit', 'Central Program Unit'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 16,
    category: 'Technology',
    question: 'Who founded Microsoft?',
    answers: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Larry Page'],
    correctAnswer: 1,
    difficulty: 'Medium',
    points: 20
  },
  {
    id: 17,
    category: 'Technology',
    question: 'What does "AI" stand for in technology?',
    answers: ['Advanced Intelligence', 'Artificial Intelligence', 'Automated Intelligence', 'Applied Intelligence'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  
  // Mathematics Questions
  {
    id: 18,
    category: 'Mathematics',
    question: 'What is the value of π (pi) approximately?',
    answers: ['2.14', '3.14', '4.14', '5.14'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 19,
    category: 'Mathematics',
    question: 'What is 12 × 12?',
    answers: ['124', '144', '154', '164'],
    correctAnswer: 1,
    difficulty: 'Easy',
    points: 15
  },
  {
    id: 20,
    category: 'Mathematics',
    question: 'What is the square root of 64?',
    answers: ['6', '8', '10', '12'],
    correctAnswer: 1,
    difficulty: 'Medium',
    points: 20
  }
]

export default function QuizRacingGame(): JSX.Element {
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(void 0)
            } else {
              window.addEventListener('load', () => resolve(void 0), { once: true })
            }
          })
        }
        
        await sdk.actions.ready()
        console.log('Farcaster SDK initialized successfully - app fully loaded')
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error)
        setTimeout(async () => {
          try {
            await sdk.actions.ready()
            console.log('Farcaster SDK initialized on retry')
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError)
          }
        }, 1000)
      }
    }

    initializeFarcaster()
  }, [])

  const [gameState, setGameState] = useState<GameState>({
    selectedAnswer: null,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    currentQuestion: null,
    isRacing: false,
    raceResult: null,
    lastScore: 0,
    streak: 0
  })

  const [horses, setHorses] = useState<Horse[]>(HORSES.map(h => ({ ...h })))
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getRandomQuestion = (): Question => {
    return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  }

  const startNewQuestion = (): void => {
    const newQuestion = getRandomQuestion()
    setGameState(prev => ({
      ...prev,
      currentQuestion: newQuestion,
      selectedAnswer: null,
      raceResult: null,
      lastScore: 0
    }))
    
    // Reset horse positions
    setHorses(HORSES.map(h => ({ ...h, position: 0, speed: 0 })))
  }

  const handleAnswerSelect = (answerIndex: number): void => {
    if (gameState.isRacing) return
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }))
  }

  const startRace = (): void => {
    if (gameState.selectedAnswer === null || !gameState.currentQuestion || gameState.isRacing) {
      return
    }

    setGameState(prev => ({
      ...prev,
      isRacing: true,
      totalQuestions: prev.totalQuestions + 1
    }))

    // Determine if answer is correct
    const isCorrect = gameState.selectedAnswer === gameState.currentQuestion.correctAnswer

    // Set horse speeds - correct answer horse gets advantage
    const raceHorses = horses.map((horse, index) => {
      let speed
      if (index === gameState.currentQuestion!.correctAnswer) {
        // Correct answer horse - faster speed
        speed = isCorrect ? Math.random() * 0.8 + 1.8 : Math.random() * 0.6 + 1.4
      } else if (index === gameState.selectedAnswer) {
        // User's selected (wrong) answer - slower speed
        speed = Math.random() * 0.4 + 0.8
      } else {
        // Other horses - random speed
        speed = Math.random() * 0.8 + 1.0
      }
      
      return {
        ...horse,
        position: 0,
        speed
      }
    })
    
    setHorses(raceHorses)

    // Start race animation
    const raceInterval = setInterval(() => {
      setHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => ({
          ...horse,
          position: horse.position + horse.speed * (Math.random() * 0.4 + 0.8)
        }))

        // Check if any horse has finished
        const finishedHorses = updatedHorses.filter(horse => horse.position >= 100)
        
        if (finishedHorses.length > 0) {
          clearInterval(raceInterval)
          
          const sortedHorses = [...updatedHorses].sort((a, b) => b.position - a.position)
          const winner = sortedHorses[0]
          
          const raceResult: RaceResult = {
            winner,
            positions: sortedHorses
          }

          // Calculate score based on correctness
          let scoreGained = 0
          let newStreak = 0
          let correctAnswersCount = gameState.correctAnswers

          if (gameState.selectedAnswer === gameState.currentQuestion!.correctAnswer) {
            // Correct answer
            scoreGained = gameState.currentQuestion!.points
            newStreak = gameState.streak + 1
            correctAnswersCount = gameState.correctAnswers + 1
            
            // Bonus for streak
            if (newStreak >= 3) {
              scoreGained += Math.floor(newStreak / 3) * 10 // Bonus points for streak
            }
          } else {
            // Wrong answer - lose small amount but not below 0
            scoreGained = -5
            newStreak = 0
          }

          setGameState(prev => ({
            ...prev,
            isRacing: false,
            raceResult,
            score: Math.max(0, prev.score + scoreGained),
            lastScore: scoreGained,
            streak: newStreak,
            correctAnswers: correctAnswersCount
          }))

          return updatedHorses.map(horse => ({
            ...horse,
            position: Math.min(horse.position, 100)
          }))
        }

        return updatedHorses
      })
    }, 80)

    raceIntervalRef.current = raceInterval
  }

  const resetGame = (): void => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current)
    }
    
    setHorses(HORSES.map(h => ({ ...h, position: 0, speed: 0 })))
    setGameState({
      selectedAnswer: null,
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      currentQuestion: null,
      isRacing: false,
      raceResult: null,
      lastScore: 0,
      streak: 0
    })
  }

  useEffect(() => {
    // Load first question on mount
    if (!gameState.currentQuestion) {
      startNewQuestion()
    }
    
    return () => {
      if (raceIntervalRef.current) {
        clearInterval(raceIntervalRef.current)
      }
    }
  }, [gameState.currentQuestion])

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Science': return 'bg-blue-500'
      case 'History': return 'bg-purple-500'
      case 'Geography': return 'bg-green-500'
      case 'Sports': return 'bg-orange-500'
      case 'Technology': return 'bg-gray-500'
      case 'Mathematics': return 'bg-pink-500'
      default: return 'bg-indigo-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50 p-4">
      {/* Racing Styles */}
      <style jsx>{`
        @keyframes gallop {
          0%, 100% { transform: translateY(0px) scaleX(1); }
          25% { transform: translateY(-2px) scaleX(1.05); }
          50% { transform: translateY(0px) scaleX(1); }
          75% { transform: translateY(-1px) scaleX(0.95); }
        }
        
        @keyframes dust {
          0% { transform: translateX(0px) scale(0); opacity: 0.6; }
          50% { transform: translateX(-20px) scale(1); opacity: 0.3; }
          100% { transform: translateX(-40px) scale(1.5); opacity: 0; }
        }
        
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: rainbow 3s ease infinite;
        }
        
        .track-gradient {
          background: linear-gradient(to bottom, 
            #6366f1 0%, 
            #8b5cf6 20%, 
            #a855f7 40%, 
            #c084fc 60%, 
            #d8b4fe 80%, 
            #e9d5ff 100%
          );
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="rainbow-bg border-indigo-500 shadow-xl">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🧠 QUIZ RACING CHAMPIONSHIP 🏁
            </CardTitle>
            <div className="text-lg text-white mb-4 drop-shadow">
              Test Your Knowledge & Watch the Race!
            </div>
            <div className="flex justify-center items-center gap-6 text-xl flex-wrap">
              <Badge variant="secondary" className="text-xl px-6 py-3 bg-yellow-600 text-white shadow-lg">
                🏆 Score: {gameState.score}
              </Badge>
              <Badge variant="secondary" className="text-xl px-6 py-3 bg-green-600 text-white shadow-lg">
                ✅ Correct: {gameState.correctAnswers}/{gameState.totalQuestions}
              </Badge>
              {gameState.streak > 0 && (
                <Badge variant="default" className="text-xl px-6 py-3 bg-orange-600 text-white shadow-lg animate-pulse">
                  🔥 Streak: {gameState.streak}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Question Card */}
        {gameState.currentQuestion && (
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-300 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge className={`text-white px-4 py-2 ${getCategoryColor(gameState.currentQuestion.category)}`}>
                  📚 {gameState.currentQuestion.category}
                </Badge>
                <div className="flex gap-2">
                  <Badge className={`text-white px-4 py-2 ${getDifficultyColor(gameState.currentQuestion.difficulty)}`}>
                    ⭐ {gameState.currentQuestion.difficulty}
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 bg-purple-100 border-purple-300">
                    🎯 {gameState.currentQuestion.points} pts
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-800 leading-relaxed">
                {gameState.currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameState.currentQuestion.answers.map((answer, index) => {
                  const horse = horses[index]
                  const isSelected = gameState.selectedAnswer === index
                  const isCorrect = index === gameState.currentQuestion!.correctAnswer
                  const showResult = gameState.raceResult !== null
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={gameState.isRacing}
                      className={`
                        h-auto p-6 text-left justify-start relative overflow-hidden text-wrap
                        ${isSelected && !showResult ? 'ring-4 ring-blue-400 bg-blue-100 border-blue-400' : ''}
                        ${showResult && isCorrect ? 'bg-green-100 border-green-400 ring-4 ring-green-400' : ''}
                        ${showResult && !isCorrect && isSelected ? 'bg-red-100 border-red-400 ring-4 ring-red-400' : ''}
                        ${!isSelected && !showResult ? 'bg-white hover:bg-gray-50 border-gray-300' : ''}
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
                  )
                })}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={startRace}
                  disabled={gameState.isRacing || gameState.selectedAnswer === null}
                  className="h-14 px-8 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white"
                >
                  {gameState.isRacing ? (
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
        <Card className="bg-gradient-to-b from-purple-200 to-purple-300 border-purple-400 shadow-xl overflow-hidden">
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
                Crowd: {gameState.isRacing ? '🎉 GO! GO! GO!' : '🤔 Thinking...'}
              </div>
            </div>

            {/* Racing Track */}
            <div className="track-gradient p-6 relative">
              <div className="space-y-4">
                {horses.map((horse, index) => {
                  const isCorrectAnswer = gameState.currentQuestion && index === gameState.currentQuestion.correctAnswer
                  const isUserChoice = gameState.selectedAnswer === index
                  
                  return (
                    <div key={horse.id} className="relative">
                      {/* Lane Background */}
                      <div className={`h-16 border-2 rounded-lg relative overflow-hidden shadow-inner ${
                        isCorrectAnswer ? 'bg-gradient-to-r from-green-200 via-green-300 to-green-200 border-green-400' :
                        isUserChoice ? 'bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 border-blue-400' :
                        'bg-gradient-to-r from-white via-gray-100 to-white border-gray-300'
                      }`}>
                        
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
                              style={{ left: `${16 + (i * 10)}%` }}
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
                          className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-75 ${gameState.isRacing ? 'racing' : ''}`}
                          style={{ 
                            left: `${Math.max(8, Math.min(88, 8 + (horse.position * 0.8)))}%`,
                            zIndex: 10 - index
                          }}
                        >
                          {/* Dust Trail */}
                          {gameState.isRacing && horse.speed > 0 && (
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
                                <span className="text-2xl drop-shadow-lg">🐎</span>
                              </div>
                              
                              {/* Answer Choice Badge */}
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-gray-400 shadow-lg flex items-center justify-center">
                                <span className="text-lg font-bold">{horse.emoji}</span>
                              </div>
                              
                              {/* Choice Indicator */}
                              {isUserChoice && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold shadow">
                                    YOUR PICK
                                  </div>
                                </div>
                              )}
                              
                              {isCorrectAnswer && gameState.raceResult && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                  <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold shadow animate-pulse">
                                    CORRECT!
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Speed Indicator */}
                            {gameState.isRacing && horse.speed > 0 && (
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
                  )
                })}
              </div>
              
              {/* Race Status */}
              <div className="mt-6 text-center">
                {gameState.isRacing ? (
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
        {gameState.raceResult && (
          <Card className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 border-yellow-400 shadow-xl">
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
                    🎉 WINNER: Option {gameState.raceResult.winner.answerChoice} 🎉
                  </h3>
                  <div className="text-xl text-yellow-800">
                    {gameState.raceResult.winner.emoji} The Correct Answer! {gameState.raceResult.winner.emoji}
                  </div>
                </div>
                
                {/* Correct Answer Display */}
                {gameState.currentQuestion && (
                  <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-800 mb-2">
                        ✅ Correct Answer: {gameState.currentQuestion.answers[gameState.currentQuestion.correctAnswer]}
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Result */}
                <div className="text-center p-6 rounded-xl border-2 shadow-lg">
                  {gameState.lastScore > 0 ? (
                    <div className="bg-gradient-to-r from-green-200 to-emerald-200 border-green-500 rounded-xl p-4">
                      <p className="text-2xl font-bold text-green-800 mb-2">
                        🎊 CORRECT! WELL DONE! 🎊
                      </p>
                      <p className="text-xl text-green-700">
                        +{gameState.lastScore} points earned! 🌟
                      </p>
                      {gameState.streak > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          🔥 {gameState.streak} question streak! Keep it up!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-200 to-pink-200 border-red-500 rounded-xl p-4">
                      <p className="text-xl font-bold text-red-800 mb-2">
                        📚 Keep Learning!
                      </p>
                      <p className="text-lg text-red-700">
                        {gameState.lastScore < 0 ? `${gameState.lastScore} points` : 'No points this time'} 
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

        {/* Game Guide */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-800">🎯 How to Play Quiz Racing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-700 text-base">🧠 Racing Rules:</h4>
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-green-600">🟢</span>
                    <span>Read the question and pick your answer (A, B, C, or D)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-blue-600">🔵</span>
                    <span>Each horse represents a different answer choice</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-600">🔴</span>
                    <span>Watch the race - correct answers win more often!</span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-700 text-base">📊 Scoring System:</h4>
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
      </div>
    </div>
  )
}