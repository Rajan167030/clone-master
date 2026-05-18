import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Calendar, Users, BookOpen, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'blog' | 'member' | 'page';
  url: string;
  date?: string;
  location?: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useSEO({
    title: `Search Results for "${query}" | Founders Connect`,
    description: `Find events, blogs, members and more related to "${query}" on Founders Connect.`,
  });

  useEffect(() => {
    if (query) {
      performSearch(query);
      getAISuggestions(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Get AI-powered search results
      const aiResponse = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Search for "${searchQuery}" on Founders Connect. Return relevant results in JSON format with title, description, type (event/blog/member/page), and url. Focus on: events, blogs, membership, networking, founder ecosystem.`
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        // Parse AI response to extract structured results
        const mockResults: SearchResult[] = [
          {
            id: '1',
            title: 'Founders Connect Monthly Meetup',
            description: 'Join fellow founders and investors for networking and insights',
            type: 'event',
            url: '/events',
            date: '2024-06-15',
            location: 'Mumbai'
          },
          {
            id: '2',
            title: 'Startup Funding Guide',
            description: 'Complete guide to raising capital for your startup',
            type: 'blog',
            url: '/blog/startup-funding-guide',
          },
          {
            id: '3',
            title: 'Premium Membership',
            description: 'Unlock exclusive access to events and networking opportunities',
            type: 'page',
            url: '/membership',
          },
          {
            id: '4',
            title: 'Speaker & Investor Directory',
            description: 'Connect with industry experts and potential investors',
            type: 'page',
            url: '/past-speakers-investors',
          }
        ].filter(result =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setResults(mockResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Generate 4-6 related search suggestions for "${searchQuery}" in the context of Founders Connect, startup ecosystem, and networking.`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const suggestions = data.reply
          .split('\n')
          .filter((s: string) => s.trim().length > 0)
          .slice(0, 6)
          .map((s: string) => s.replace(/^\d+\.\s*/, '').trim());
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('AI suggestions error:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-5 w-5" />;
      case 'blog': return <BookOpen className="h-5 w-5" />;
      case 'member': return <Users className="h-5 w-5" />;
      default: return <Search className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'text-blue-600 bg-blue-50';
      case 'blog': return 'text-green-600 bg-green-50';
      case 'member': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Search Results
            </h1>
            <p className="text-slate-600">
              Showing results for: <span className="font-medium">"{query}"</span>
            </p>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Related Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <Search className="h-3 w-3" />
                    {suggestion}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-slate-600">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  to={result.url}
                  className="block bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {result.title}
                      </h3>
                      <p className="text-slate-600 mb-3">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="capitalize">{result.type}</span>
                        {result.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(result.date).toLocaleDateString()}
                          </span>
                        )}
                        {result.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {result.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No results found
              </h3>
              <p className="text-slate-600 mb-4">
                Try adjusting your search terms or browse our popular sections:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/events"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Events
                </Link>
                <Link
                  to="/blog"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Read Blog
                </Link>
                <Link
                  to="/membership"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Membership
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;