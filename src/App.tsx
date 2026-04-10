import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, BookOpen, Volume2, Search, List, Plus, 
  Settings, ChevronRight, X, Check, ArrowRight,
  Info, Snail, MessageSquare, AlertCircle, RefreshCw, Archive, Trash2
} from 'lucide-react';

// --- THEME & COLORS ---
const COLORS = {
  rose: '#885159',
  purple: '#645188',
  brown: '#886451',
  teal: '#528881',
  black: '#000000',
};

// --- MOCK DATA ---
const DICTIONARY: Record<string, any> = {
  'accommodate': { 
    word: 'accommodate', pron: '/əˈkäməˌdāt/', def: 'Provide lodging or sufficient space for.', 
    ex: 'The hotel can accommodate up to 500 guests.', syn: 'house, hold', slang: 'make room for',
    tip: 'Two Cs, two Ms. Think: "Two cots, two mattresses to accommodate guests."',
    wrongOpts: ['acommodate', 'accomodate', 'acomodate']
  },
  'embarrass': { 
    word: 'embarrass', pron: '/əmˈberəs/', def: 'Cause to feel awkward, self-conscious, or ashamed.', 
    ex: 'I didn\'t want to embarrass him in front of his friends.', syn: 'humiliate', slang: 'cringe out',
    tip: 'Two Rs, two Ss. "Really red, so shy."',
    wrongOpts: ['embarass', 'embaras', 'embarrasss']
  },
  'fluorescent': { 
    word: 'fluorescent', pron: '/fləˈresənt/', def: 'Strikingly bright, glowing.', 
    ex: 'The fluorescent lights buzzed overhead.', syn: 'glowing', slang: 'neon',
    tip: 'Fluorine + escent. U comes before O.',
    wrongOpts: ['flourescent', 'flouresent', 'florescent']
  },
  'rhythm': { 
    word: 'rhythm', pron: '/ˈriT͟Həm/', def: 'A strong, regular, repeated pattern of movement or sound.', 
    ex: 'She danced to the rhythm of the music.', syn: 'beat, tempo', slang: 'vibe, flow',
    tip: 'Rhythm Helps Your Two Hips Move (R-H-Y-T-H-M).',
    wrongOpts: ['rythm', 'rhythum', 'rhytm']
  },
  'necessary': {
    word: 'necessary', pron: '/ˈnesəˌserē/', def: 'Required to be done, achieved, or present.',
    ex: 'It is necessary to wear a helmet.', syn: 'essential', slang: 'must-have',
    tip: 'One Collar, two Sleeves (One C, two Ss).',
    wrongOpts: ['neccessary', 'necesary', 'necessery']
  },
  'biology': { word: 'biology', pron: '/bīˈäləjē/', def: 'The study of living organisms.', ex: 'We learned about cells in biology.', syn: 'life science', slang: 'bio', tip: 'Bio means life, logy means study of.', wrongOpts: ['bioligy', 'byology', 'biollogy'] },
  'photosynthesis': { word: 'photosynthesis', pron: '/ˌfōdōˈsinTHəsəs/', def: 'Process by which plants use sunlight to synthesize foods.', ex: 'Photosynthesis requires sunlight and water.', syn: '', slang: '', tip: 'Photo (light) + synthesis (putting together).', wrongOpts: ['fotosynthesis', 'photosinthesis', 'photosyntesis'] },
  'literature': { word: 'literature', pron: '/ˈlidərəCHər/', def: 'Written works, especially those considered of superior or lasting artistic merit.', ex: 'She studied English literature in college.', syn: 'writings', slang: 'lit', tip: 'Liter-a-ture.', wrongOpts: ['litterature', 'litereture', 'litrature'] },
};

const INITIAL_LISTS = [
  { id: '1', name: 'Weekly Spelling', words: ['accommodate', 'embarrass', 'rhythm'], active: true },
  { id: '2', name: 'Science Vocab', words: ['fluorescent', 'necessary'], active: true }
];

