import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft, Target, TrendingUp } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { text: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: 'What is your investment horizon?',
    options: [
      { text: 'Less than 1 year', score: 1 },
      { text: '1-3 years', score: 2 },
      { text: '3-5 years', score: 3 },
      { text: '5-10 years', score: 4 },
      { text: 'More than 10 years', score: 5 },
    ],
  },
  {
    id: 2,
    question: 'How would you describe your investment knowledge?',
    options: [
      { text: 'Beginner - Just starting out', score: 1 },
      { text: 'Basic - Know the fundamentals', score: 2 },
      { text: 'Intermediate - Regular investor', score: 3 },
      { text: 'Advanced - Experienced investor', score: 4 },
      { text: 'Expert - Professional level', score: 5 },
    ],
  },
  {
    id: 3,
    question: 'If your investment drops 20% in value, you would:',
    options: [
      { text: 'Sell immediately to prevent further loss', score: 1 },
      { text: 'Sell some and keep the rest', score: 2 },
      { text: 'Hold and wait for recovery', score: 3 },
      { text: 'Hold and consider buying more', score: 4 },
      { text: 'Buy more to average down', score: 5 },
    ],
  },
  {
    id: 4,
    question: 'What percentage of your income can you invest monthly?',
    options: [
      { text: 'Less than 10%', score: 1 },
      { text: '10-20%', score: 2 },
      { text: '20-30%', score: 3 },
      { text: '30-40%', score: 4 },
      { text: 'More than 40%', score: 5 },
    ],
  },
  {
    id: 5,
    question: 'What is your primary investment goal?',
    options: [
      { text: 'Preserve capital - Safety first', score: 1 },
      { text: 'Generate steady income', score: 2 },
      { text: 'Balanced growth and income', score: 3 },
      { text: 'Long-term capital appreciation', score: 4 },
      { text: 'Aggressive growth - Maximum returns', score: 5 },
    ],
  },
];

interface RiskProfile {
  type: 'Conservative' | 'Moderate' | 'Balanced' | 'Growth' | 'Aggressive';
  description: string;
  recommendedBaskets: string[];
  allocationAdvice: {
    equity: number;
    debt: number;
    hybrid: number;
  };
}

const getRiskProfile = (score: number): RiskProfile => {
  if (score <= 8) {
    return {
      type: 'Conservative',
      description: 'You prefer low-risk investments with stable returns. Capital preservation is your priority.',
      recommendedBaskets: ['Conservative Premium', 'Balanced Premium', 'Conservative Balanced Basket'],
      allocationAdvice: { equity: 20, debt: 60, hybrid: 20 },
    };
  } else if (score <= 12) {
    return {
      type: 'Moderate',
      description: 'You seek a balance between safety and growth with moderate risk tolerance.',
      recommendedBaskets: ['Balanced Premium', 'BALANCED Premium', "Doctor's Premium"],
      allocationAdvice: { equity: 40, debt: 40, hybrid: 20 },
    };
  } else if (score <= 16) {
    return {
      type: 'Balanced',
      description: 'You are comfortable with market fluctuations for potentially higher returns.',
      recommendedBaskets: ['Every Common India Basket', 'The Great India Basket', 'Premium Aggressive'],
      allocationAdvice: { equity: 60, debt: 20, hybrid: 20 },
    };
  } else if (score <= 20) {
    return {
      type: 'Growth',
      description: 'You prioritize growth and can handle significant market volatility.',
      recommendedBaskets: ['Premium Aggressive', 'The Great India Basket', 'Every Common India Basket'],
      allocationAdvice: { equity: 80, debt: 10, hybrid: 10 },
    };
  } else {
    return {
      type: 'Aggressive',
      description: 'You are an experienced investor seeking maximum returns with high risk tolerance.',
      recommendedBaskets: ['Premium Aggressive', 'Every Common India Basket', 'The Great India Basket'],
      allocationAdvice: { equity: 90, debt: 5, hybrid: 5 },
    };
  }
};

const RiskProfileQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const totalScore = answers.reduce((sum, score) => sum + score, 0);
  const riskProfile = getRiskProfile(totalScore);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {!showResults ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Risk Profile Assessment</h1>
                    <p className="text-gray-600">Find baskets that match your investment style</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:text-primary-dark hover:bg-primary/5 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.score)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-purple-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="text-sm text-gray-500">
                {currentQuestion + 1} / {questions.length}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Risk Profile</h1>
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xl font-bold">
                {riskProfile.type}
              </div>
            </div>

            {/* Profile Description */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-lg text-gray-700 text-center">{riskProfile.description}</p>
            </div>

            {/* Asset Allocation */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Asset Allocation</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{riskProfile.allocationAdvice.equity}%</div>
                  <div className="text-sm text-gray-600 mt-1">Equity</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{riskProfile.allocationAdvice.debt}%</div>
                  <div className="text-sm text-gray-600 mt-1">Debt</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{riskProfile.allocationAdvice.hybrid}%</div>
                  <div className="text-sm text-gray-600 mt-1">Hybrid</div>
                </div>
              </div>
            </div>

            {/* Recommended Baskets */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Baskets for You</h2>
              <div className="space-y-3">
                {riskProfile.recommendedBaskets.map((basket, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{basket}</span>
                    </div>
                    <Link
                      to={`/explore-baskets`}
                      className="text-primary hover:text-primary-dark font-medium text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={resetQuiz}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Retake Quiz
              </button>
              <Link
                to="/explore-baskets"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark"
              >
                Explore Baskets
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskProfileQuizPage;
