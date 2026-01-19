
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { QuizQuestion } from '../types';

const QuizGenerator: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const startQuiz = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    try {
      const q = await geminiService.generateQuiz(notes);
      setQuestions(q);
      setCurrentIdx(0);
      setScore(0);
      setShowResults(false);
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (e) {
      alert("Oops, I couldn't generate the quiz. Try pasting more notes!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === questions[currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-12 bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] glow-border shadow-2xl text-center glow-shadow animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <i className="fas fa-trophy"></i>
        </div>
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Quiz Done!</h2>
        <p className="text-slate-400 mb-10 font-medium">Sharp work on your study prep.</p>
        
        <div className="relative inline-block mb-10">
          <div className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            {Math.round((score / questions.length) * 100)}%
          </div>
          <div className="mt-4 text-blue-500 uppercase tracking-[0.2em] font-black text-sm">
            Knowledge Check
          </div>
        </div>

        <button 
          onClick={() => { setQuestions([]); setNotes(''); }}
          className="w-full bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold hover:bg-blue-500 transition-all glow-shadow shadow-blue-900/40 border border-blue-400/30 text-lg uppercase tracking-widest"
        >
          Study More Topics
        </button>
      </div>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentIdx];
    return (
      <div className="max-w-3xl mx-auto mt-16 p-10 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] glow-border shadow-2xl relative overflow-hidden glow-shadow">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700 ease-out"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center mb-10 mt-2">
           <span className="bg-white/5 border border-white/20 text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
             Item {currentIdx + 1} of {questions.length}
           </span>
        </div>

        <h3 className="text-2xl font-black text-white mb-10 leading-tight drop-shadow-sm">{q.question}</h3>

        <div className="space-y-4 mb-10">
          {q.options.map((option, idx) => {
            let style = "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300";
            let icon = null;

            if (isAnswered) {
              if (idx === q.correctAnswer) {
                style = "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                icon = <i className="fas fa-check-circle"></i>;
              } else if (idx === selectedOption) {
                style = "border-red-500/50 bg-red-500/15 text-red-400";
                icon = <i className="fas fa-circle-xmark"></i>;
              }
            } else if (selectedOption === idx) {
              style = "border-blue-500/60 bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center justify-between font-bold group ${style}`}
              >
                <span className="flex-1 mr-4">{option}</span>
                <span className="text-xl opacity-80">{icon}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="bg-blue-600/15 p-6 rounded-2xl mb-10 border border-blue-500/30 animate-in slide-in-from-top-4 duration-300">
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center">
              <i className="fas fa-lightbulb mr-2"></i> Quick Tip
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">{q.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!isAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all glow-border ${
                selectedOption === null 
                ? 'bg-white/5 text-slate-700 cursor-not-allowed grayscale'
                : 'bg-blue-600 text-white hover:bg-blue-500 glow-shadow shadow-blue-900/40 active:scale-95'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl active:scale-95 glow-shadow"
            >
              {currentIdx === questions.length - 1 ? 'Finish Prep' : 'Next Item'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-12 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] glow-border shadow-2xl glow-shadow">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl shadow-[0_0_40px_rgba(37,99,235,0.4)] border border-white/20 rotate-3 glow-shadow">
          <i className="fas fa-bolt-lightning"></i>
        </div>
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">FundaBuddy Quiz Prep</h2>
        <p className="text-slate-500 font-medium">Turn your notes into a quick knowledge check</p>
      </div>

      <div className="space-y-8">
        <div className="relative glow-border rounded-3xl group">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here to generate questions..."
            className="w-full h-72 p-8 rounded-3xl bg-[#020617] text-slate-200 placeholder-slate-700 outline-none resize-none transition-all shadow-inner border-none"
          />
        </div>
        
        <button
          onClick={startQuiz}
          disabled={isLoading || !notes.trim()}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-3 uppercase tracking-widest glow-border ${
            isLoading || !notes.trim()
            ? 'bg-white/5 text-slate-700 cursor-not-allowed grayscale'
            : 'bg-blue-600 text-white hover:bg-blue-500 glow-shadow shadow-blue-900/50'
          }`}
        >
          {isLoading ? (
            <>
              <i className="fas fa-sync-alt fa-spin mr-2"></i>
              <span>Building Quiz...</span>
            </>
          ) : (
            <>
              <i className="fas fa-brain mr-2"></i>
              <span>Start Prep</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizGenerator;
