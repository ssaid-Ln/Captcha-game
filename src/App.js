import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Constantes centralisées
const SIGNS = ["Snow", "Moon", "Nuages", "Wind"];
const TOTAL_CARDS = 32;
const CARDS_PER_SIGN = 8;

// Génération de la liste complète des objets
const objectsList = Array.from({ length: TOTAL_CARDS }, (_, index) => {
  const num = (index % CARDS_PER_SIGN) + 1;
  const sign = SIGNS[Math.floor(index / CARDS_PER_SIGN)];
  return {
    num,
    sign,
    url: `/Cartes/${sign}/${num}.svg`,
  };
});

const App = () => {
  const [sequence, setSequence] = useState([]);
  const [options, setOptions] = useState([]);
  const [missingElement, setMissingElement] = useState(null);
  const [message, setMessage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);

  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const generateSequence = useCallback(() => {
    const firstCardNum = Math.floor(Math.random() * 5) + 1;
    const numbers = Array.from({ length: 4 }, (_, i) => firstCardNum + i);
    const usedSigns = [...SIGNS];
    const sortedSequence = numbers.map(num => {
      const signIndex = Math.floor(Math.random() * usedSigns.length);
      const sign = usedSigns.splice(signIndex, 1)[0];
      return {
        num,
        sign,
        url: `/Cartes/${sign}/${num}.svg`
      };
    });

    const missingIndex = Math.floor(Math.random() * 4);
    const missingElement = sortedSequence[missingIndex];
    sortedSequence[missingIndex] = null;

    return { sequence: sortedSequence, missingElement };
  }, []);

  const generateOptions = useCallback((correctAnswer) => {
    const options = [correctAnswer];
    const usedNums = new Set([correctAnswer.num]);

    while (options.length < 4) {
      const randomOption = getRandomElement(objectsList);
      if (!usedNums.has(randomOption.num)) {
        options.push(randomOption);
        usedNums.add(randomOption.num);
      }
    }

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }, []);

  const generateChallenge = useCallback(() => {
    const { sequence, missingElement } = generateSequence();
    const options = generateOptions(missingElement);

    setGameStarted(true);
    setSequence(sequence);
    setOptions(options);
    setMissingElement(missingElement);
    setMessage("");
  }, [generateSequence, generateOptions]);

  const handleOptionClick = useCallback((selectedOption) => {
    if (!missingElement) return;

    if (selectedOption.num === missingElement.num) {
      setMessage("Correct! Vous avez sélectionné le bon nombre.");
    } else {
      setMessage("Mauvais choix. Réessayez !");
    }
  }, [missingElement]);

  const renderSequenceCards = useMemo(() => {
    return sequence.map((card, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.2 }}
        className="relative w-16 h-24 md:w-24 md:h-36 flex items-center justify-center border-2 border-gray-300 rounded-lg bg-white"
      >
        {card ? (
          <motion.img
            src={card.url}
            alt={`${card.sign} ${card.num}`}
            className="w-full h-full object-contain p-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.2 + 0.2, type: "spring", stiffness: 200 }}
          />
        ) : (
          <motion.span 
            className="text-3xl text-gray-400"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.2 + 0.2, type: "spring" }}
          >
            ?
          </motion.span>
        )}
      </motion.div>
    ));
  }, [sequence]);

  const renderOptionCards = useMemo(() => {
    return options.map((option, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 + index * 0.15 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleOptionClick(option)}
        className="w-16 h-24 md:w-24 md:h-36 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white hover:shadow-lg"
      >
        <img
          src={option.url}
          alt={`${option.sign} ${option.num}`}
          className="w-full h-full object-contain p-1"
        />
      </motion.div>
    ));
  }, [options, handleOptionClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-4 flex items-center justify-center"
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <motion.div 
            className="space-y-4"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            <h1 className="text-xl font-semibold text-center text-gray-800">
              Prouvez que vous n'êtes pas un robot
            </h1>
            <div className="text-sm text-gray-600 text-center space-y-1">
              <p>Sélectionnez la carte manquante dans la séquence.</p>
              <p className="text-xs">Les cartes suivent une séquence numérique croissante.</p>
            </div>
          </motion.div>

          <motion.button
            onClick={generateChallenge}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {gameStarted ? "Générer une nouvelle séquence" : "Commencer la vérification"}
          </motion.button>

          <AnimatePresence>
            {gameStarted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center gap-2 md:gap-4">
                    {renderSequenceCards}
                  </div>
                </div>

                <div className="flex justify-center gap-2 md:gap-4">
                  {renderOptionCards}
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-3 rounded-lg text-center text-sm ${
                        message.includes("Correct") 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="text-xs text-gray-400 text-center">
            Cliquez sur une carte pour la sélectionner
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default App;