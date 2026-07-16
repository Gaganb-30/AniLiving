import { motion } from 'framer-motion';
const SearchResultsPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-text mb-2">Search Results</h1>
      <p className="text-text-muted mb-8">Results will appear here based on your search query.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden animate-pulse">
            <div className="h-40 bg-accent-light" />
            <div className="p-4 space-y-2"><div className="h-4 bg-accent rounded w-3/4" /><div className="h-3 bg-accent rounded w-1/2" /></div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);
export default SearchResultsPage;
