import { useState, useEffect, useMemo, useRef } from 'react'
import { BookOpen, Clock, RefreshCw, ArrowRight, Trophy, Layers, Target, CheckCircle, XCircle } from 'lucide-react'

const travelVocabulary = {
  A1: [
    { term: "car", translation: "coche" }, { term: "bus", translation: "autobús" },
    { term: "train", translation: "tren" }, { term: "bicycle", translation: "bicicleta" },
    { term: "airplane", translation: "avión" }, { term: "walking", translation: "caminar" },
    { term: "street", translation: "calle" }, { term: "beach", translation: "playa" },
    { term: "road", translation: "carretera" }, { term: "taxi", translation: "taxi" },
    { term: "hotel", translation: "hotel" }, { term: "map", translation: "mapa" },
    { term: "ticket", translation: "billete" }, { term: "luggage", translation: "equipaje" },
    { term: "travel", translation: "viajar" }, { term: "trip", translation: "viaje" }
  ],
  A2: [
    { term: "airport", translation: "aeropuerto" }, { term: "train station", translation: "estación de tren" },
    { term: "ferry", translation: "transbordador" }, { term: "tram", translation: "tranvía" },
    { term: "helicopter", translation: "helicóptero" }, { term: "ride a bike", translation: "montar en bici" },
    { term: "book a ticket", translation: "reservar un billete" }, { term: "check-in", translation: "registro" },
    { term: "departure", translation: "salida" }, { term: "arrival", translation: "llegada" },
    { term: "passenger", translation: "pasajero" }, { term: "suitcase", translation: "maleta" },
    { term: "platform", translation: "andén" }, { term: "schedule", translation: "horario" },
    { term: "to depart", translation: "partir" }, { term: "to arrive", translation: "llegar" }
  ],
  B1: [
    { term: "destination", translation: "destino" }, { term: "itinerary", translation: "itinerario" },
    { term: "sightseeing", translation: "turismo" }, { term: "currency exchange", translation: "cambio de moneda" },
    { term: "delay", translation: "retraso" }, { term: "connecting flight", translation: "vuelo de conexión" },
    { term: "double-decker bus", translation: "autobús de dos pisos" }, { term: "rush hour", translation: "hora punta" },
    { term: "boarding pass", translation: "tarjeta de embarque" }, { term: "luggage allowance", translation: "equipaje permitido" },
    { term: "to make a reservation", translation: "reservar" }, { term: "to cancel a flight", translation: "cancelar un vuelo" },
    { term: "terminal", translation: "terminal" }, { term: "gate", translation: "puerta" },
    { term: "to board", translation: "embarcar" }, { term: "layover", translation: "escala" }
  ],
  B2: [
    { term: "all-inclusive", translation: "todo incluido" }, { term: "off-the-beaten-path", translation: "fuera de lo común" },
    { term: "global village", translation: "aldea global" }, { term: "jet lag", translation: "desfase horario" },
    { term: "wanderlust", translation: "ansia de viajar" }, { term: "hitchhiking", translation: "autostop" },
    { term: "to go off-road", translation: "ir campo través" }, { term: "eco-tourism", translation: "ecoturismo" },
    { term: "to embark on", translation: "embarcarse en" }, { term: "to set foot in", translation: "poner pie en" },
    { term: "to catch a flight", translation: "tomar un vuelo" }, { term: "to travel light", translation: "viajar ligero" },
    { term: "to get lost", translation: "perderse" }, { term: "to explore", translation: "explorar" },
    { term: "wilderness", translation: "áreas salvajes" }, { term: "adventure", translation: "aventura" }
  ],
  C1: [
    { term: "to traverse", translation: "atravesar" }, { term: "to venture", translation: "aventurarse" },
    { term: "to wander", translation: "deambular" }, { term: "expedition", translation: "expedición" },
    { term: "pilgrimage", translation: "peregrinación" }, { term: "to sojourn", translation: "residir temporalmente" },
    { term: "to odyssey", translation: "viajar épicamente" }, { term: "to discover", translation: "descubrir" },
    { term: "to circumvent", translation: "evitar" }, { term: "to embark", translation: "embarcarse" },
    { term: "itinerary", translation: "itinerario" }, { term: "nomadic", translation: "nómada" },
    { term: "to jaunt", translation: "viajar brevemente" }, { term: "to peregrinate", translation: "peregrinar" },
    { term: "sojourn", translation: "estancia temporal" }, { term: "to roam", translation: "deambular" }
  ]
}

const CARDS_ON_BOARD = 8
const PAIRS_ON_BOARD = CARDS_ON_BOARD / 2

