import React from 'react';
import { BookOpen } from 'lucide-react';
import { getStoredUserData } from '../utils/localStorage';

const LibraryPage: React.FC = () => {
  const userData = getStoredUserData();
  const { savedLibrary } = userData;

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <BookOpen className="h-8 w-8 text-medical-600" />
          <h1 className="text-3xl font-bold text-gray-900">Your Library</h1>
        </div>
        
        {savedLibrary.length > 0 ? (
          <div className="grid gap-4">
            {savedLibrary.map(item => (
              <div key={item.id} className="card bg-white border border-gray-200 shadow-sm">
                <div className="card-body p-6">
                  <h3 className="card-title text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                    <span className="font-medium">{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.publicationDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{item.abstract}</p>
                  <div className="card-actions justify-end">
                    <button
                      onClick={() => window.open(item.url, '_blank')}
                      className="btn btn-primary btn-sm"
                    >
                      Open Article
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your library is empty</h3>
            <p className="text-gray-600 mb-6">
              Start saving articles from your search results to build your personal research library.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-primary"
            >
              Start Searching
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;