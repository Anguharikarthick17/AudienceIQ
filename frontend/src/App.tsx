import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Dashboard from '@/pages/Dashboard'
import Upload from '@/pages/Upload'
import Segments from '@/pages/Segments'
import Analyze from '@/pages/Analyze'
import ModelPage from '@/pages/ModelPage'
import Counterfactual from '@/pages/Counterfactual'
import Contradiction from '@/pages/Contradiction'
import Migration from '@/pages/Migration'
import ContentGaps from '@/pages/ContentGaps'
import RecommendationsPage from '@/pages/RecommendationsPage'

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    className="flex-1 overflow-y-auto"
  >
    {children}
  </motion.div>
)

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/upload" element={<PageTransition><Upload /></PageTransition>} />
              <Route path="/segments" element={<PageTransition><Segments /></PageTransition>} />
              <Route path="/analyze" element={<PageTransition><Analyze /></PageTransition>} />
              <Route path="/model" element={<PageTransition><ModelPage /></PageTransition>} />
              <Route path="/counterfactual" element={<PageTransition><Counterfactual /></PageTransition>} />
              <Route path="/contradiction" element={<PageTransition><Contradiction /></PageTransition>} />
              <Route path="/migration" element={<PageTransition><Migration /></PageTransition>} />
              <Route path="/content-gaps" element={<PageTransition><ContentGaps /></PageTransition>} />
              <Route path="/recommendations" element={<PageTransition><RecommendationsPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </BrowserRouter>
  )
}
