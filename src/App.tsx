import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Trash2, Settings, ChevronUp, ChevronDown, Monitor, Type } from 'lucide-react';

interface TypingState {
  isPlaying: boolean;
  currentStringIndex: number;
  currentCharIndex: number;
  isDeleting: boolean;
  showCursor: boolean;
}

const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
  { name: 'Nunito', value: 'Nunito, sans-serif' },
  { name: 'Work Sans', value: 'Work Sans, sans-serif' },
  { name: 'IBM Plex Sans', value: 'IBM Plex Sans, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' }
];

// Sort font options alphabetically by name
const SORTED_FONT_OPTIONS = [...FONT_OPTIONS].sort((a, b) => a.name.localeCompare(b.name));

function App() {
  // Helper to get settings from localStorage
  const getInitialSettings = () => {
    const saved = localStorage.getItem('typingSimulatorSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  };
  const initial = getInitialSettings();

  const [strings, setStrings] = useState<string[]>(Array.isArray(initial.strings) ? initial.strings : ['web development', 'react tutorials', 'javascript tips']);
  const [newString, setNewString] = useState('');
  const [typingSpeed, setTypingSpeed] = useState(typeof initial.typingSpeed === 'number' ? initial.typingSpeed : 70);
  const [deleteSpeed, setDeleteSpeed] = useState(typeof initial.deleteSpeed === 'number' ? initial.deleteSpeed : 50);
  const [pauseBetween, setPauseBetween] = useState(typeof initial.pauseBetween === 'number' ? initial.pauseBetween : 800);
  const [displayText, setDisplayText] = useState('');
  const [loopAnimation, setLoopAnimation] = useState(typeof initial.loopAnimation === 'boolean' ? initial.loopAnimation : false);
  const [keepLastString, setKeepLastString] = useState(typeof initial.keepLastString === 'boolean' ? initial.keepLastString : false);
  const [fastDelete, setFastDelete] = useState(typeof initial.fastDelete === 'boolean' ? initial.fastDelete : false);
  const [showTitle, setShowTitle] = useState(typeof initial.showTitle === 'boolean' ? initial.showTitle : true);
  const [showButtons, setShowButtons] = useState(typeof initial.showButtons === 'boolean' ? initial.showButtons : true);
  const [iconPosition, setIconPosition] = useState<'left' | 'right'>(initial.iconPosition === 'right' ? 'right' : 'left');
  const [searchIcon, setSearchIcon] = useState(typeof initial.searchIcon === 'string' ? initial.searchIcon : '🔍');
  const [placeholderText, setPlaceholderText] = useState(typeof initial.placeholderText === 'string' ? initial.placeholderText : 'Search Google or type a URL');
  const [selectedFont, setSelectedFont] = useState(typeof initial.selectedFont === 'string' ? initial.selectedFont : 'Inter, sans-serif');
  const [backgroundStyle, setBackgroundStyle] = useState<'solid' | 'gradient'>(initial.backgroundStyle === 'gradient' ? 'gradient' : 'solid');
  const [gradientType, setGradientType] = useState(typeof initial.gradientType === 'string' ? initial.gradientType : 'blue-purple');
  const [isTextSelected, setIsTextSelected] = useState(false);
  
  const [typingState, setTypingState] = useState<TypingState>({
    isPlaying: false,
    currentStringIndex: 0,
    currentCharIndex: 0,
    isDeleting: false,
    showCursor: true
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const cursorIntervalRef = useRef<ReturnType<typeof setTimeout>>();

  const GRADIENT_OPTIONS = [
    { label: 'Blue → Purple', value: 'blue-purple', style: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' },
    { label: 'Pink → Orange', value: 'pink-orange', style: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)' },
    { label: 'Green → Teal', value: 'green-teal', style: 'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)' },
    { label: 'Indigo → Cyan', value: 'indigo-cyan', style: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)' },
    { label: 'White → Light Gray', value: 'white-gray', style: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)' },
  ];

  const BACKGROUND_OPTIONS = [
    { label: 'Solid (White)', value: 'solid', style: '#ffffff' },
    ...GRADIENT_OPTIONS
  ];

  const handleBackgroundChange = (value: string) => {
    if (value === 'solid') {
      setBackgroundStyle('solid');
    } else {
      setBackgroundStyle('gradient');
      setGradientType(value);
    }
  };

  const getCurrentBackground = () => {
    if (backgroundStyle === 'solid') {
      return '#ffffff';
    }
    return GRADIENT_OPTIONS.find(opt => opt.value === gradientType)?.style || GRADIENT_OPTIONS[0].style;
  };

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      strings,
      typingSpeed,
      deleteSpeed,
      pauseBetween,
      loopAnimation,
      showTitle,
      showButtons,
      iconPosition,
      searchIcon,
      selectedFont,
      backgroundStyle,
      gradientType,
      keepLastString,
      placeholderText,
      fastDelete,
    };
    localStorage.setItem('typingSimulatorSettings', JSON.stringify(settings));
  }, [strings, typingSpeed, deleteSpeed, pauseBetween, loopAnimation, showTitle, showButtons, iconPosition, searchIcon, selectedFont, backgroundStyle, gradientType, keepLastString, placeholderText, fastDelete]);

  // Cursor blinking effect
  useEffect(() => {
    cursorIntervalRef.current = setInterval(() => {
      setTypingState(prev => ({ ...prev, showCursor: !prev.showCursor }));
    }, 530);

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  // Main typing animation logic
  useEffect(() => {
    if (!typingState.isPlaying || strings.length === 0) return;

    const currentString = strings[typingState.currentStringIndex];
    
    const performNextAction = () => {
      if (!typingState.isDeleting) {
        // Typing forward
        if (typingState.currentCharIndex < currentString.length) {
          const nextChar = typingState.currentCharIndex + 1;
          setDisplayText(currentString.substring(0, nextChar));
          setTypingState(prev => ({ ...prev, currentCharIndex: nextChar }));
        } else {
          // Finished typing current string, pause then start deleting
          timeoutRef.current = setTimeout(() => {
            // If keepLastString is enabled and this is the last string, don't start deleting
            if (keepLastString && typingState.currentStringIndex === strings.length - 1 && !loopAnimation) {
              setTypingState(prev => ({ ...prev, isPlaying: false }));
              return;
            }
            setTypingState(prev => ({ ...prev, isDeleting: true }));
          }, pauseBetween);
          return;
        }
      } else {
        // Deleting
        if (fastDelete && !isTextSelected) {
          // Fast delete - first show text selection, then delete
          setIsTextSelected(true);
          // Wait a brief moment to show selection, then delete
          timeoutRef.current = setTimeout(() => {
            setDisplayText('');
            setTypingState(prev => ({ ...prev, currentCharIndex: 0 }));
            setIsTextSelected(false);
          }, 200); // Brief pause to show selection
          return;
        } else if (fastDelete && isTextSelected) {
          // Text was selected and deleted, now move to next string
          const nextIndex = (typingState.currentStringIndex + 1) % strings.length;
          
          if (!loopAnimation && nextIndex === 0 && typingState.currentStringIndex > 0) {
            // Stop animation if not looping and we've completed all strings
            setTypingState(prev => ({ ...prev, isPlaying: false }));
            setIsTextSelected(false);
            return;
          }
          
          // If keepLastString is enabled and this is the last string, don't delete it
          if (keepLastString && nextIndex === 0 && !loopAnimation) {
            setTypingState(prev => ({ ...prev, isPlaying: false }));
            setIsTextSelected(false);
            return;
          }
          
          setTypingState(prev => ({
            ...prev,
            currentStringIndex: nextIndex,
            currentCharIndex: 0,
            isDeleting: false
          }));
          setDisplayText('');
          setIsTextSelected(false);
          return;
        } else {
          // Character by character deletion
          if (typingState.currentCharIndex > 0) {
            const nextChar = typingState.currentCharIndex - 1;
            setDisplayText(currentString.substring(0, nextChar));
            setTypingState(prev => ({ ...prev, currentCharIndex: nextChar }));
          } else {
            // Finished deleting, move to next string or stop if not looping
            const nextIndex = (typingState.currentStringIndex + 1) % strings.length;
            
            if (!loopAnimation && nextIndex === 0 && typingState.currentStringIndex > 0) {
              // Stop animation if not looping and we've completed all strings
              setTypingState(prev => ({ ...prev, isPlaying: false }));
              return;
            }
            
            // If keepLastString is enabled and this is the last string, don't delete it
            if (keepLastString && nextIndex === 0 && !loopAnimation) {
              setTypingState(prev => ({ ...prev, isPlaying: false }));
              return;
            }
            
            setTypingState(prev => ({
              ...prev,
              currentStringIndex: nextIndex,
              currentCharIndex: 0,
              isDeleting: false
            }));
            setDisplayText('');
            return;
          }
        }
      }
      
      // Schedule next action
      const speed = typingState.isDeleting ? deleteSpeed : typingSpeed + Math.random() * 50;
      timeoutRef.current = setTimeout(performNextAction, speed);
    };

    // Start the animation
    const speed = typingState.isDeleting ? deleteSpeed : typingSpeed + Math.random() * 50;
    timeoutRef.current = setTimeout(performNextAction, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [typingState.isPlaying, typingState.currentStringIndex, typingState.currentCharIndex, typingState.isDeleting, strings, typingSpeed, deleteSpeed, pauseBetween, loopAnimation, keepLastString, fastDelete, isTextSelected]);

  const handlePlay = () => {
    setTypingState(prev => ({ ...prev, isPlaying: true }));
  };

  const handlePause = () => {
    setTypingState(prev => ({ ...prev, isPlaying: false }));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleReset = () => {
    handlePause();
    setDisplayText('');
    setTypingState(prev => ({
      ...prev,
      currentStringIndex: 0,
      currentCharIndex: 0,
      isDeleting: false
    }));
  };

  const addString = () => {
    if (newString.trim()) {
      setStrings([...strings, newString.trim()]);
      setNewString('');
    }
  };

  const removeString = (index: number) => {
    const newStrings = strings.filter((_, i) => i !== index);
    setStrings(newStrings);
    if (newStrings.length === 0) {
      handleReset();
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const moveString = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= strings.length) return;
    
    const newStrings = [...strings];
    const [movedString] = newStrings.splice(fromIndex, 1);
    newStrings.splice(toIndex, 0, movedString);
    setStrings(newStrings);
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveString(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < strings.length - 1) {
      moveString(index, index + 1);
    }
  };

  const calculateVideoDuration = () => {
    if (strings.length === 0) return 0;
    
    let totalTime = 0;
    
    strings.forEach((string, index) => {
      // Time to type the string
      const typingTime = string.length * typingSpeed;
      
      // Time to delete the string (if not keeping last string or not the last string)
      const shouldDelete = !keepLastString || index < strings.length - 1;
      const deletionTime = shouldDelete ? string.length * deleteSpeed : 0;
      
      // Always add pause after typing, except if this is the last string and keepLastString is enabled
      let pauseTime = pauseBetween;
      if (keepLastString && index === strings.length - 1) {
        pauseTime = 0;
      }
      totalTime += typingTime + pauseTime + deletionTime;
    });
    
    return totalTime;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Modern Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Logo" className="w-9 h-9 rounded-xl" />
            <span className="text-ml font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Typing Simulator</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlay}
              disabled={typingState.isPlaying || strings.length === 0}
              className="group flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow transition-colors"
              title="Play"
            >
              <Play className="w-5 h-5" />
            </button>
            <button
              onClick={handlePause}
              disabled={!typingState.isPlaying}
              className="group flex items-center justify-center w-10 h-10 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow transition-colors"
              title="Pause"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="group flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 shadow transition-colors"
              title="Reset"
            >
              <Square className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-row h-full min-h-0 overflow-hidden">
        {/* Left Sidebar - Search Strings */}
        <aside className="w-80 bg-white/70 backdrop-blur border-r border-gray-200 p-6 flex flex-col gap-4 shadow-inner rounded-tr-3xl rounded-br-3xl mt-4 mb-4 ml-2 min-h-0 overflow-y-auto">
          <div className="flex items-center mb-2 gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-lg"><Plus className="w-4 h-4" /></span>
            <h3 className="text-lg font-semibold text-gray-900">Search Strings</h3>
          </div>
          <div className="flex flex-col flex-1 min-h-0 gap-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newString}
                onChange={(e) => setNewString(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addString()}
                placeholder="Add a search string..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 shadow"
              />
              <button
                onClick={addString}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
              {strings.map((string, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-100/80 rounded-lg transition-all shadow-sm"
                >
                  <span className="text-gray-700 flex-1 truncate">{string}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === strings.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="w-0.5 h-4 bg-gray-400 mx-3"></div>
                    <button
                      onClick={() => removeString(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Search Simulation */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-0 overflow-y-auto">
          <div
            className="w-full max-w-2xl aspect-square flex flex-col justify-center items-center rounded-3xl shadow-2xl border border-gray-100 p-12"
            style={{
              background: getCurrentBackground(),
              fontFamily: selectedFont
            }}
          >
            {/* Logo */}
            {showTitle && (
              <div className="text-center mb-12" style={{ fontFamily: selectedFont }}>
                <h1 className="text-6xl font-light text-gray-800">Search</h1>
              </div>
            )}

            {/* Modern Search Box */}
            <div className="relative w-full max-w-lg" style={{ fontFamily: selectedFont }}>
              <div className="flex items-center w-full px-6 py-4 text-lg border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:border-blue-300 transition-all bg-white backdrop-blur-sm relative">
                {iconPosition === 'left' && (
                  <span className="text-2xl mr-4 flex items-center h-8">{searchIcon}</span>
                )}
                <div className="flex-1 relative min-h-[32px] flex items-center">
                  <span className={`text-gray-900 text-lg leading-none align-middle flex items-center ${isTextSelected ? 'bg-blue-200' : ''}`}
                    style={{ minHeight: '1.5em' }}>
                    {displayText}
                    <span 
                      className={`inline-block align-middle ml-1 transition-opacity duration-200 w-[2px] h-[1.25em] bg-blue-600 ${typingState.showCursor ? 'opacity-100' : 'opacity-0'}`}
                      style={{ verticalAlign: 'middle' }}
                    />
                  </span>
                  {!displayText && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center h-full pointer-events-none pl-3" style={{ color: '#d1d5db' }}>
                      <span className="text-lg leading-none" style={{ color: '#d1d5db' }}>{placeholderText}</span>
                    </span>
                  )}
                </div>
                {iconPosition === 'right' && (
                  <span className="text-2xl ml-4 flex items-center h-8">{searchIcon}</span>
                )}
              </div>
            </div>

            {/* Search Buttons */}
            {showButtons && (
              <div className="flex justify-center space-x-4 mt-12" style={{ fontFamily: selectedFont }}>
                <button className="px-8 py-3 text-sm text-gray-700 bg-gray-50 rounded-xl hover:shadow-lg hover:bg-gray-100 transition-all border border-gray-200">
                  Search
                </button>
                <button className="px-8 py-3 text-sm text-gray-700 bg-gray-50 rounded-xl hover:shadow-lg hover:bg-gray-100 transition-all border border-gray-200">
                  I'm Feeling Lucky
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Settings */}
        <aside className="w-80 bg-white/70 backdrop-blur border-l border-gray-200 p-6 flex flex-col gap-6 shadow-inner rounded-tl-3xl rounded-bl-3xl mt-4 mb-4 mr-2 min-h-0 overflow-y-auto">
          <div className="space-y-6">
            {/* Animation Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap">
                  <Settings className="w-5 h-5" />
                  Animation Settings
                </h3>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                  {formatDuration(calculateVideoDuration())}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typing Speed: {typingSpeed}ms
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={typingSpeed}
                    onChange={(e) => setTypingSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delete Speed: {deleteSpeed}ms
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={deleteSpeed}
                    onChange={(e) => setDeleteSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pause Between: {pauseBetween}ms
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    value={pauseBetween}
                    onChange={(e) => setPauseBetween(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="loopAnimation"
                    checked={loopAnimation}
                    onChange={(e) => setLoopAnimation(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="loopAnimation" className="text-sm font-medium text-gray-700">
                    Loop Animation
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="keepLastString"
                    checked={keepLastString}
                    onChange={(e) => setKeepLastString(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="keepLastString" className="text-sm font-medium text-gray-700">
                    Keep Last String (Don't Delete)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fastDelete"
                    checked={fastDelete}
                    onChange={(e) => setFastDelete(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="fastDelete" className="text-sm font-medium text-gray-700">
                    Fast Delete (Select All & Delete)
                  </label>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap"><span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-lg"><Monitor className="w-4 h-4" /></span>Display Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showTitle"
                    checked={showTitle}
                    onChange={(e) => setShowTitle(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showTitle" className="text-sm font-medium text-gray-700">
                    Show "Search" Title
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showButtons"
                    checked={showButtons}
                    onChange={(e) => setShowButtons(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showButtons" className="text-sm font-medium text-gray-700">
                    Show Search Buttons
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Position
                  </label>
                  <select
                    value={iconPosition}
                    onChange={(e) => setIconPosition(e.target.value as 'left' | 'right')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={searchIcon}
                    onChange={(e) => setSearchIcon(e.target.value)}
                    placeholder="Enter emoji..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={placeholderText}
                    onChange={(e) => setPlaceholderText(e.target.value)}
                    placeholder="Enter placeholder text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Square Background
                  </label>
                  <select
                    value={backgroundStyle === 'solid' ? 'solid' : gradientType}
                    onChange={e => handleBackgroundChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {BACKGROUND_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} style={{ 
                        background: opt.style,
                        color: opt.value === 'solid' ? '#000' : '#fff',
                        padding: '8px'
                      }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Typography Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap"><span className="inline-flex items-center justify-center w-6 h-6 bg-pink-100 text-pink-600 rounded-lg"><Type className="w-4 h-4" /></span>Typography</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SORTED_FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <p className="text-lg" style={{ fontFamily: selectedFont }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modern Footer */}
      <footer className="mt-auto w-full bg-white/80 backdrop-blur border-t shadow-sm py-2">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          made by <a href="https://www.linkedin.com/in/fredlavigne/" target="_blank" rel="noopener noreferrer">fred</a> with his AI minions 🤖
          <div className="text-[10px] text-gray-300">built on {import.meta.env.VITE_BUILD_DATE || 'development'}</div>
        </div>
      </footer>
    </div>
  );
}

export default App;