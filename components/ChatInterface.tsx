
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { StudyEntry, SA_LANGUAGES } from '../types';

interface ChatInterfaceProps {
  onActivity: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onActivity }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [translatedResponse, setTranslatedResponse] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('English');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setExtractedText(ev.target?.result as string || '');
          setFilePreview(null);
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleAskAI = async (mode: 'text' | 'visual' = 'text') => {
    if (!question.trim()) return;
    setIsLoading(true);
    setResponse(null);
    setTranslatedResponse(null);
    setGeneratedImg(null);

    try {
      let base64Image = '';
      if (file && file.type.startsWith('image/')) {
        base64Image = filePreview?.split(',')[1] || '';
      }

      const aiAnswer = await geminiService.askQuestion(question, extractedText, base64Image);
      const topic = await geminiService.classifyTopic(question);
      setResponse(aiAnswer);

      let visualUrl = null;
      if (mode === 'visual') {
        setIsMediaLoading(true);
        visualUrl = await geminiService.generateEducationalImage(question);
        setGeneratedImg(visualUrl);
        setIsMediaLoading(false);
      }

      const newEntry: StudyEntry = {
        id: Date.now().toString(),
        question,
        answer: aiAnswer,
        topic,
        timestamp: Date.now(),
        notesUsed: file?.name,
        hasImage: !!base64Image,
        generatedImageUrl: visualUrl || undefined
      };

      dbService.addEntry(newEntry);
      dbService.updateProgress(topic);
      onActivity();
      setQuestion('');
    } catch (error) {
      setResponse("Eish, FundaBuddy ran into a small problem. Let's try again, sharp?");
    } finally {
      setIsLoading(false);
      setIsMediaLoading(false);
    }
  };

  const handleTranslate = async (lang: string) => {
    if (!response || lang === 'English') {
      setTranslatedResponse(null);
      setTargetLang('English');
      return;
    }
    setIsMediaLoading(true);
    try {
      const translation = await geminiService.translateContent(response, lang);
      setTranslatedResponse(translation);
      setTargetLang(lang);
    } finally {
      setIsMediaLoading(false);
    }
  };

  const playTTS = async () => {
    const textToRead = translatedResponse || response;
    if (!textToRead) return;
    setIsMediaLoading(true);
    try {
      const base64Audio = await geminiService.generateSpeech(textToRead);
      if (base64Audio) {
        const audioData = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) uint8Array[i] = audioData.charCodeAt(i);
        
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const int16 = new Int16Array(uint8Array.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
        
        const buffer = ctx.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } finally {
      setIsMediaLoading(false);
    }
  };

  const downloadOutput = () => {
    const content = `FUNDABUDDY STUDY NOTES\nLanguage: ${targetLang}\nTopic: ${question}\n\nAnswer:\n${translatedResponse || response}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fundabuddy_notes_${Date.now()}.txt`;
    a.click();
  };

  const downloadImage = () => {
    if (!generatedImg) return;
    const a = document.createElement('a');
    a.href = generatedImg;
    a.download = `fundabuddy_diagram_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col h-full bg-slate-950/20 backdrop-blur-md">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center">
            <i className="fas fa-robot text-blue-500 mr-2"></i>
            FundaBuddy AI
          </h2>
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">High School Study Assistant</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="flex flex-col">
             <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1 ml-1">Home Language</label>
             <select 
              value={targetLang}
              onChange={(e) => handleTranslate(e.target.value)}
              className="bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-blue-400 outline-none hover:bg-slate-800 transition-colors cursor-pointer"
             >
              {SA_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
             </select>
           </div>
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 mt-4 rounded-xl bg-blue-600/10 glow-border text-blue-200 hover:bg-blue-600/20 transition-all active:scale-95 flex items-center space-x-2 shadow-inner"
            title="Upload Study Material (PDF, Images, TXT)"
           >
            <i className="fas fa-file-arrow-up"></i>
            <span className="text-[10px] font-black uppercase tracking-wider">{file ? 'Swop' : 'Notes'}</span>
          </button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.txt"/>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
        {file && (
          <div className="bg-blue-600/10 glow-border rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3 text-blue-300">
              <i className={`fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file-pdf'} text-xl`}></i>
              <div>
                <span className="text-xs font-black uppercase tracking-widest block truncate max-w-[200px]">{file.name}</span>
                <span className="text-[10px] opacity-60">Ready to assist your learning</span>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="text-blue-400 hover:text-red-400 transition-colors">
              <i className="fas fa-times-circle text-lg"></i>
            </button>
          </div>
        )}

        {response ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-start">
              <div className="bg-slate-900/80 glow-border text-slate-200 rounded-[2.5rem] rounded-tl-none px-8 py-8 w-full shadow-2xl backdrop-blur-md glow-shadow">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                  <div className="flex space-x-3">
                    <button 
                      onClick={playTTS} 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all glow-border shadow-lg ${isMediaLoading ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:scale-105 active:scale-95'}`}
                      title="Play Encouraging AI Voice"
                      disabled={isMediaLoading}
                    >
                      <i className={`fas ${isMediaLoading ? 'fa-circle-notch fa-spin' : 'fa-volume-high'} text-lg`}></i>
                    </button>
                    <button 
                      onClick={downloadOutput} 
                      className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all border border-white/20 shadow-lg hover:scale-105 active:scale-95"
                      title="Download Study Notes"
                    >
                      <i className="fas fa-file-arrow-down text-lg"></i>
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-600 glow-shadow text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {targetLang}
                    </span>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-slate-300 text-base font-medium selection:bg-blue-500/30">
                  {translatedResponse || response}
                </div>

                {isMediaLoading && !generatedImg && (
                   <div className="mt-8 p-12 bg-white/5 rounded-3xl glow-border border-dashed flex flex-col items-center justify-center space-y-4 animate-pulse">
                      <i className="fas fa-wand-magic-sparkles text-blue-400 text-3xl animate-spin"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Generating Study Illustration...</p>
                   </div>
                )}

                {generatedImg && (
                  <div className="mt-8 group relative rounded-[2rem] glow-border overflow-hidden shadow-2xl bg-black/40">
                    <img src={generatedImg} alt="Study Diagram" className="w-full h-auto animate-in fade-in zoom-in-95 duration-1000" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white shadow-sm">Educational Visual Aid</span>
                       <button 
                        onClick={downloadImage}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                       >
                         <i className="fas fa-download mr-2"></i> Save Image
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-8 opacity-90">
            <div className="relative">
              <div className="w-28 h-28 bg-blue-600/5 glow-border rounded-full flex items-center justify-center shadow-inner relative overflow-hidden glow-shadow">
                <i className="fas fa-book-sparkles text-blue-400 text-5xl"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#020617] animate-pulse shadow-[0_0_10px_#10b981]"></div>
            </div>
            <div className="text-center max-w-sm">
              <p className="text-2xl font-black text-white tracking-tight">Sharp, FundaBuddy here!</p>
              <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed px-4">
                Grades 8–12 study support. Upload notes or ask questions in any of our 11 SA languages.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
               <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-2 hover:bg-white/10 transition-colors">
                 <i className="fas fa-image text-blue-400 text-sm"></i>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Text-to-Image</span>
               </div>
               <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-2 hover:bg-white/10 transition-colors">
                 <i className="fas fa-ear-listen text-emerald-400 text-sm"></i>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Voice Summary</span>
               </div>
               <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-2 hover:bg-white/10 transition-colors">
                 <i className="fas fa-language text-purple-400 text-sm"></i>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Multilingual</span>
               </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/60 glow-border rounded-[2rem] rounded-tl-none px-10 py-6 flex items-center space-x-6 shadow-xl backdrop-blur-xl glow-shadow">
               <div className="flex space-x-2.5">
                 <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-bounce"></div>
                 <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">FundaBuddy is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-white/10 bg-slate-950/40">
        <div className="relative flex items-end space-x-4">
          <div className="flex-1 relative group">
            <div className="glow-border rounded-2xl p-[1px] group-focus-within:glow-shadow transition-all">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What are we studying today?"
                className="w-full rounded-2xl bg-[#020617] border-none px-6 py-5 text-white placeholder-slate-600 outline-none resize-none min-h-[64px] max-h-[160px] transition-all text-lg shadow-inner"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI('text');
                  }
                }}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleAskAI('visual')}
              disabled={isLoading || !question.trim()}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all glow-border ${
                isLoading || !question.trim() 
                ? 'bg-white/5 text-slate-700 cursor-not-allowed grayscale' 
                : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_25px_rgba(8,145,178,0.4)] hover:scale-105 active:scale-95'
              }`}
              title="Generate Text-to-Image Illustration"
            >
              <i className="fas fa-wand-sparkles text-xl mb-1"></i>
              <span className="text-[8px] font-black uppercase tracking-tighter">Visual</span>
            </button>
            <button
              onClick={() => handleAskAI('text')}
              disabled={isLoading || !question.trim()}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all glow-border ${
                isLoading || !question.trim() 
                ? 'bg-white/5 text-slate-700 cursor-not-allowed grayscale' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'
              }`}
              title="Ask Text Question"
            >
              <i className="fas fa-paper-plane text-xl mb-1"></i>
              <span className="text-[8px] font-black uppercase tracking-tighter">Send</span>
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center px-4">
           <div className="flex space-x-4">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center">
                <i className="fas fa-keyboard mr-1.5 opacity-40"></i> Shift+Enter for new line
              </span>
           </div>
           <div className="bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
              <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">Targeting Grades 8–12</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
