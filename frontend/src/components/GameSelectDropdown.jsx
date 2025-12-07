import React, { useState, useEffect, useRef } from 'react';

// Map game names (lowercase, as stored in DB/API) to the path of their image files
const GAME_IMAGE_MAP = {
    'valorant': '/src/assets/games/valorant.png',
    'csgo': '/src/assets/games/cs2.png',
    'apex legends': '/src/assets/games/apex-legends.png',
    'overwatch': '/src/assets/games/overwatch.png',
    'rainbow six siege': '/src/assets/games/rainbow-6-siege.png',
    'destiny 2': '/src/assets/games/destiny2.png',
    'call of duty': '/src/assets/games/call-of-duty-warzone.png',
    'pubg': '/src/assets/games/pubg.png',
    'battlefield': '/src/assets/games/battlefield-6.png',
    'fortnite': '/src/assets/games/fortnite.png',
    // Add all other game mappings here
};

const GameSelectDropdown = ({ name, label, games, selectedGame, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); 
    const dropdownRef = useRef(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Function to determine image source based on capitalized game name
    const getGameImage = (gameName) => {
        const key = gameName.toLowerCase();
        return GAME_IMAGE_MAP[key] || '/src/assets/games/default.png'; 
    };
    
    const handleSelect = (game) => {
        onChange({ target: { name, value: game } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleButtonClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                const searchInput = dropdownRef.current.querySelector('input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 0);
        }
    };

    // --- Filter the games based on the search term ---
    const filteredGames = games.filter(game =>
        game.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedImage = getGameImage(selectedGame);
    
    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
                {label}
            </label>
            
            {/* Selector Button (Same as before) */}
            <button
                type="button"
                className={`w-full flex justify-between items-center px-4 py-2 border rounded-md shadow-sm bg-gray-700 text-white transition duration-150 
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-600'}`}
                onClick={() => !disabled && handleButtonClick()}
                disabled={disabled}
            >
                <div className="flex items-center space-x-3">
                    {selectedGame ? (
                        <>
                            <img 
                                src={selectedImage} 
                                alt={selectedGame} 
                                className="w-6 h-6 object-contain"
                            />
                            <span className="font-semibold">{selectedGame}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Select a Game</span>
                    )}
                </div>
                <svg 
                    className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                // Added custom scrollbar classes: 'scrollbar-thin' and custom colors
                <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-700 shadow-lg max-h-[264px] overflow-y-scroll glass-scrollbar 
                                origin-top transform transition-all duration-150 ease-out
                                opacity-0 translate-y-1
                                animate-dropdown">
                    
                    {/* Search Bar Input Container */}
                    <div className="p-2 sticky top-0 bg-gray-700 z-20">
                        <div className="relative">
                            <input
                                type="search"
                                placeholder="Search games..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                // Added pl-10 for the icon space
                                className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {/* Search Icon SVG */}
                            <svg 
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <ul className="py-1">
                        {filteredGames.length > 0 ? (
                            filteredGames.map((game) => (
                                <li
                                    key={game}
                                    className="flex items-center space-x-3 px-4 py-2 cursor-pointer hover:bg-gray-600 transition duration-100"
                                    onClick={() => handleSelect(game)}
                                >
                                    <img 
                                        src={getGameImage(game)} 
                                        alt={game} 
                                        className="w-6 h-6 object-contain"
                                    />
                                    <span>{game}</span>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-gray-400 text-center">
                                No games found.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default GameSelectDropdown;