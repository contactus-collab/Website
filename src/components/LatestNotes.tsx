import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Note } from '../types/supabase'

export default function LatestNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      // Fetch notes from Supabase
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) throw error
      
      // If no data from Supabase, use sample data
      if (!data || data.length === 0) {
        setNotes(sampleNotes)
      } else {
        setNotes(data as Note[])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      // Fallback to sample data if Supabase fails
      setNotes(sampleNotes)
    } finally {
      setLoading(false)
    }
  }

  const sampleNotes: Note[] = [
    {
      id: 1,
      title: 'Understanding Neurodevelopmental Disorders: A Guide for Families',
      date: new Date().toISOString().split('T')[0],
      excerpt: 'Neurodevelopmental Disorders (ND) affect how children learn, communicate, and interact with the world. This comprehensive guide helps families understand autism, ADHD, dyslexia, and other conditions, providing clarity and hope for the journey ahead.',
      featured: true,
    },
    {
      id: 2,
      title: 'Supporting Your Child\'s Social and Emotional Development',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excerpt: 'Every child develops at their own pace. For children with neurodevelopmental differences, social and emotional growth may look different. Learn practical strategies to nurture confidence, friendship skills, and emotional regulation.',
    },
    {
      id: 3,
      title: 'Navigating School Support Systems for Children with ND',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excerpt: 'Accessing the right educational support can transform your child\'s school experience. This article explains IEPs, 504 plans, classroom accommodations, and how to work effectively with educators to ensure your child thrives.',
    },
    {
      id: 4,
      title: 'Creating Inclusive Play Opportunities for All Children',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excerpt: 'Play is essential for every child\'s development. Discover how to create inclusive play spaces and activities that welcome children with neurodevelopmental differences, fostering friendships and building skills through fun.',
    },
  ]

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary-100 rounded-full px-4 py-1 mb-4">
            <span className="text-primary-700 font-semibold text-sm uppercase tracking-wide">📝 Latest Articles</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Notes
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Discover articles and insights about Neurodevelopmental Disorders (ND) that support your journey and help children thrive.
          </p>
          <div className="w-24 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {notes.map((note, index) => (
              <div
                key={note.id || index}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group ${
                  note.featured ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {note.featured && (
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2">
                    <span className="text-sm font-semibold inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Featured Article
                    </span>
                  </div>
                )}
                <div className={`p-6 ${note.featured ? '' : 'h-full flex flex-col'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      {formatDate(note.date) || note.date}
                    </p>
                  </div>
                  <h3 className={`font-semibold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors duration-300 ${
                    note.featured ? 'text-2xl' : 'text-xl'
                  }`}>
                    {note.title}
                  </h3>
                  <p className={`text-gray-700 mb-4 leading-relaxed flex-grow ${
                    note.featured ? 'text-base' : 'text-sm line-clamp-3'
                  }`}>
                    {note.excerpt}
                  </p>
                  <Link
                    to={`/notes/${note.id || index}`}
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group-hover:gap-3 duration-300"
                  >
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View All Notes
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