const VocabularyMatch = ({ selectedLevel = 'A1', onComplete }) => {
  const [level, setLevel] = useState(selectedLevel)
  const [boardCards, setBoardCards] = useState([])
  const [selectedCards, setSelectedCards] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [shuffling, setShuffling] = useState(false)
  const [remainingWords, setRemainingWords] = useState([])
  const [totalMatched, setTotalMatched] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [correctMatches, setCorrectMatches] = useState(0)
  const [shakeCards, setShakeCards] = useState([])
  const [newCardIds, setNewCardIds] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const matchedRef = useRef(new Set())

  const vocabList = useMemo(() => travelVocabulary[level] || travelVocabulary.A1, [level])
  const totalWords = vocabList.length

  useEffect(() => {
    initializeGame(selectedLevel)
  }, [selectedLevel])

  useEffect(() => {
    let interval
    if (isActive && !isComplete) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, isComplete])

  const initializeGame = (lvl) => {
    setShuffling(true)
    setTimeout(() => {
      const vocab = travelVocabulary[lvl] || travelVocabulary.A1
      const shuffled = [...vocab].sort(() => Math.random() - 0.5)
      setRemainingWords(shuffled)
      
      const initialCards = getCardsForBoard(shuffled, [])
      setBoardCards(initialCards)
      
      setSelectedCards([])
      setMatchedPairs([])
      setTotalMatched(0)
      setAttempts(0)
      setCorrectMatches(0)
      setTimer(0)
      setIsActive(true)
      setIsComplete(false)
      setLevelCompleted(false)
      setShowResults(false)
      matchedRef.current = new Set()
      setShuffling(false)
    }, 300)
  }

  const getCardsForBoard = (remaining, matchedIds) => {
    const availableWords = remaining.slice(0, CARDS_ON_BOARD / 2)
    let cards = []
    
    availableWords.forEach((word, idx) => {
      if (!matchedRef.current.has(word.term)) {
        cards.push({ id: `term-${word.term}`, content: word.term, type: 'term', pairKey: word.term })
        cards.push({ id: `trans-${word.term}`, content: word.translation, type: 'translation', pairKey: word.term })
      }
    })
    
    return cards.sort(() => Math.random() - 0.5)
  }

  const handleCardClick = (card) => {
    if (isComplete || !isActive) return
    if (selectedCards.find(c => c.id === card.id)) return
    if (matchedRef.current.has(card.pairKey)) return

    const newSelected = [...selectedCards, card]
    setSelectedCards(newSelected)
    setAttempts(prev => prev + 1)

    if (newSelected.length === 2) {
      const [first, second] = newSelected
      const isMatch = first.pairKey === second.pairKey && first.type !== second.type

      if (isMatch) {
        setCorrectMatches(prev => prev + 1)
        matchedRef.current.add(first.pairKey)
        setMatchedPairs([...matchedPairs, first.pairKey])
        
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, first.pairKey])
          
          const newRemaining = remainingWords.filter(w => w.term !== first.pairKey)
          setRemainingWords(newRemaining)
          setTotalMatched(prev => prev + 1)
          
          const remainingCount = newRemaining.length
          
          if (remainingCount === 0) {
            setIsComplete(true)
            setIsActive(false)
            setTimeout(() => {
              setShowResults(true)
              setLevelCompleted(true)
            }, 500)
            if (onComplete) onComplete(timer)
          } else {
            const newCards = getCardsForBoard(newRemaining, [])
            setNewCardIds(newCards.map(c => c.id))
            setBoardCards(newCards)
            
            setTimeout(() => setNewCardIds([]), 500)
          }
        }, 800)
        
        setSelectedCards([])
      } else {
        setShakeCards([first.id, second.id])
        setTimeout(() => {
          setSelectedCards([])
          setShakeCards([])
        }, 500)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getNextLevel = () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1']
    const idx = levels.indexOf(level)
    return idx < levels.length - 1 ? levels[idx + 1] : 'A1'
  }

  const accuracy = attempts > 0 ? Math.round((correctMatches / attempts) * 100) : 100
  const progress = (totalMatched / totalWords) * 100

  const handleRetry = () => initializeGame(level)
  const handleNextLevel = () => {
    const next = getNextLevel()
    setLevel(next)
    initializeGame(next)
  }

  const getCardClass = (card) => {
    const isMatched = matchedRef.current.has(card.pairKey)
    const isSelected = selectedCards.find(c => c.id === card.id)
    const isShaking = shakeCards.includes(card.id)
    const isNew = newCardIds.includes(card.id)
    
    let baseClass = `p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-center text-center font-medium min-h-[70px] select-none`
    
    if (isShaking) {
      return `${baseClass} bg-red-100 border-red-400 text-red-700 animate-shake`
    }
    
    if (isMatched) {
      return `${baseClass} bg-green-50 border-green-300 text-green-600 opacity-0 pointer-events-none`
    }
    
    if (isSelected) {
      return `${baseClass} bg-slate-50 border-slate-500 text-slate-800 ring-2 ring-blue-500 ring-offset-2`
    }
    
    if (isNew) {
      return `${baseClass} bg-white border-slate-200 text-slate-700 animate-fade-in hover:border-slate-400 hover:scale-105`
    }
    
    return `${baseClass} bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:scale-105 hover:shadow-md`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>
      
      <div className="bg-gradient-to-r from-primary to-blue-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Vocabulary Match</h3>
              <p className="text-blue-100 text-sm">Level {level}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
              <span className="text-white font-mono font-semibold">{formatTime(timer)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white/80 text-xs mt-1 text-right">
          {totalMatched} / {totalWords} palabras
        </div>
      </div>

      <div className="p-4">
        {shuffling ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : showResults ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Trophy className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-slate-800 mb-2">¡Nivel {level} completado!</h4>
            
            <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <Target className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-800">{totalWords}</p>
                <p className="text-xs text-slate-500">Palabras</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-secondary mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-800">{formatTime(timer)}</p>
                <p className="text-xs text-slate-500">Tiempo</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-800">{accuracy}%</p>
                <p className="text-xs text-slate-500">Precisión</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Repasar
              </button>
              <button
                onClick={handleNextLevel}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Siguiente Nivel
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {boardCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  disabled={matchedRef.current.has(card.pairKey) || isComplete}
                  className={getCardClass(card)}
                >
                  <span className="text-xs sm:text-sm font-medium">{card.content}</span>
                </button>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>{remainingWords.length} palabras restantes</span>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 text-primary hover:text-primary-dark"
              >
                <RefreshCw className="h-4 w-4" />
                Reiniciar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VocabularyMatch
