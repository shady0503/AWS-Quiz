import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Home } from "lucide-react";

const App = () => {
  const [stage, setStage] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [reviewingQuestion, setReviewingQuestion] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/data/practice_exams_questions_answers_treated.json');
      const data = await response.json();
      console.log(data);
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const pickedQuestions = shuffled.slice(0, 65);
      setQuestions(pickedQuestions);
    }
    fetchData();
  }
  ,[])

  const startQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setStage("quiz");
  };

  const handleAnswerSelect = (optionLetter) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isMultiple = currentQuestion.correct_answers.length > 1;

    setUserAnswers((prev) => {
      const prevAnswers = prev[currentQuestionIndex] || [];
      let updatedAnswers;

      if (isMultiple) {
        updatedAnswers = prevAnswers.includes(optionLetter)
          ? prevAnswers.filter((ans) => ans !== optionLetter)
          : [...prevAnswers, optionLetter];
      } else {
        updatedAnswers = [optionLetter];
      }

      return {
        ...prev,
        [currentQuestionIndex]: updatedAnswers,
      };
    });
  };

  const isAnswerCorrect = (questionIndex) => {
    const question = questions[questionIndex];
    const userAnswer = userAnswers[questionIndex] || [];
    return (
      userAnswer.length === question.correct_answers.length &&
      userAnswer.every((ans) => question.correct_answers.includes(ans))
    );
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((_, idx) => {
      if (isAnswerCorrect(idx)) correct++;
    });
    return ((correct / questions.length) * 100).toFixed(1);
  };

  const getOptionLetter = (option) => {
    return option.split(".")[0];
  };

  const QuestionDisplay = ({ questionIndex, showAnswer = false }) => {
    const question = questions[questionIndex];
    const selectedAnswers = userAnswers[questionIndex] || [];
    const isMultiple = question.correct_answers.length > 1;

    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <p className="text-md font-medium text-gray-100 mb-4">
          {question.question}
          {isMultiple && (
            <span className="text-xs text-gray-400 ml-2 font-normal">
              (Select all that apply)
            </span>
          )}
        </p>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {question.options.map((option) => {
            const optionLetter = getOptionLetter(option);
            const isSelected = selectedAnswers.includes(optionLetter);
            const isCorrect = question.correct_answers.includes(optionLetter);
            let optionClassName = "flex items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 select-none ";

            if (showAnswer) {
              if (isCorrect) {
                optionClassName += "bg-green-900/30 border-2 border-green-500";
              } else if (isSelected && !isCorrect) {
                optionClassName += "bg-red-900/30 border-2 border-red-500";
              } else {
                optionClassName += "border border-gray-600 hover:border-gray-500";
              }
            } else {
              optionClassName += isSelected
                ? "bg-blue-900/30 border-2 border-blue-500"
                : "border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50";
            }

            return (
              <label key={optionLetter} className={optionClassName}>
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  name={`question-${questionIndex}`}
                  checked={isSelected}
                  onChange={() => !showAnswer && handleAnswerSelect(optionLetter)}
                  disabled={showAnswer}
                  className="mr-3 text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                />
                <span className="text-gray-200">{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  if (stage === "home") {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 flex justify-center items-center">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center border border-gray-700">
        <h1 className="text-4xl font-bold mb-4 text-gray-100">
          AWS Certification Quiz
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          I made this exam to practice. Feel free to join! If you see any wrong questions, please report them to me. Good luck!
        </p>
        <button
          onClick={startQuiz}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium 
               hover:bg-blue-700 transition-colors duration-200 shadow-lg"
        >
          Start Quiz
        </button>
        </div>
      </div>
      </div>
    );
  }

  if (stage === "quiz") {
    return (
      <div className="min-h-screen  bg-gray-900 py-6 px-4">
        <div className="max-w-3xl mx-auto ">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 h-full">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-100">Question {currentQuestionIndex + 1} of {questions.length}</h1>
                <span className="text-gray-300 text-lg">
                  {((currentQuestionIndex + 1) / questions.length * 100).toFixed(0)}% Complete
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <QuestionDisplay questionIndex={currentQuestionIndex} />

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 rounded-lg text-gray-300
                         disabled:text-gray-600 disabled:cursor-not-allowed
                         hover:bg-gray-700/50 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => setStage("summary")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg
                           hover:bg-blue-700 transition-colors duration-200"
                >
                  Finish Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="flex items-center px-4 py-2 rounded-lg text-gray-300
                           hover:bg-gray-700/50 transition-colors duration-200"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "summary" || stage === "reviewing") {
    const score = calculateScore();

    if (stage === "reviewing" && reviewingQuestion !== null) {
      return (
        <div className="min-h-screen bg-gray-900 py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setStage("summary")}
                  className="flex items-center text-gray-300 hover:text-gray-100"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Summary
                </button>
                <span className="text-gray-300">
                  Question {reviewingQuestion + 1} of {questions.length}
                </span>
              </div>

              <QuestionDisplay questionIndex={reviewingQuestion} showAnswer={true} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-100">Quiz Summary</h1>
              <button
                onClick={() => setStage("home")}
                className="flex items-center text-gray-300 hover:text-gray-100"
              >
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </button>
            </div>

            <p className="text-xl text-gray-300 mb-6">
              Your Score: {score}% ({Math.round((parseFloat(score) / 100) * questions.length)} correct
              out of {questions.length}), you need 70% to pass.
            </p>

            <div className="space-y-2">
              {questions.map((question, index) => {
                const isCorrect = isAnswerCorrect(index);
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setReviewingQuestion(index);
                      setStage("reviewing");
                    }}
                    className="w-full text-left p-4 rounded-lg border border-gray-700 
                             flex items-center gap-3 hover:bg-gray-700/50 
                             transition-colors duration-200"
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className="text-gray-200">
                      Question {index + 1}: {question.question.slice(0, 100)}...
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;