// --- UTILITY COMPONENTS ---
const GlassCard = ({ children, className = '', onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-[#886451]/20 backdrop-blur-xl border border-[#528881]/30 rounded-2xl shadow-2xl overflow-hidden ${onClick ? 'cursor-pointer hover:bg-[#886451]/30 hover:border-[#528881]/50 transition-all' : ''} ${className}`}
  >
    {children}
  </div>
);

const TealButton = ({ children, onClick, className = '', outline = false, disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
      border focus:outline-none focus:ring-2 focus:ring-[#528881] disabled:opacity-50
      ${outline ? 'bg-transparent text-[#528881] border-[#528881]/60 hover:bg-[#528881]/10' : 'bg-[#885159] text-white border-[#528881]/80 hover:bg-[#885159]/90 shadow-[0_0_10px_rgba(82,136,129,0.2)]'}
      ${className}
    `}
  >
    {children}
  </button>
);

const HelperBtn = ({ icon: Icon, onClick, title, disabled }: any) => (
  <button 
    onClick={onClick} 
    title={title}
    disabled={disabled}
    className="p-2 rounded-full border border-[#528881]/40 text-[#528881] hover:bg-[#528881]/20 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#528881]"
  >
    <Icon size={18} />
  </button>
);

// --- AUDIO UTILS ---
const speakText = (text: string, rate: number = 1) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
};

// --- MAIN APP COMPONENT ---
export default function SpellCoach() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, quiz, quiet, search, lists, create, missed
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [missedWords, setMissedWords] = useState(['rhythm']);
  const [selectedWord, setSelectedWord] = useState<string | null>(null); // For detail modal
  const [practiceModeWords, setPracticeModeWords] = useState<string[]>([]); // To pass specific words to quiz

  // Global active words pool
  const activeWords = lists.filter(l => l.active).flatMap(l => l.words);
  const allPracticeWords = activeWords.length > 0 ? activeWords : Object.keys(DICTIONARY);

  const startQuiz = (wordsToPractice?: string[]) => {
    setPracticeModeWords(wordsToPractice && wordsToPractice.length > 0 ? wordsToPractice : allPracticeWords);
    setCurrentView('quiz');
  };

  const startQuiet = (wordsToPractice?: string[]) => {
    setPracticeModeWords(wordsToPractice && wordsToPractice.length > 0 ? wordsToPractice : allPracticeWords);
    setCurrentView('quiet');
  };

  // --- VIEWS ---

  const Dashboard = () => (
    <div className="flex flex-col gap-6 max-w-2xl w-full mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-4">
        <h1 className="font-title text-5xl text-gray-100 mb-2 tracking-wide drop-shadow-md">SpellCoach</h1>
        <p className="font-subtitle text-[#528881] text-sm tracking-widest uppercase">Your personal spelling tutor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard onClick={() => startQuiz()} className="p-6 border-[#528881]/70 bg-gradient-to-br from-[#885159]/30 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#528881]/10 rounded-full blur-2xl group-hover:bg-[#528881]/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-3 relative z-10">
            <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/50"><Play size={24} color={COLORS.teal} /></div>
            <h2 className="text-xl font-medium text-gray-100">Start Quiz</h2>
          </div>
          <p className="text-gray-300 text-sm relative z-10">Focus mode. Type the words as you hear them.</p>
        </GlassCard>

        <GlassCard onClick={() => startQuiet()} className="p-6 group">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/40 group-hover:border-[#528881]/70 transition-colors"><BookOpen size={24} color={COLORS.teal} /></div>
            <h2 className="text-xl font-medium text-gray-100">Quiet Practice</h2>
          </div>
          <p className="text-gray-400 text-sm">No sound required. Multiple choice spelling.</p>
        </GlassCard>

        <GlassCard onClick={() => setCurrentView('search')} className="p-6 group">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/40 group-hover:border-[#528881]/70 transition-colors"><Search size={24} color={COLORS.teal} /></div>
            <h2 className="text-xl font-medium text-gray-100">Word Search</h2>
          </div>
          <p className="text-gray-400 text-sm">Find your current spelling words in the grid.</p>
        </GlassCard>

        <GlassCard onClick={() => { setSelectedWord(null); setCurrentView('missed'); }} className="p-6 group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#528881]/20 rounded-xl border border-[#528881]/40 group-hover:border-[#528881]/70 transition-colors"><AlertCircle size={24} color={COLORS.teal} /></div>
              <h2 className="text-xl font-medium text-gray-100">Missed Words</h2>
            </div>
            {missedWords.length > 0 && (
              <span className="bg-[#885159] text-white text-xs font-bold px-2 py-1 rounded-full border border-[#528881]/50 shadow-[0_0_8px_rgba(82,136,129,0.3)]">
                {missedWords.length}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">Review words you've slipped up on recently.</p>
        </GlassCard>
      </div>

      <div className="mt-4 pt-6 border-t border-[#528881]/30 grid grid-cols-2 gap-4">
        <TealButton outline onClick={() => setCurrentView('lists')} className="w-full">
          <List size={18} /> My Lists
        </TealButton>
        <TealButton onClick={() => setCurrentView('createList')} className="w-full">
          <Plus size={18} /> New List
        </TealButton>
      </div>
    </div>
  );

  const Quiz = () => {
    const [wordIdx, setWordIdx] = useState(0);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('idle'); // idle, correct, incorrect
    const words = practiceModeWords;
    const currentWord = words[wordIdx];
    const details = DICTIONARY[currentWord] || { word: currentWord, tip: 'Keep practicing this word!', ex: '' };
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
      if (inputRef.current && status === 'idle') inputRef.current.focus(); 
    }, [status, wordIdx]);

    useEffect(() => {
      if (currentWord && status === 'idle') {
        speakText(currentWord);
      }
    }, [currentWord, status]);

    const checkAnswer = (e: any) => {
      e.preventDefault();
      if (!input) return;
      if (input.toLowerCase().trim() === currentWord.toLowerCase()) {
        setStatus('correct');
        speakText("Correct!");
      } else {
        setStatus('incorrect');
        speakText("Not quite.");
        if (!missedWords.includes(currentWord)) setMissedWords([...missedWords, currentWord]);
      }
    };

    const nextWord = () => {
      setInput('');
      setStatus('idle');
      setWordIdx((prev) => (prev + 1) % words.length);
    };

    const renderDiff = (target: string, user: string) => {
      const targetChars = target.split('');
      const userChars = user.split('');
      const maxLen = Math.max(targetChars.length, userChars.length);
      let els = [];
      for (let i=0; i<maxLen; i++) {
        if (targetChars[i] === userChars[i]) {
          els.push(<span key={i} className="text-gray-200">{targetChars[i]}</span>);
        } else {
          els.push(
            <span key={i} className="text-[#885159] font-bold underline decoration-[#528881]/80 decoration-2">
              {userChars[i] || '_'}
            </span>
          );
        }
      }
      return els;
    };

    if (!currentWord) return <div className="text-white">No active words found. Create a list!</div>;

    return (
      <div className="max-w-lg w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setCurrentView('dashboard')} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors">
          <ChevronRight className="rotate-180" size={20} /> Back
        </button>

        <GlassCard className="p-8 border-[#528881]/50">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#528881]/30">
            <span className="text-gray-400 text-sm font-subtitle tracking-widest">Word {wordIdx + 1} of {words.length}</span>
            <div className="flex gap-2">
              <HelperBtn icon={Volume2} title="Hear Word" onClick={() => speakText(currentWord)} />
              <HelperBtn icon={Snail} title="Slower" onClick={() => speakText(currentWord, 0.5)} />
              <HelperBtn icon={MessageSquare} title="Example Sentence" onClick={() => speakText(details.ex || currentWord)} disabled={!details.ex} />
            </div>
          </div>

          <div className="text-center mb-8">
            <button 
              onClick={() => speakText(currentWord)}
              className="w-20 h-20 mx-auto bg-[#528881]/10 rounded-full flex items-center justify-center border-2 border-[#528881]/40 mb-4 hover:bg-[#528881]/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(82,136,129,0.2)]"
            >
              <Volume2 size={32} color={COLORS.teal} />
            </button>
            <p className="text-gray-400 text-sm">Listen and type</p>
          </div>

          {status === 'idle' && (
            <form onSubmit={checkAnswer} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full bg-black/50 border-2 border-[#528881]/50 rounded-xl px-4 py-4 text-center text-2xl text-gray-100 focus:outline-none focus:border-[#528881] focus:ring-1 focus:ring-[#528881] transition-all shadow-inner"
                placeholder="Type spelling here..."
                autoComplete="off"
                spellCheck={false}
              />
              <TealButton className="w-full mt-6 py-4 text-lg">Check Answer</TealButton>
            </form>
          )}

          {status === 'correct' && (
            <div className="text-center animate-in zoom-in-95">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#528881]/20 border-2 border-[#528881] mb-6 shadow-[0_0_20px_rgba(82,136,129,0.4)]">
                <Check size={40} color={COLORS.teal} />
              </div>
              <h2 className="font-title text-3xl text-gray-100 mb-8 tracking-wide">Excellent!</h2>
              <TealButton onClick={nextWord} className="w-full py-4 text-lg">Next Word <ArrowRight size={20} /></TealButton>
            </div>
          )}

          {status === 'incorrect' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-[#885159]/20 border border-[#885159]/50 rounded-xl p-6 mb-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#885159]"></div>
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-subtitle">You Typed</p>
                <div className="text-2xl tracking-widest mb-4 bg-black/40 py-3 rounded-lg border border-[#528881]/30">
                  {renderDiff(currentWord, input)}
                </div>
                
                <p className="text-xs text-[#528881] mb-1 uppercase tracking-wider mt-6 font-subtitle">Correct Spelling</p>
                <div className="text-3xl text-gray-100 tracking-widest font-medium mb-4">{currentWord}</div>

                {details.tip && (
                  <div className="bg-black/50 p-4 rounded-lg text-left border border-[#528881]/40 mt-6">
                    <div className="flex items-center gap-2 mb-2 text-[#528881]">
                      <Info size={16} /> <span className="font-medium text-sm">Memory Trick</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{details.tip}</p>
                  </div>
                )}
              </div>
              <TealButton onClick={nextWord} className="w-full py-4 text-lg">Got it, Next Word <ArrowRight size={20} /></TealButton>
            </div>
          )}
        </GlassCard>
      </div>
    );
  };

  const QuietPractice = () => {
    const [wordIdx, setWordIdx] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, checked
    const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const words = practiceModeWords;
    const currentWord = words[wordIdx];

    useEffect(() => {
      if (currentWord) {
        const details = DICTIONARY[currentWord] || { wrongOpts: [currentWord+'s', currentWord.substring(0, currentWord.length-1)] };
        const opts = [currentWord, ...details.wrongOpts].sort(() => Math.random() - 0.5);
        setOptions(opts);
        setSelectedOpt(null);
        setStatus('idle');
      }
    }, [currentWord, wordIdx]);

    const handleCheck = () => {
      if (!selectedOpt) return;
      setStatus('checked');
      if (selectedOpt !== currentWord) {
        if (!missedWords.includes(currentWord)) setMissedWords([...missedWords, currentWord]);
      }
    };

    const nextWord = () => {
      setWordIdx((prev) => (prev + 1) % words.length);
    };

    if (!currentWord) return <div className="text-white">No active words.</div>;

    return (
      <div className="max-w-lg w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
         <button onClick={() => setCurrentView('dashboard')} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors">
          <ChevronRight className="rotate-180" size={20} /> Back
        </button>

        <GlassCard className="p-8 border-[#528881]/50">
          <div className="text-center mb-8 border-b border-[#528881]/30 pb-6">
            <h2 className="text-[#528881] text-sm uppercase tracking-widest mb-2 font-subtitle">Quiet Mode</h2>
            <p className="text-gray-300">Which is the correct spelling?</p>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            {options.map((opt, i) => {
              let btnClass = "bg-black/40 border-[#528881]/30 text-gray-300 hover:border-[#528881]/80 hover:bg-[#528881]/10";
              
              if (status === 'idle') {
                if (selectedOpt === opt) {
                  btnClass = "bg-[#528881]/20 border-[#528881] text-white shadow-[0_0_10px_rgba(82,136,129,0.3)]";
                }
              } else if (status === 'checked') {
                if (opt === currentWord) {
                  btnClass = "bg-[#528881]/40 border-[#528881] text-white shadow-[0_0_15px_rgba(82,136,129,0.5)]";
                } else if (selectedOpt === opt) {
                  btnClass = "bg-[#885159]/40 border-[#885159] text-white";
                } else {
                  btnClass = "bg-black/20 border-[#528881]/20 text-gray-600 opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => status === 'idle' && setSelectedOpt(opt)}
                  disabled={status !== 'idle'}
                  className={`p-4 rounded-xl border-2 transition-all text-xl tracking-wide ${btnClass}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {status === 'idle' ? (
            <TealButton 
              onClick={handleCheck} 
              disabled={!selectedOpt} 
              className="w-full py-4 text-lg"
            >
              Check Answer
            </TealButton>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2">
               {selectedOpt === currentWord ? (
                 <div className="text-center mb-6">
                   <h3 className="font-title text-2xl text-[#528881] mb-2">Spot On!</h3>
                 </div>
               ) : (
                 <div className="text-center mb-6">
                   <h3 className="font-title text-2xl text-[#885159] mb-2">Not quite</h3>
                   <div className="text-sm text-[#885159] bg-[#885159]/10 p-3 rounded-lg border border-[#885159]/30 inline-block">
                     Saved to Missed Words
                   </div>
                 </div>
               )}
               <TealButton onClick={nextWord} className="w-full py-4 text-lg">Continue <ArrowRight size={20} /></TealButton>
            </div>
          )}
        </GlassCard>
      </div>
    );
  };

  const WordSearch = () => {
    const gridSize = 10;
    const [grid, setGrid] = useState<string[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [selection, setSelection] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [lines, setLines] = useState<{start: number, end: number}[]>([]);
    const gridRef = useRef<HTMLDivElement>(null);

    const wordsToHide = allPracticeWords.slice(0, 5).map(w => w.toUpperCase());

    useEffect(() => {
      // Simple grid generation
      let newGrid = Array(gridSize * gridSize).fill('');
      let placedWords: string[] = [];

      wordsToHide.forEach(word => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
          const dir = Math.floor(Math.random() * 3); // 0: horiz, 1: vert, 2: diag
          const row = Math.floor(Math.random() * gridSize);
          const col = Math.floor(Math.random() * gridSize);
          
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            let r = row + (dir === 1 || dir === 2 ? i : 0);
            let c = col + (dir === 0 || dir === 2 ? i : 0);
            if (r >= gridSize || c >= gridSize || (newGrid[r * gridSize + c] !== '' && newGrid[r * gridSize + c] !== word[i])) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              let r = row + (dir === 1 || dir === 2 ? i : 0);
              let c = col + (dir === 0 || dir === 2 ? i : 0);
              newGrid[r * gridSize + c] = word[i];
            }
            placed = true;
            placedWords.push(word);
          }
          attempts++;
        }
      });

      for(let i=0; i<newGrid.length; i++) {
        if(!newGrid[i]) newGrid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
      setGrid(newGrid);
    }, []);

    const getIndexFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
      if (!gridRef.current) return -1;
      const rect = gridRef.current.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const cellWidth = rect.width / gridSize;
      const cellHeight = rect.height / gridSize;
      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);
      if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
        return row * gridSize + col;
      }
      return -1;
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      const idx = getIndexFromEvent(e);
      if (idx !== -1) {
        setIsDragging(true);
        setSelection([idx]);
      }
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      const idx = getIndexFromEvent(e);
      if (idx !== -1 && selection[0] !== undefined) {
        // Calculate straight line
        const startIdx = selection[0];
        const startR = Math.floor(startIdx / gridSize);
        const startC = startIdx % gridSize;
        const endR = Math.floor(idx / gridSize);
        const endC = idx % gridSize;
        
        const rDiff = endR - startR;
        const cDiff = endC - startC;
        
        if (rDiff === 0 || cDiff === 0 || Math.abs(rDiff) === Math.abs(cDiff)) {
          const steps = Math.max(Math.abs(rDiff), Math.abs(cDiff));
          const rStep = rDiff === 0 ? 0 : rDiff / steps;
          const cStep = cDiff === 0 ? 0 : cDiff / steps;
          
          const newSel = [];
          for (let i = 0; i <= steps; i++) {
            newSel.push((startR + i * rStep) * gridSize + (startC + i * cStep));
          }
          setSelection(newSel);
        }
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (selection.length > 1) {
        const selectedWord = selection.map(idx => grid[idx]).join('');
        const reversedWord = selectedWord.split('').reverse().join('');
        
        if (wordsToHide.includes(selectedWord) && !foundWords.includes(selectedWord)) {
          setFoundWords([...foundWords, selectedWord]);
          setLines([...lines, {start: selection[0], end: selection[selection.length-1]}]);
        } else if (wordsToHide.includes(reversedWord) && !foundWords.includes(reversedWord)) {
          setFoundWords([...foundWords, reversedWord]);
          setLines([...lines, {start: selection[selection.length-1], end: selection[0]}]);
        }
      }
      setSelection([]);
    };

    return (
      <div className="max-w-xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setCurrentView('dashboard')} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors">
          <ChevronRight className="rotate-180" size={20} /> Back
        </button>

        <GlassCard className="p-6 border-[#528881]/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl text-gray-100 font-title">Word Search</h2>
              <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest">Find active list words</p>
            </div>
            <div className="text-xs text-[#528881] bg-[#528881]/10 px-3 py-1 rounded-full border border-[#528881]/30">Drag to select</div>
          </div>

          <div 
            ref={gridRef}
            className="grid grid-cols-10 gap-1 mb-8 bg-black/40 p-3 rounded-xl border border-[#528881]/30 relative touch-none select-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            {grid.map((char, i) => {
              const isSelected = selection.includes(i);
              return (
                <div 
                  key={i} 
                  className={`aspect-square flex items-center justify-center font-medium text-sm sm:text-lg rounded-md transition-colors z-10
                    ${isSelected ? 'bg-[#528881] text-white shadow-[0_0_10px_rgba(82,136,129,0.8)]' : 'text-gray-300'}`}
                >
                  {char}
                </div>
              );
            })}
            
            {/* Draw lines for found words */}
            {lines.map((line, i) => {
              const startR = Math.floor(line.start / gridSize);
              const startC = line.start % gridSize;
              const endR = Math.floor(line.end / gridSize);
              const endC = line.end % gridSize;
              
              const top = Math.min(startR, endR) * 10 + 5;
              const left = Math.min(startC, endC) * 10 + 5;
              const height = Math.abs(endR - startR) * 10 + 10;
              const width = Math.abs(endC - startC) * 10 + 10;
              
              // This is a simplified visual line, absolute positioning over grid cells
              return (
                <svg key={i} className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <line 
                    x1={`${(startC + 0.5) * 10}%`} y1={`${(startR + 0.5) * 10}%`} 
                    x2={`${(endC + 0.5) * 10}%`} y2={`${(endR + 0.5) * 10}%`} 
                    stroke="#528881" strokeWidth="20" strokeLinecap="round" opacity="0.4"
                  />
                </svg>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            {wordsToHide.map((w, i) => {
              const isFound = foundWords.includes(w);
              return (
                <span key={i} className={`text-sm px-4 py-2 rounded-full border transition-all ${isFound ? 'border-[#528881] text-[#528881] bg-[#528881]/20 line-through decoration-2 shadow-[0_0_8px_rgba(82,136,129,0.2)]' : 'border-[#528881]/40 text-gray-400 bg-black/30'}`}>
                  {w}
                </span>
              );
            })}
          </div>
        </GlassCard>
      </div>
    );
  };

  const WordDetailModal = ({ word, onClose }: any) => {
    if (!word) return null;
    const details = DICTIONARY[word] || { word, pron: '', def: 'Definition not available.', ex: '', syn: '', slang: '', tip: '' };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <GlassCard className="w-full max-w-md p-0 overflow-hidden relative border-[#528881] shadow-[0_0_40px_rgba(82,136,129,0.2)]">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full bg-black/40 hover:bg-[#528881]/40 transition-colors z-10 border border-[#528881]/20 hover:border-[#528881]">
            <X size={20} />
          </button>
          
          <div className="p-8 pb-6 border-b border-[#528881]/30 bg-gradient-to-b from-[#528881]/20 to-transparent">
            <h2 className="text-4xl font-title text-white mb-3">{details.word}</h2>
            <div className="flex items-center gap-3 text-[#528881]">
               <span className="font-mono text-sm bg-black/30 px-2 py-1 rounded border border-[#528881]/30">{details.pron || '/.../'}</span>
               <HelperBtn icon={Volume2} title="Pronounce" onClick={() => speakText(details.word)} />
            </div>
          </div>

          <div className="p-8 space-y-6 bg-black/40">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-2">Definition</h3>
              <p className="text-gray-200 text-base leading-relaxed">{details.def}</p>
            </div>
            
            {details.ex && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#528881] font-subtitle mb-2">Example</h3>
                <p className="text-gray-300 text-base italic border-l-2 border-[#528881]/50 pl-3 py-1">"{details.ex}"</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              {details.syn && (
                <div className="flex-1 bg-black/50 p-4 rounded-xl border border-[#528881]/40">
                  <span className="block text-[10px] uppercase text-[#528881] mb-1 font-subtitle">Synonyms</span>
                  <span className="text-sm text-gray-300">{details.syn}</span>
                </div>
              )}
              {details.slang && (
                <div className="flex-1 bg-[#886451]/20 p-4 rounded-xl border border-[#886451]/50">
                  <span className="block text-[10px] uppercase text-[#886451] mb-1 font-subtitle">Modern Usage</span>
                  <span className="text-sm text-gray-300">{details.slang}</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  };

  const ListManager = () => {
    return (
      <div className="max-w-2xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentView('dashboard')} className="text-[#528881] flex items-center gap-2 hover:text-white transition-colors">
            <ChevronRight className="rotate-180" size={20} /> Back
          </button>
          <TealButton onClick={() => setCurrentView('createList')} className="py-2 px-4 text-sm"><Plus size={16}/> New List</TealButton>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#528881]/40 pb-3">
              <h2 className="text-xl text-gray-100 font-medium flex items-center gap-3 font-title">
                <div className="w-2 h-2 rounded-full bg-[#528881] shadow-[0_0_8px_#528881]"></div>
                Active Lists <span className="text-[#528881] text-sm font-sans">({lists.filter(l=>l.active).length}/3)</span>
              </h2>
            </div>
            <div className="grid gap-4">
              {lists.filter(l => l.active).map(list => (
                <GlassCard key={list.id} className="p-5 flex items-center justify-between border-[#528881]/40">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-1">{list.name}</h3>
                    <p className="text-[#528881] text-sm">{list.words.length} words</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-[#528881] p-2 border border-transparent hover:border-[#528881]/40 hover:bg-[#528881]/10 rounded-lg transition-all">
                      <Archive size={18} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MissedWordsView = () => {
    return (
      <div className="max-w-2xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentView('dashboard')} className="text-[#528881] flex items-center gap-2 hover:text-white transition-colors">
            <ChevronRight className="rotate-180" size={20} /> Back
          </button>
        </div>

        <GlassCard className="p-8 border-[#528881]/50">
          <div className="flex items-center justify-between mb-6 border-b border-[#528881]/40 pb-4">
            <div>
              <h2 className="text-2xl text-gray-100 font-title">Missed Words</h2>
              <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest mt-1">Review and practice</p>
            </div>
            {missedWords.length > 0 && (
              <TealButton onClick={() => startQuiz(missedWords)} className="py-2 px-4 text-sm">
                <Play size={16} /> Practice These
              </TealButton>
            )}
          </div>

          {missedWords.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-[#528881]/10 rounded-full flex items-center justify-center border border-[#528881]/30 mb-4">
                <Check size={32} className="text-[#528881]" />
              </div>
              <p className="text-gray-300 text-lg">No missed words yet.</p>
              <p className="text-[#528881] text-sm mt-2">Great job! Keep up the good work.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {missedWords.map((word, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedWord(word)}
                  className="px-4 py-2 bg-black/50 border border-[#885159]/60 text-gray-200 rounded-xl text-base hover:border-[#885159] hover:bg-[#885159]/20 transition-all shadow-sm"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    );
  };

  const CreateListFlow = () => {
    const [step, setStep] = useState('choose'); // choose, autoConfig, autoSelect, mylist
    const [category, setCategory] = useState('Science');
    const [difficulty, setDifficulty] = useState('Medium');
    const [generatedWords, setGeneratedWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [listName, setListName] = useState('');
    const [customWords, setCustomWords] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');

    const handleAutoGenerate = () => {
      // Mock generation based on category
      const mockGen = ['biology', 'photosynthesis', 'ecosystem', 'organism', 'habitat', 'species', 'evolution', 'genetics', 'nucleus', 'membrane'];
      setGeneratedWords(mockGen);
      setStep('autoSelect');
    };

    const toggleWordSelection = (word: string) => {
      if (selectedWords.includes(word)) {
        setSelectedWords(selectedWords.filter(w => w !== word));
      } else {
        if (selectedWords.length < 10) {
          setSelectedWords([...selectedWords, word]);
        }
      }
    };

    const saveAutoList = () => {
      if (selectedWords.length === 0 || !listName) return;
      const newList = { id: Date.now().toString(), name: listName, words: selectedWords, active: true };
      setLists([...lists, newList]);
      setCurrentView('lists');
    };

    const addCustomWord = (e: any) => {
      e.preventDefault();
      if (customInput.trim() && !customWords.includes(customInput.trim())) {
        setCustomWords([...customWords, customInput.trim()]);
        setCustomInput('');
      }
    };

    const removeCustomWord = (word: string) => {
      setCustomWords(customWords.filter(w => w !== word));
    };

    const saveCustomList = () => {
      if (customWords.length === 0 || !listName) return;
      const newList = { id: Date.now().toString(), name: listName, words: customWords, active: true };
      setLists([...lists, newList]);
      setCurrentView('lists');
    };
    
    return (
      <div className="max-w-xl w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setCurrentView('lists')} className="text-[#528881] flex items-center gap-2 mb-6 hover:text-white transition-colors">
          <ChevronRight className="rotate-180" size={20} /> Cancel
        </button>

        <GlassCard className="p-8 border-[#528881]/50">
          <div className="text-center mb-8 border-b border-[#528881]/30 pb-6">
            <h2 className="text-3xl text-gray-100 mb-2 font-title">Create New List</h2>
            <p className="text-[#528881] text-sm font-subtitle uppercase tracking-widest">
              {step === 'choose' ? 'How would you like to build it?' : 
               step === 'autoConfig' ? 'Configure Generator' :
               step === 'autoSelect' ? 'Select Words' : 'Manual Entry'}
            </p>
          </div>

          {step === 'choose' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setStep('autoConfig')}
                className="p-6 bg-black/40 border border-[#528881]/40 rounded-xl hover:border-[#528881] hover:bg-[#528881]/20 transition-all text-left group shadow-inner"
              >
                <RefreshCw size={28} className="text-[#528881] mb-4 group-hover:rotate-180 transition-transform duration-500" />
                <h3 className="text-xl text-white mb-2 font-medium">Auto-Generate</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Choose a category and difficulty. We'll suggest words for you.</p>
              </button>

              <button 
                onClick={() => setStep('mylist')}
                className="p-6 bg-black/40 border border-[#528881]/40 rounded-xl hover:border-[#528881] hover:bg-[#528881]/20 transition-all text-left group shadow-inner"
              >
                <List size={28} className="text-[#528881] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl text-white mb-2 font-medium">My List</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Start with a blank slate and manually enter your own spelling words.</p>
              </button>
            </div>
          )}

          {step === 'autoConfig' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-[#528881]/50 rounded-xl p-4 text-white focus:outline-none focus:border-[#528881] appearance-none"
                >
                  <option>Science</option>
                  <option>Literature</option>
                  <option>History</option>
                  <option>Geography</option>
                </select>
              </div>
              <div>
                <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">Difficulty</label>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard'].map(diff => (
                    <button 
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-3 rounded-xl border transition-all ${difficulty === diff ? 'bg-[#528881]/20 border-[#528881] text-white shadow-[0_0_10px_rgba(82,136,129,0.3)]' : 'bg-black/30 border-[#528881]/30 text-gray-400 hover:border-[#528881]/60'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <TealButton onClick={handleAutoGenerate} className="w-full mt-4 py-4">Generate Words</TealButton>
            </div>
          )}

          {step === 'autoSelect' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">List Name</label>
                <input 
                  type="text" 
                  value={listName}
                  onChange={e => setListName(e.target.value)}
                  placeholder="e.g., Science Week 1"
                  className="w-full bg-black/50 border border-[#528881]/50 rounded-xl p-4 text-white focus:outline-none focus:border-[#528881]"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[#528881] text-sm font-subtitle uppercase">Select Words</label>
                  <span className="text-xs text-gray-400">{selectedWords.length}/10 selected</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-black/20 rounded-xl border border-[#528881]/20">
                  {generatedWords.map(word => {
                    const isSelected = selectedWords.includes(word);
                    return (
                      <button
                        key={word}
                        onClick={() => toggleWordSelection(word)}
                        className={`px-4 py-2 rounded-full border transition-all ${isSelected ? 'bg-[#528881]/30 border-[#528881] text-white shadow-[0_0_8px_rgba(82,136,129,0.4)]' : 'bg-black/40 border-[#528881]/30 text-gray-300 hover:border-[#528881]/60'}`}
                      >
                        {word} {isSelected && <Check size={14} className="inline ml-1" />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <TealButton onClick={saveAutoList} disabled={selectedWords.length === 0 || !listName} className="w-full py-4">Save List</TealButton>
            </div>
          )}

          {step === 'mylist' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">List Name</label>
                <input 
                  type="text" 
                  value={listName}
                  onChange={e => setListName(e.target.value)}
                  placeholder="e.g., Custom Spelling"
                  className="w-full bg-black/50 border border-[#528881]/50 rounded-xl p-4 text-white focus:outline-none focus:border-[#528881]"
                />
              </div>
              
              <div>
                <label className="block text-[#528881] text-sm mb-2 font-subtitle uppercase">Add Words</label>
                <form onSubmit={addCustomWord} className="flex gap-2">
                  <input 
                    type="text" 
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Type a word..."
                    className="flex-1 bg-black/50 border border-[#528881]/50 rounded-xl p-4 text-white focus:outline-none focus:border-[#528881]"
                  />
                  <TealButton type="submit" className="px-6"><Plus size={20}/></TealButton>
                </form>
              </div>

              {customWords.length > 0 && (
                <div className="bg-black/30 p-4 rounded-xl border border-[#528881]/30">
                  <div className="flex flex-wrap gap-2">
                    {customWords.map(word => (
                      <div key={word} className="flex items-center gap-2 bg-[#528881]/20 border border-[#528881]/50 text-white px-3 py-1.5 rounded-full">
                        <span>{word}</span>
                        <button onClick={() => removeCustomWord(word)} className="text-[#885159] hover:text-red-400"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <TealButton onClick={saveCustomList} disabled={customWords.length === 0 || !listName} className="w-full py-4 mt-4">Save List</TealButton>
            </div>
          )}
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black font-body flex items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-[#528881]/40">
      {/* Complex Radial Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_#645188_0%,_#000000_80%)] opacity-90 mix-blend-screen"></div>
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40"></div>

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex justify-center">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'quiz' && <Quiz />}
        {currentView === 'quiet' && <QuietPractice />}
        {currentView === 'search' && <WordSearch />}
        {currentView === 'lists' && <ListManager />}
        {currentView === 'createList' && <CreateListFlow />}
        {currentView === 'missed' && <MissedWordsView />}
      </main>

      <WordDetailModal word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
