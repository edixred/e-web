import { useState, useMemo } from 'react'
import { Search, BookOpen, Loader2 } from 'lucide-react'

const vocabularyData = {
  A1: [
    { term: "house", translation: "casa", example: "I live in a big house.", category: "sustantivos" },
    { term: "cat", translation: "gato", example: "The cat is sleeping.", category: "sustantivos" },
    { term: "run", translation: "correr", example: "I like to run in the morning.", category: "verbos" },
    { term: "happy", translation: "feliz", example: "She is very happy today.", category: "adjetivos" },
    { term: "water", translation: "agua", example: "I drink water every day.", category: "sustantivos" },
    { term: "eat", translation: "comer", example: "We eat breakfast at 8am.", category: "verbos" },
    { term: "good morning", translation: "buenos días", example: "Good morning! How are you?", category: "modismos" },
    { term: "book", translation: "libro", example: "This book is very interesting.", category: "sustantivos" }
  ],
  A2: [
    { term: "beautiful", translation: "hermoso", example: "The garden is beautiful.", category: "adjetivos" },
    { term: "understand", translation: "entender", example: "I understand what you mean.", category: "verbos" },
    { term: "restaurant", translation: "restaurante", example: "Let's go to that restaurant.", category: "sustantivos" },
    { term: "yesterday", translation: "ayer", example: "I went to the market yesterday.", category: "adverbios" },
    { term: "travel", translation: "viajar", example: "I love to travel around the world.", category: "verbos" },
    { term: "different", translation: "diferente", example: "Each person is different.", category: "adjetivos" },
    { term: "how are you", translation: "cómo estás", example: "How are you doing today?", category: "modismos" },
    { term: "family", translation: "familia", example: "My family lives in Madrid.", category: "sustantivos" }
  ],
  B1: [
    { term: "achieve", translation: "lograr", example: "She achieved her goals.", category: "verbos" },
    { term: "environment", translation: "medio ambiente", example: "We must protect the environment.", category: "sustantivos" },
    { term: "immediately", translation: "inmediatamente", example: "Please call me immediately.", category: "adverbios" },
    { term: "challenging", translation: "desafiante", example: "This is a challenging task.", category: "adjetivos" },
    { term: "in conclusion", translation: "en conclusión", example: "In conclusion, we need more time.", category: "modismos" },
    { term: "government", translation: "gobierno", example: "The government made a decision.", category: "sustantivos" },
    { term: "develop", translation: "desarrollar", example: "We need to develop new skills.", category: "verbos" },
    { term: "according to", translation: "según", example: "According to the news, it will rain.", category: "modismos" }
  ],
  B2: [
    { term: "sophisticated", translation: "sofisticado", example: "This is a sophisticated system.", category: "adjetivos" },
    { term: "nevertheless", translation: "sin embargo", example: "Nevertheless, we continued.", category: "conectores" },
    { term: "substantial", translation: "sustancial", example: "We made substantial progress.", category: "adjetivos" },
    { term: "implement", translation: "implementar", example: "We need to implement this plan.", category: "verbos" },
    { term: "by the way", translation: "a propósito", example: "By the way, did you see the news?", category: "modismos" },
    { term: "consequently", translation: "consecuentemente", example: "Consequently, prices increased.", category: "conectores" },
    { term: "hypothesis", translation: "hipótesis", example: "This is just a hypothesis.", category: "sustantivos" },
    { term: "manufacture", translation: "fabricar", example: "They manufacture cars here.", category: "verbos" }
  ],
  C1: [
    { term: "comprehensive", translation: "integral", example: "We need a comprehensive analysis.", category: "adjetivos" },
    { term: "whereas", translation: "mientras que", example: "Whereas some agree, others disagree.", category: "conectores" },
    { term: "methodology", translation: "metodología", example: "The methodology is clear.", category: "sustantivos" },
    { term: "ubiquitous", translation: "omnipresente", example: "Smartphones are ubiquitous today.", category: "adjetivos" },
    { term: "take for granted", translation: "dar por sentado", example: "We should not take it for granted.", category: "modismos" },
    { term: "paradigm", translation: "paradigma", example: "This represents a new paradigm.", category: "sustantivos" },
    { term: "facilitate", translation: "facilitar", example: "Technology can facilitate learning.", category: "verbos" },
    { term: "in spite of", translation: "a pesar de", example: "In spite of the rain, we went out.", category: "conectores" }
  ]
}

const categoryColors = {
  sustantivos: 'bg-blue-100 text-blue-700',
  verbos: 'bg-green-100 text-green-700',
  adjetivos: 'bg-purple-100 text-purple-700',
  adverbios: 'bg-orange-100 text-orange-700',
  modismos: 'bg-pink-100 text-pink-700',
  conectores: 'bg-cyan-100 text-cyan-700'
}

const levelColors = {
  A1: 'bg-green-100 text-green-700 hover:bg-green-200',
  A2: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  B1: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  B2: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  C1: 'bg-red-100 text-red-700 hover:bg-red-200'
}

const Vocabulary = () => {
  const [levelFilter, setLevelFilter] = useState('A1')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredWords = useMemo(() => {
    const words = vocabularyData[levelFilter] || []
    if (!searchTerm) return words
    const term = searchTerm.toLowerCase()
    return words.filter(word => 
      word.term.toLowerCase().includes(term) ||
      word.translation.toLowerCase().includes(term) ||
      word.category.toLowerCase().includes(term)
    )
  }, [levelFilter, searchTerm])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Vocabulary Bank</h1>
        <p className="text-slate-600 mt-2">Learn and practice vocabulary by level</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {['A1', 'A2', 'B1', 'B2', 'C1'].map((level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  levelFilter === level 
                    ? 'bg-primary text-white' 
                    : levelColors[level]
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search words, translations or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No words found</p>
          <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-semibold text-slate-800">{word.term}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[word.category] || 'bg-slate-100 text-slate-700'}`}>
                  {word.category}
                </span>
              </div>
              
              <p className="text-primary font-medium mb-2">{word.translation}</p>
              
              <p className="text-sm text-slate-600 italic border-l-2 border-primary/30 pl-3">
                "{word.example}"
              </p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-slate-500">
        Showing {filteredWords.length} words for level {levelFilter}
      </div>
    </div>
  )
}

export default Vocabulary
