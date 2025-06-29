import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Trash2, Settings, ChevronUp, ChevronDown } from 'lucide-react';

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

  const timeoutRef = useRef<NodeJS.Timeout>();
  const cursorIntervalRef = useRef<NodeJS.Timeout>();

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
      
      // Pause between strings (except after the last string)
      const pauseTime = index < strings.length - 1 ? pauseBetween : 0;
      
      totalTime += typingTime + deletionTime + pauseTime;
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Control Panel */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Search Typing Simulator</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlay}
                disabled={typingState.isPlaying || strings.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Play
              </button>
              <button
                onClick={handlePause}
                disabled={!typingState.isPlaying}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </button>
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Left Sidebar - Search Strings */}
        <div className="w-80 bg-white shadow-sm border-r p-6 overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Strings</h3>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newString}
                onChange={(e) => setNewString(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addString()}
                placeholder="Add a search string..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addString}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {strings.map((string, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-lg transition-all"
                >
                  <span className="text-gray-700 flex-1">{string}</span>
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
        </div>

        {/* Center - Search Simulation */}
        <div className="flex-1 flex items-center justify-center p-8">
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
                  <span className={`text-gray-900 text-lg leading-none ${isTextSelected ? 'bg-blue-200' : ''}`}>
                    {displayText}
                    <span 
                      className={`inline-block w-0.5 h-6 bg-blue-600 ml-1 ${
                        typingState.showCursor ? 'opacity-100' : 'opacity-0'
                      } transition-opacity`}
                    />
                  </span>
                  {!displayText && (
                    <span className="absolute left-0 top-0 flex items-center h-full pointer-events-none" style={{ color: '#d1d5db' }}>
                      <span className="text-lg" style={{ color: '#d1d5db' }}>{placeholderText}</span>
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
        <div className="w-80 bg-white shadow-sm border-l p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Animation Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Animation Settings
                </h3>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                  Duration: {formatDuration(calculateVideoDuration())}
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
              <h3 className="text-lg font-medium text-gray-900">Display Settings</h3>
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
              <h3 className="text-lg font-medium text-gray-900">Typography</h3>
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
                    {FONT_OPTIONS.map((font) => (
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
        </div>
      </div>
    </div>
  );
}

export default App;