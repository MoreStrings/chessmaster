import { useNavigate } from "react-router-dom";
import { FaChess, FaRobot, FaTrophy, FaBook, FaUsers, FaLightbulb } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 flex items-center justify-center gap-4">
            <FaChess className="text-yellow-400" size={80} />
            <span className="bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent">
              ChessMaster
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Master the Game of Kings with AI-Powered Analysis, Puzzles, and Real-Time Evaluation
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition transform hover:scale-105"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* About ChessMaster Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            About <span className="text-yellow-400">ChessMaster</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold mb-4 text-yellow-400">What is ChessMaster?</h3>
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                ChessMaster is a comprehensive chess learning and training platform designed for players of all skill levels. Whether you're a beginner learning the fundamentals or an advanced player looking to improve your strategy, ChessMaster provides the tools you need to elevate your game.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Powered by advanced chess engines like Stockfish, our platform offers real-time analysis, interactive puzzles, and personalized learning paths to help you become a stronger player.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-8 rounded-xl flex items-center justify-center h-96">
              <FaChess size={200} className="text-white opacity-80" />
            </div>
          </div>

          {/* Features Grid */}
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <div className="bg-[#303030] p-8 rounded-xl hover:bg-[#3a3a3a] transition">
              <FaRobot className="text-blue-400 mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-300">
                Get instant analysis of your games with powerful chess engines. Understand every move, find blunders, and learn from mistakes with deep tactical evaluation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#303030] p-8 rounded-xl hover:bg-[#3a3a3a] transition">
              <FaBook className="text-green-400 mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Chess Puzzles</h3>
              <p className="text-gray-300">
                Practice tactical patterns with thousands of carefully curated puzzles. Improve your calculation ability and pattern recognition skills with daily challenges.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#303030] p-8 rounded-xl hover:bg-[#3a3a3a] transition">
              <FaTrophy className="text-yellow-400 mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Skill Assessment</h3>
              <p className="text-gray-300">
                Evaluate your current level and track progress over time. Compete with other players and earn achievements as you improve your rating.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#303030] p-8 rounded-xl hover:bg-[#3a3a3a] transition">
              <FaLightbulb className="text-purple-400 mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Opening Theory</h3>
              <p className="text-gray-300">
                Learn popular openings with comprehensive ECO classifications. Master opening principles and discover strategic ideas used by grandmasters.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#303030] p-8 rounded-xl hover:bg-[#3a3a3a] transition">
              <FaUsers className="text-red-400 mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Community</h3>
              <p className="text-gray-300">
                Join a thriving community of chess enthusiasts. Share games, discuss strategies, and learn from other players of all skill levels.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#303030] p-8 rounded-xl hover:bg-[#3a3a3a] transition">
              <FaChess className="text-cyan-400 mb-4" size={40} />
              <h3 className="text-2xl font-bold mb-3">Play & Train</h3>
              <p className="text-gray-300">
                Play against strong AI opponents at different difficulty levels. Train endgames, practice opening play, and improve your tactical vision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-[#303030]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-yellow-400 text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p className="text-gray-300">Create your account and select your skill level (Beginner, Intermediate, or Advanced)</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Learn & Practice</h3>
              <p className="text-gray-300">Access puzzles, study openings, and analyze games with AI-powered engine evaluations</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Play</h3>
              <p className="text-gray-300">Challenge AI opponents, play against the chess engine at various difficulty levels</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Improve</h3>
              <p className="text-gray-300">Track your progress, improve your rating, and become a stronger chess player</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ChessMaster */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Why Choose ChessMaster?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-yellow-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Powered by Stockfish</h3>
                  <p className="text-gray-300">One of the strongest chess engines in the world provides accurate analysis and evaluation</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-yellow-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Personalized Learning</h3>
                  <p className="text-gray-300">Get recommendations tailored to your skill level and learning goals</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-yellow-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Comprehensive Database</h3>
                  <p className="text-gray-300">Access thousands of puzzles and games from master players</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-yellow-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Real-Time Feedback</h3>
                  <p className="text-gray-300">Get instant analysis and suggestions as you play and learn</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-blue-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Free to Start</h3>
                  <p className="text-gray-300">Begin your chess journey completely free with access to core features</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-blue-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Multiple Difficulty Levels</h3>
                  <p className="text-gray-300">Play against AI at difficulty levels from beginner to grandmaster strength</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-blue-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Mobile Responsive</h3>
                  <p className="text-gray-300">Learn and play chess on any device with our responsive design</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-blue-400 text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Active Community</h3>
                  <p className="text-gray-300">Connect with thousands of chess players and share your passion for the game</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Ready to Master Chess?</h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-900">
            Join thousands of players improving their chess skills every day. Start your journey today!
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-black hover:bg-gray-900 text-white font-bold rounded-lg transition transform hover:scale-105"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-lg transition transform hover:scale-105"
            >
              Already a Member?
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#1a1a1a] border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaChess className="text-yellow-400" />
                ChessMaster
              </h3>
              <p className="text-gray-400">Master the game of kings with AI-powered analysis and training.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-400">About</a></li>
                <li><a href="#" className="hover:text-yellow-400">Features</a></li>
                <li><a href="#" className="hover:text-yellow-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Learn</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-400">Puzzles</a></li>
                <li><a href="#" className="hover:text-yellow-400">Openings</a></li>
                <li><a href="#" className="hover:text-yellow-400">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-yellow-400">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ChessMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
