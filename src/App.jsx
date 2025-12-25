import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { getQuestionsForDay } from './data/words';
import { Trophy, Frown, ArrowLeft, Star, Volume2, VolumeX, Loader2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Audio URLs
const AUDIO_URLS = {
  bgMusic: 'https://orangefreesounds.com/wp-content/uploads/2022/11/Funny-game-music.mp3',
  correct: 'https://www.orangefreesounds.com/wp-content/uploads/2014/10/Correct-answer.mp3',
  wrong: 'https://www.orangefreesounds.com/wp-content/uploads/2014/08/Wrong-answer-sound-effect.mp3'
};

// Animation Components
const SuccessAnimation = () => (
  <div className="anim-container" style={{background: '#E8F5E9'}}>
    <div className="jerry-run">🐭</div>
    <div className="hammer-hit">🔨</div>
    <div className="tom-dizzy">🐱</div>
  </div>
);

const FailAnimation = () => (
  <div className="anim-container" style={{background: '#FFEBEE'}}>
    <div className="tom-laugh" style={{textAlign:'center', marginTop: '20px'}}>🐱 Ha Ha!</div>
    <div className="jerry-scared">🐭</div>
  </div>
);

const LoadingScreen = ({ progress }) => (
  <div className="loading-screen" style={{
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
    background: 'rgba(255,255,255,0.9)', zIndex: 100,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
  }}>
    <div style={{fontSize: '4rem', marginBottom: '20px', animation: 'bounce 1s infinite'}}>🐭</div>
    <h2 style={{color: '#6D829B'}}>Loading Game...</h2>
    <div style={{
      width: '200px', height: '10px', background: '#ddd', borderRadius: '5px', overflow: 'hidden', marginTop: '10px'
    }}>
      <div style={{
        width: `${progress}%`, height: '100%', background: '#4caf50', transition: 'width 0.3s ease'
      }}></div>
    </div>
    <p style={{marginTop: '5px', color: '#666'}}>{Math.round(progress)}%</p>
  </div>
);

function App() {
  const [currentDay, setCurrentDay] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [dailyScores, setDailyScores] = useState({});
  const [showAnimation, setShowAnimation] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'
  const [isDayComplete, setIsDayComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Default to false (playing)
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Audio Refs - Using refs to keep instances
  const bgMusicRef = useRef(null);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);

  // Init Audio with Preload
  useEffect(() => {
    // Create audio instances
    bgMusicRef.current = new Audio(AUDIO_URLS.bgMusic);
    correctSoundRef.current = new Audio(AUDIO_URLS.correct);
    wrongSoundRef.current = new Audio(AUDIO_URLS.wrong);

    // Setup BG Music
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;
    
    // Setup SFX Preload
    correctSoundRef.current.preload = 'auto';
    wrongSoundRef.current.preload = 'auto';
    correctSoundRef.current.volume = 0.6;
    wrongSoundRef.current.volume = 0.6;

    // Try to play music immediately
    const playPromise = bgMusicRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Autoplay blocked. Waiting for user interaction.");
        const startAudio = () => {
          if (!isMuted) {
             bgMusicRef.current?.play().catch(() => {});
          }
          document.removeEventListener('click', startAudio);
        };
        document.addEventListener('click', startAudio);
      });
    }

    return () => {
      bgMusicRef.current?.pause();
    };
  }, []);

  // Handle Mute/Play BG Music
  useEffect(() => {
    if (!bgMusicRef.current) return;
    
    if (isMuted) {
      bgMusicRef.current.pause();
    } else {
      bgMusicRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  // Load scores
  useEffect(() => {
    const savedScores = localStorage.getItem('jerryDailyScores');
    if (savedScores) {
      setDailyScores(JSON.parse(savedScores));
    }
  }, []);

  // Save scores
  useEffect(() => {
    localStorage.setItem('jerryDailyScores', JSON.stringify(dailyScores));
  }, [dailyScores]);

  const preloadImages = async (questionList) => {
    setIsLoading(true);
    setLoadingProgress(0);
    let loadedCount = 0;
    const total = questionList.length;

    const promises = questionList.map(q => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = q.imageUrl;
        img.onload = () => {
          loadedCount++;
          setLoadingProgress((loadedCount / total) * 100);
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          setLoadingProgress((loadedCount / total) * 100);
          resolve();
        };
      });
    });

    await Promise.all(promises);
    setIsLoading(false);
  };

  const startDay = async (day) => {
    setCurrentDay(day);
    const newQuestions = getQuestionsForDay(DAYS.indexOf(day));
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setIsDayComplete(false);
    setFeedback(null);
    
    if (!isMuted && bgMusicRef.current) {
      bgMusicRef.current.play().catch(() => {});
    }

    await preloadImages(newQuestions);
  };

  const playSound = (type) => {
    if (isMuted) return;
    
    // Create a new Audio instance for SFX to allow overlapping sounds
    // and avoid "interrupted" errors if previous sound hasn't finished
    const url = type === 'correct' ? AUDIO_URLS.correct : AUDIO_URLS.wrong;
    const audio = new Audio(url);
    audio.volume = 0.6;
    audio.play().catch(e => console.log("SFX play failed", e));
  };

  const handleAnswer = (option) => {
    if (feedback) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctOption;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      setShowAnimation(true);
      playSound('correct');
      triggerConfetti();
      
      setTimeout(() => {
        setShowAnimation(false);
        nextQuestion();
      }, 2500);
    } else {
      setScore(prev => prev - 1);
      setFeedback('wrong');
      setShowAnimation(true);
      playSound('wrong');
      
      setTimeout(() => {
        setShowAnimation(false);
        nextQuestion();
      }, 2000);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishDay();
    }
  };

  const finishDay = () => {
    setIsDayComplete(true);
    setDailyScores(prev => ({
      ...prev,
      [currentDay]: score
    }));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#6D829B', '#D69D2D'] // Theme colors
    });
  };

  return (
    <div className="container" style={{position: 'relative'}}>
      {/* Sound Control - Adjusted Z-Index and Position to avoid overlap */}
      <button 
        onClick={() => setIsMuted(!isMuted)} 
        style={{
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          background: 'white', 
          border: '2px solid #ccc', 
          borderRadius: '50%', 
          padding: '8px',
          cursor: 'pointer',
          zIndex: 50, // Higher than header but lower than overlays
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {isLoading && <LoadingScreen progress={loadingProgress} />}

      {!currentDay || isDayComplete ? (
        <>
          <h1 style={{marginTop: '40px'}}>🐱 Tom & Jerry English 🐭</h1>
          <div className="selection-screen">
            <div className="week-selector">
              {DAYS.map(day => (
                <button
                  key={day}
                  className={`day-btn ${dailyScores[day] !== undefined ? 'completed' : ''}`}
                  onClick={() => startDay(day)}
                >
                  <div>{day.substring(0, 3)}</div>
                  {dailyScores[day] !== undefined && (
                    <div style={{fontSize: '0.9rem', color: dailyScores[day] > 0 ? '#2E7D32' : '#D32F2F', marginTop:'5px'}}>
                      {dailyScores[day]} pts
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="score-board">
               <h3 style={{margin:'0 0 10px 0', color: '#6D829B'}}>Weekly Stars</h3>
               <div style={{display:'flex', justifyContent:'center', gap:'10px', fontSize:'1.5rem'}}>
                 {Object.values(dailyScores).reduce((a,b)=>a+b, 0)} <Star fill="#FFD700" color="#D69D2D"/>
               </div>
            </div>
            
            {isDayComplete && (
               <div style={{marginTop: '20px'}}>
                  <button className="day-btn active" onClick={() => setCurrentDay(null)} style={{width: '100%'}}>
                    Back to Home
                  </button>
               </div>
            )}
          </div>
        </>
      ) : (
        !isLoading && (
        <div className="game-screen" style={{flex:1, display:'flex', flexDirection:'column'}}>
           {/* Header with extra padding-right to avoid sound icon overlap */}
           <div style={{
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems:'center', 
             marginBottom: '15px',
             paddingRight: '50px' // Added padding to avoid overlap with sound icon
           }}>
             <button onClick={() => setCurrentDay(null)} style={{background:'none', border:'none', cursor:'pointer', padding:'5px'}}>
                <ArrowLeft size={32} color="#4A5D73"/>
             </button>
             <div className="score-display" style={{fontSize:'1.2rem', fontWeight:'bold', background:'white', padding:'5px 15px', borderRadius:'20px', border:'2px solid #ddd'}}>
               <span style={{marginRight:'5px'}}>⭐</span>
               <span style={{color: score >= 0 ? '#4caf50' : '#f44336'}}>{score}</span>
             </div>
           </div>

           <div style={{textAlign:'center', marginBottom:'5px', color:'#666', fontSize:'0.9rem'}}>
             Question {currentIndex + 1} of {questions.length}
           </div>

           <div className="quiz-card">
              <div className="image-container">
                <img 
                   src={questions[currentIndex]?.imageUrl} 
                   alt={questions[currentIndex]?.word}
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'block';
                   }}
                   style={{
                     width: '100%', 
                     height: '100%', 
                     objectFit: 'contain', 
                   }}
                />
                <div style={{display: 'none', fontSize: '6rem', lineHeight: '150px'}}>
                  {questions[currentIndex]?.emoji}
                </div>
              </div>
              
              <div className="options-grid">
                {questions[currentIndex]?.options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`option-btn 
                      ${feedback === 'correct' && opt === questions[currentIndex].correctOption ? 'correct' : ''}
                      ${feedback === 'wrong' && opt === questions[currentIndex].correctOption ? 'correct' : ''}
                      ${feedback === 'wrong' && opt !== questions[currentIndex].correctOption ? 'wrong' : ''}
                    `} 
                    onClick={() => handleAnswer(opt)}
                    disabled={!!feedback}
                  >
                    {opt}
                  </button>
                ))}
              </div>
           </div>
        </div>
        )
      )}

      {showAnimation && (
        <div className="overlay">
          <div className="popup">
             {feedback === 'correct' ? (
                <>
                  <SuccessAnimation />
                  <h2 style={{color: '#4caf50'}}>Correct! +1</h2>
                </>
             ) : (
                <>
                  <FailAnimation />
                  <h2 style={{color: '#f44336'}}>Oops! -1</h2>
                </>
             )}
          </div>
        </div>
      )}
      
      {isDayComplete && (
        <div className="overlay">
          <div className="popup">
            <div style={{fontSize: '5rem'}}>🏆</div>
            <h2>Great Job!</h2>
            <p style={{fontSize:'1.5rem', fontWeight:'bold'}}>Score: {score}</p>
            <button 
              className="day-btn active" 
              onClick={() => setIsDayComplete(false)}
              style={{marginTop: '20px', width: '100%'}}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
